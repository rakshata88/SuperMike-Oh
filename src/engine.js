import {updateDog,hitDog,updateProjectiles,updateBarrel} from './dogs.js';
import {FLOOR} from './level.js';
import {createWorld,levels} from './levels.js';
import {currentPlayerForm} from './forms.js';
import {advanceGait} from './gait.js';
export const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export class Game {
  constructor(onEvent=()=>{}){this.onEvent=onEvent;this.mode='menu';this.time=0;this.camera=0;this.viewWidth=1280;this.particles=[];this.reset();this.mode='menu'}
  reset(save=null,levelId=save?.levelId||1){
    this.levelId=levels[levelId]?levelId:1;this.main=createWorld(this.levelId);this.cavern=createWorld(this.levelId,true);this.level=this.main;this.player={...this.main.spawn,w:34,h:59,vx:0,vy:0,grounded:false,face:1,super:false,invuln:0,attack:0,duck:false};
    this.coins=save?.coins||0;this.score=save?.score||0;this.paws=save?.paws||0;this.lives=save?.lives||3;this.elapsed=save?.elapsed||0;this.kills=save?.kills||0;this.checkpoint=save?.checkpoint||0;this.maxX=save?.maxX||150;this.collected=new Set(save?.collected||[]);
    for(const l of [this.main,this.cavern])for(const it of l.items)it.taken=this.collected.has(it.id);
    for(const l of [this.main,this.cavern])for(const s of l.platforms)if(s.id)s.used=this.collected.has(s.id);
    this.projectiles=[];this.landingNoise=0;this.bossDefeated=!!save?.bossDefeated;if(this.main.boss&&this.bossDefeated){this.main.boss.hp=0;this.main.boss.state='defeated';this.main.gateOpen=true}this.buffs={speed:0,blessing:0,multiplier:0,jump:0,bell:0};this.jumpBuffer=0;this.coyote=0;this.pipeDwell=0;this.transform=0;this.transition=null;this.deathTimer=0;this.camera=0;this.returnX=3870;this.particles=[];this.mode='playing';this.player.x=this.checkpoint||this.main.spawn.x;this.player.y=this.main.spawn.y;this.completed=false;this.winTime=0;this.onEvent('state');
  }
  snapshot(){return {levelId:this.levelId,coins:this.coins,score:this.score,paws:this.paws,lives:this.lives,elapsed:this.elapsed,kills:this.kills,checkpoint:this.checkpoint,maxX:this.maxX,collected:[...this.collected],bossDefeated:!!this.main.gateOpen}}
  nextLevel(){if(!levels[this.levelId+1])return;const carry={coins:this.coins,score:this.score,lives:this.lives,kills:this.kills},superMode=this.player.super,fireMode=this.player.form==='fire';this.reset(carry,this.levelId+1);if(superMode){this.power();if(fireMode)this.player.form='fire';this.transform=0}this.emit('inputreset')}
  attack(){const p=this.player;if(p.attack>0)return;const move=currentPlayerForm(p).attack(this);p.attack=move.duration;p.attackMove={...move,damage:move.damage+(this.buffs.bell>0?1:0)};this.attackHits=new Set();if(move.projectile&&this.projectiles.filter(a=>a.type==='fireball').length<3)this.projectiles.push({x:p.face>0?p.x+p.w:p.x-18,y:p.y+p.h*.55,w:18,h:18,vx:p.face*420,vy:0,life:1.7,type:'fireball',distance:0});this.emit('punch')}
  emit(type,data){this.onEvent(type,data)}
  burst(x,y,color='#f5d57a',count=14){for(let i=0;i<count;i++)this.particles.push({x,y,vx:(Math.random()-.5)*260,vy:-Math.random()*250,life:.6+Math.random()*.5,color,size:3+Math.random()*5})}
  power(){const p=this.player;if(!p.super){p.form='super';p.super=true;p.y-=19;p.h=78;p.w=44;this.transform=.85;p.invuln=2;this.burst(p.x+22,p.y+35,'#fff0a4',32);this.emit('power')}else{this.score+=500;this.emit('toast','M POWER · +500')}this.emit('state')}
  firePower(){if(!this.player.super)this.power();this.player.form='fire';this.burst(this.player.x,this.player.y,'#ffaf55',24);this.emit('toast','FIRE MIKE · C throws a fireball!');this.emit('state')}
  damage(fatal=false){
    const p=this.player;if(this.deathTimer||this.mode!=='playing'||(!fatal&&(p.invuln>0||this.buffs.blessing>0)))return;
    if(p.form==='fire'&&!fatal){p.form='super';p.invuln=2;p.vy=-280;this.emit('hurt');this.emit('toast','Fire Mike → Super Mike. Keep going!')}
    else if(p.super&&!fatal){p.form='normal';p.super=false;p.y+=19;p.h=59;p.w=34;p.invuln=2;p.vy=-280;p.vx=-p.face*180;this.emit('hurt');this.emit('toast','Back to everyday Mike. Keep going!')}
    else{this.lives--;this.deathTimer=.9;p.vy=-340;p.vx=0;this.jumpBuffer=0;this.pipeDwell=0;this.emit('inputreset');this.emit('death')}
    this.emit('state');
  }
  respawn(){
    this.projectiles=[];this.landingNoise=0;if(this.main.boss&&!this.main.gateOpen){Object.assign(this.main.boss,{x:25180,y:FLOOR-96,hp:5,state:'waiting',stateTime:0,pattern:0,invuln:0,vx:0,vy:0});this.main.arena.active=false}for(const s of this.main.platforms)if(s.type==='fallingPlatform'){s.y=s.originY;s.fallTimer=null;s.broken=false;s.fallReset=0}this.jumpBuffer=0;this.pipeDwell=0;this.player.attack=0;this.player.duck=false;this.player.support=null;this.buffs.bell=0;this.emit('inputreset');
    this.level=this.main;const p=this.player;p.x=this.checkpoint||150;p.y=450;p.vx=0;p.vy=0;p.form='normal';p.super=false;p.h=59;p.w=34;p.invuln=2;p.grounded=false;this.camera=Math.max(0,p.x-300);this.deathTimer=0;this.transition=null;this.coyote=0;
    for(const e of this.main.enemies)if(Math.abs(e.x-p.x)<250)e.x=e.max;
    this.emit('state');this.emit('save');
  }
  travel(pipe){this.projectiles=[];this.transition={timer:.6,pipe};this.player.vx=0;this.player.vy=0;this.player.attack=0;this.jumpBuffer=0;this.pipeDwell=0;this.emit('inputreset');this.emit('pipe')}
  pickup(it){
    it.taken=true;this.collected.add(it.id);const p=this.player;
    if(it.type==='coin'){const value=this.buffs.multiplier>0?2:1;const before=Math.floor(this.coins/100);this.coins+=value;this.score+=value*100;if(Math.floor(this.coins/100)>before){this.lives++;this.emit('toast','100 MIKE COINS · EXTRA LIFE!')}this.emit('coin')}
    else if(it.type==='power')this.power();
    else if(it.type==='fire')this.firePower();
    else if(it.type==='bell'){this.buffs.bell=12;this.emit('powerup');this.emit('toast','SUPER CAT BELL · 12 seconds of golden courage!')}
    else if(it.type==='paw'){this.paws++;this.score+=1000;this.emit('paw');this.emit('toast',this.paws===3?'ALL 3 ROYAL PAWS · +3,000 BONUS!':'XIABOO PAW FOUND · '+this.paws+'/3');if(this.paws===3)this.score+=3000}
    else if(it.type==='life'){this.lives++;this.emit('paw');this.emit('toast','A LITTLE MORE COURAGE · +1 LIFE')}
    else{this.buffs[it.type]=it.type==='blessing'?10:14;this.emit('powerup');this.emit('toast',({speed:'QUICK PAWS · SPEED BOOST',blessing:'XIABOO’S BLESSING · INVINCIBLE',multiplier:'GOLDEN HOUR · DOUBLE COINS',jump:'SKY STEPS · SUPER JUMP'})[it.type])}
    this.burst(it.x+14,it.y+16,it.type==='paw'?'#d2b5fc':'#ffe18b',8);this.emit('state');
  }
  defeat(e){e.alive=false;this.kills++;this.score+=e.type==='armor'?400:200;this.burst(e.x+20,e.y+15,'#f7d2a1',10);this.emit('stomp');this.emit('state')}
  step(dt,input={}){
    dt=Math.min(dt,.035);this.time+=dt;
    for(const a of this.particles){a.x+=a.vx*dt;a.y+=a.vy*dt;a.vy+=400*dt;a.life-=dt}this.particles=this.particles.filter(a=>a.life>0);
    if(this.mode==='won'){this.winTime+=dt;if(this.levelId===3){const p=this.player,oldX=p.x;p.x=Math.min(this.main.goal+130,p.x+dt*48);p.y=FLOOR-p.h;p.grounded=true;p.vx=p.x>oldX?48:0;p.face=1;p.gaitPhase=advanceGait(p.gaitPhase||0,p.x-oldX,p.super);this.camera+=(clamp(p.x-this.viewWidth*.4,0,Math.max(0,this.main.width-this.viewWidth))-this.camera)*Math.min(1,dt*2)}return}if(this.mode!=='playing')return;
    const p=this.player;this.elapsed+=dt;
    if(this.transform>0){this.transform-=dt;return}
    if(this.transition){this.transition.timer-=dt;if(this.transition.timer<=0){if(this.level.cave){this.level=this.main;p.x=this.returnX;p.y=430;this.emit('toast','Back in the sunshine.')}else{this.returnX=this.transition.pipe.x+120;this.level=this.cavern;p.x=220;p.y=450;this.emit('toast',this.levelId===3?'SECRET DOG HOUSE · DOGS ONLY (Mike disagrees!)':this.levelId===2?'GOLDEN WHISKER VAULT · A royal bonus room':'THE WHISKER CAVERN · Find the royal paw')}this.camera=Math.max(0,p.x-250);p.invuln=1.5;p.vx=0;p.vy=0;this.transition=null;this.emit('state')}return}
    if(this.deathTimer>0){this.deathTimer-=dt;p.vy+=1200*dt;p.y+=p.vy*dt;if(this.deathTimer<=0){if(this.lives<=0){this.mode='gameover';this.emit('gameover')}else this.respawn()}return}
    this.landingNoise=Math.max(0,this.landingNoise-dt);p.invuln=Math.max(0,p.invuln-dt);p.attack=Math.max(0,p.attack-dt);for(const b in this.buffs)this.buffs[b]=Math.max(0,this.buffs[b]-dt);
    if(input.jumpPressed)this.jumpBuffer=.13;else this.jumpBuffer=Math.max(0,this.jumpBuffer-dt);
    this.coyote=p.grounded?.11:Math.max(0,this.coyote-dt);
    p.duck=!!input.down&&p.grounded;
    let dir=(input.right?1:0)-(input.left?1:0);if(p.duck)dir=0;if(dir)p.face=dir;
    const maxSpeed=(input.run?285:205)*(p.super?1.12:1)*(this.buffs.speed>0?1.4:1);
    const target=dir*maxSpeed;const accel=p.grounded?1900:1200;
    const boostedTarget=target*(this.buffs.bell>0?1.12:1);
    p.vx+=clamp(boostedTarget-p.vx,-accel*dt,accel*dt);
    // Touch release is immediate; desktop retains the original acceleration physics.
    if(input.touchMovement&&!dir)p.vx=0;
    if(input.touchRunReleased)p.vx=clamp(p.vx,-maxSpeed*(this.buffs.bell>0?1.12:1),maxSpeed*(this.buffs.bell>0?1.12:1));
    if(this.jumpBuffer>0&&this.coyote>0){p.vy=-(p.super?760:700)*(this.buffs.jump>0?1.2:1)*(this.buffs.bell>0?1.08:1);p.grounded=false;this.coyote=0;this.jumpBuffer=0;this.emit('jump')}
    if(!input.jump&&p.vy<-240)p.vy+=2100*dt;
    if(input.attackPressed)this.attack();
    for(const s of this.level.platforms)if(s.type==='fallingPlatform'){if(s.broken){s.fallReset-=dt;if(s.fallReset<=0){s.broken=false;s.y=s.originY;s.fallTimer=null}}else if(s.fallTimer!=null){s.fallTimer-=dt;if(s.fallTimer<=0){s.y+=220*dt;if(s.y>760){s.broken=true;s.fallReset=3}}}}
    const platforms=this.level.platforms.filter(s=>!s.broken);
    for(const s of platforms){s.dx=0;s.dy=0;if(s.type==='moving'){const old=s[s.axis];s[s.axis]=s.origin+Math.sin(this.time*s.speed)*s.range;s['d'+s.axis]=s[s.axis]-old;if(p.grounded&&p.support===s){p.x+=s.dx;p.y+=s.dy}}}
    const strideStart=p.x,wasGrounded=p.grounded;
    p.x+=p.vx*dt;
    for(const s of platforms)if(overlap(p,s)){if(p.vx>0)p.x=s.x-p.w;else if(p.vx<0)p.x=s.x+s.w;p.vx=0}
    p.x=clamp(p.x,0,this.level.width-p.w);if(this.level.boss&&!this.level.gateOpen){p.x=Math.min(p.x,this.level.arena.right-p.w);if(this.level.arena.active)p.x=Math.max(p.x,this.level.arena.left)}
    const landingSpeed=p.vy,previousBottom=p.y+p.h;p.vy=Math.min(p.vy+1650*dt,950);p.y+=p.vy*dt;p.grounded=false;p.support=null;
    for(const s of platforms)if(overlap(p,s)){
      if(p.vy>=0&&previousBottom<=s.y+Math.max(8,Math.abs(s.dy||0)+3)){p.y=s.y-p.h;p.vy=0;p.grounded=true;p.support=s;if(s.type==='fallingPlatform'&&s.fallTimer==null)s.fallTimer=.85}
      else if(p.vy<0){p.y=s.y+s.h;p.vy=0;if(s.type==='mystery'&&!s.used){s.used=true;this.pickup({id:s.id,x:s.x,y:s.y,type:s.reward});this.burst(s.x+24,s.y,'#ffe18b',12)}if(s.type==='breakable'&&p.super){s.broken=true;this.burst(s.x+s.w/2,s.y,'#bf976b',20);this.score+=100}}
    }
    if(p.grounded&&!wasGrounded&&landingSpeed>380)this.landingNoise=.18;
    if(p.attack>0)for(const s of platforms)if(s.hidden&&!s.used&&Math.abs(s.x-p.x)<95&&Math.abs(s.y-p.y)<100){s.hidden=false;s.used=true;this.pickup({id:s.id,x:s.x,y:s.y,type:s.reward})}
    if(p.grounded&&wasGrounded&&!p.duck)p.gaitPhase=advanceGait(p.gaitPhase||0,p.x-strideStart,p.super);
    for(const pipe of this.level.pipes)if(pipe.door&&pipe.secret&&!pipe.revealed&&((p.x>pipe.x-100&&p.x<pipe.x+20)||this.level.platforms.some(s=>s.id&&s.used&&Math.abs(s.x-pipe.x)<150))){pipe.revealed=true;this.emit('toast','A secret door! Stand still by the dog house.')}
    if(input.down&&p.grounded)for(const pipe of this.level.pipes)if((pipe.secret||pipe.exit)&&(!pipe.door||pipe.exit||pipe.revealed)&&p.x+p.w/2>pipe.x+8&&p.x+p.w/2<pipe.x+pipe.w-8&&Math.abs(p.y+p.h-pipe.y)<8){this.travel(pipe);return}
    const restingPipe=p.grounded&&!dir&&!input.jump&&!input.attack&&!input.attackPressed&&!input.run&&this.level.pipes.find(pipe=>(pipe.secret||pipe.exit)&&(!pipe.door||pipe.exit||pipe.revealed)&&p.x+p.w/2>pipe.x+8&&p.x+p.w/2<pipe.x+pipe.w-8&&Math.abs(p.y+p.h-pipe.y)<8);
    this.pipeDwell=restingPipe?this.pipeDwell+dt:0;if(this.pipeDwell>.8){this.travel(restingPipe);return}
    for(const it of this.level.items)if(!it.taken&&overlap(p,{...it,y:it.y+Math.sin(this.time*3+it.x)*4}))this.pickup(it);
    for(const e of this.level.enemies){
      if(!e.alive||Math.abs(e.x-p.x)>1600)continue;e.timer+=dt;
      if(e.faction==='dog'){updateDog(this,e,dt,input,platforms);if(e.state==='defeated')continue}
      else if(e.type==='pipe'){e.y=e.baseY+Math.max(0,Math.sin(e.timer*1.4))*90;e.hidden=e.y>e.baseY+30;if(e.hidden)continue}
      else{
        e.stun=Math.max(0,(e.stun||0)-dt);let speed=e.stun>0?0:e.type==='fast'?155:e.type==='chonky'?35:55;
        if(e.type==='sleepy'&&Math.abs(p.x-e.x)>220)speed=0;
        if(e.type==='fast'&&!e.platformPatrol&&Math.abs(p.x-e.x)<360)e.vx=Math.sign(p.x-e.x)*speed;
        else e.vx=Math.sign(e.vx||-1)*speed;
        e.x+=e.vx*dt;if(e.x<e.min){e.x=e.min;e.vx=speed}if(e.x>e.max){e.x=e.max;e.vx=-speed}
        if(e.type==='jump'&&e.timer>1.7&&e.y>=FLOOR-e.h){e.vy=-420;e.timer=0}
        if(e.platformPatrol){
          const foot=e.y+e.h,ahead=e.vx>0?e.x+e.w+2:e.x-2;
          if(!platforms.some(s=>ahead>=s.x&&ahead<=s.x+s.w&&Math.abs(s.y-foot)<9)){e.x-=e.vx*dt;e.vx*=-1}
          for(const s of platforms)if(overlap(e,s)){e.x=e.vx>0?s.x-e.w:s.x+s.w;e.vx*=-1}
          e.vy+=1350*dt;e.y+=e.vy*dt;
          for(const s of platforms)if(overlap(e,s)&&foot<=s.y+8&&e.vy>=0){e.y=s.y-e.h;e.vy=0}
        }else{e.vy+=1350*dt;e.y+=e.vy*dt;if(e.y+e.h>=FLOOR){e.y=FLOOR-e.h;e.vy=0}}
      }
      const reach=p.attackMove?.reach||55,punch={x:p.face>0?p.x+p.w:p.x-reach,y:p.y+10,w:reach,h:55};
      if(p.attack>0&&!p.attackMove?.projectile&&overlap(punch,e)&&!this.attackHits?.has(e)){this.attackHits?.add(e);if(e.faction==='dog'){if(!hitDog(this,e)&&overlap(p,e))this.damage();continue}e.hp-=e.type==='guard'?Math.min(2,p.attackMove.damage):p.attackMove.damage;if(e.hp<=0)this.defeat(e);else{e.stun=.4;this.burst(e.x+20,e.y,'#ffe18b',6);this.emit('stomp')}continue}
      if(overlap(p,e)){
        if(this.buffs.blessing>0){if(e.faction==='dog')hitDog(this,e,'stomp');else this.defeat(e);continue}
        if(p.vy>0&&previousBottom<=e.y+17&&e.type!=='pipe'){if(e.faction==='dog'){const hit=hitDog(this,e,'stomp');p.vy=-430;p.y=e.y-p.h;if(!hit)this.damage();continue}e.hp-=e.type==='guard'?1:p.super?3:1;p.vy=-430;p.y=e.y-p.h;if(e.hp<=0)this.defeat(e);else{this.emit('stomp');this.burst(e.x+20,e.y,'#d0e5e4',5)}}else if(e.faction==='dog'||!(p.attack>0&&this.attackHits?.has(e)))this.damage();
      }
    }
    updateProjectiles(this,dt,platforms);
    for(const h of this.level.hazards){
      if(h.type==='barrel'){updateBarrel(this,h,dt);if(h.phase!=='rolling')continue;if(p.super&&p.attack>0&&!p.attackMove?.projectile&&Math.abs(p.x-h.x)<75&&Math.abs(p.y+p.h-h.y-h.h)<50){h.phase='cooldown';h.timer=3;this.burst(h.x,h.y,'#d7ab6c',12);continue}}
      if(h.type==='falling'){
        if(h.phase==='idle'&&Math.abs(p.x-h.x)<220){h.phase='warning';h.timer=.9}
        else if(h.phase==='warning'){h.timer-=dt;if(h.timer<=0)h.phase='falling'}
        else if(h.phase==='falling'){h.vy+=1100*dt;h.y+=h.vy*dt;if(h.y>720){h.phase='cooldown';h.timer=2}}
        else if(h.phase==='cooldown'){h.timer-=dt;if(h.timer<=0){h.phase='idle';h.y=h.originY;h.vy=0}}
        if(h.phase!=='falling')continue;
      }
      if(overlap(p,h))this.damage();
    }
    if(p.y>790)this.damage(true);
    if(!this.level.cave){this.maxX=Math.max(this.maxX,p.x);if(!this.checkpoint&&p.x>=this.main.checkpoint){this.checkpoint=this.main.checkpoint;this.burst(p.x,p.y,'#f4d17b',25);this.emit('checkpoint');this.emit('toast','CHECKPOINT! · Your courage is saved.');this.emit('save')}
      if(!this.deathTimer&&p.x>=this.main.goal&&(!this.main.boss||this.main.gateOpen)){this.completed=true;this.mode='won';this.winTime=0;this.bonus=Math.max(0,Math.round(600-this.elapsed))*10+this.lives*500;this.score+=this.bonus;this.emit('inputreset');this.emit('win');this.emit('state')}
    }
    const aim=clamp(p.x-this.viewWidth*.37+p.face*65,0,Math.max(0,this.level.width-this.viewWidth));this.camera+=(aim-this.camera)*Math.min(1,dt*4);
  }
}
