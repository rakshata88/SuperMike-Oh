import {FLOOR} from './level.js';
import {chaseEnemy,escapeSection} from './level5.js';
import {advanceGait} from './gait.js';
import {intersects,clamp,setState,tickState,groundMotion,chargeCycle,projectile,nextBossPhase} from './behaviors.js';

export const HOWL_DIALOGUE=['End of the road, Mike!',"No one boards Lord Whiskeron's airship!"];
export function initializeChase(g,saved=null){
  g.chaseState={scenes:[],whistles:[],thefts:{},...saved};g.player.dashBoost=0;
  for(const l of [g.main,...Object.values(g.rooms)]){
    for(const s of l.platforms)if(s.weak&&g.collected.has(s.id))s.broken=true;
    for(const pipe of l.pipes)if(pipe.chase)pipe.revealed=g.collected.has('s5-cargo-open');
    for(const e of l.enemies){const loot=g.chaseState.thefts[e.id];if(loot){e.stolen=loot.amount;e.state='flee';e.theftAttempted=true}}
  }
  for(const [id,loot] of Object.entries(g.chaseState.thefts))if(loot.phase==='dropped')restoreLoot(g,id,loot);
  g.scene=g.main.gateOpen?{kind:'airshipEnding',time:0}:null;
}
function restoreLoot(g,id,loot){
  const l=loot.room?g.rooms[loot.room]:g.main;if(!l)return;
  const token=`refund-${id}`;if(!l.items.some(it=>it.id===token))l.items.push({id:token,x:loot.x,y:loot.y,w:30,h:30,type:'recoveredCoins',amount:loot.amount,theftId:id,taken:g.collected.has(token)});
}
export function resetChaseBoss(g){
  const e=g.main.boss;Object.assign(e,{x:e.homeX,y:e.homeY,hp:8,state:'waiting',stateTime:0,pattern:0,invuln:0,vx:0,vy:0,hidden:false,alive:true});g.main.arena.active=false;
  g.scene=g.main.gateOpen?{kind:'airshipEnding',time:0}:null;
}
export function hitChase(g,e,kind='punch'){
  if(!e.alive||e.harmless||e.hidden||e.invuln>0||['defeated','intro'].includes(e.state))return false;
  if(e.type==='howl'&&e.state!=='vulnerable')return false;
  if(e.type==='hedgehog'&&e.state==='charge'&&!['fireball','electric','dash'].includes(kind)){e.blocked=.3;return false}
  e.hp-=e.type==='howl'?1:kind==='electric'||kind==='dash'?2:kind==='punch'?(g.player.attackMove?.damage||1):1;
  e.invuln=e.type==='howl'?1:.4;g.burst(e.x+e.w/2,e.y,'#ffe4b1',14);g.emit('stomp');
  if(e.hp<=0){
    if(e.type==='howl'){
      setState(e,'defeated',0);g.main.gateOpen=true;g.projectiles=[];g.kills++;g.score+=6000;g.scene={kind:'airshipEnding',time:0};g.emit('inputreset');g.emit('toast',"You're... faster than you look...");g.emit('state');g.emit('save');
    }else{
      const loot=g.chaseState.thefts[e.id];if(loot?.phase==='carried'&&loot.time>0){Object.assign(loot,{phase:'dropped',x:e.x,y:Math.min(e.y,e.homeY),room:g.level.roomId||null});restoreLoot(g,e.id,loot);g.emit('toast','Your coins! Pick them up!')}
      g.defeat(e);if(loot)g.emit('save');
    }
  }
  return true;
}
export function chaseContact(g,e){
  if(e.type==='raccoon'){
    if(!e.theftAttempted&&!g.chaseState.thefts[e.id]){
      const amount=Math.min(3,g.coins);g.coins-=amount;e.theftAttempted=true;e.stolen=amount;g.chaseState.thefts[e.id]={amount,time:8,phase:amount?'carried':'lost'};e.face=Math.sign(e.x-g.player.x)||1;setState(e,'flee',8);g.player.invuln=Math.max(g.player.invuln,.4);g.emit('toast',amount?'That raccoon took 3 coins or fewer! Catch it!':'Empty pockets! The raccoon scampers away.');g.emit('state');g.emit('save');
    }
    return;
  }
  const canHurt=g.player.invuln<=0&&g.buffs.blessing<=0&&!g.deathTimer;g.damage();
  if(e.type==='goat'&&canHurt&&!g.deathTimer){g.player.knockback=.18;g.player.knockbackFace=e.face;g.player.vy=-300}
}
export function updateChaseEnemy(g,e,dt,platforms){
  tickState(e,dt);e.blocked=Math.max(0,(e.blocked||0)-dt);const p=g.player,dx=p.x-e.x;
  if(e.type==='howl'){updateHowl(g,e,dt);return}
  if(e.harmless||e.state==='sleep')return;
  if(e.type==='fox'){
    if(e.state==='patrol'&&Math.abs(dx)<145){e.face=-Math.sign(dx)||1;setState(e,'flee',.8)}
    else if(e.state==='patrol'&&e.stateTime<=0)setState(e,'look',.9);
    else if(e.state==='look'&&e.stateTime<=0){e.face=Math.sign(dx)||-1;setState(e,'patrol',1.8)}
    else if(e.state==='flee'&&e.stateTime<=0){e.face=Math.sign(dx)||-1;setState(e,'turnWarning',.75)}
    else if(e.state==='turnWarning'&&e.stateTime<=0)setState(e,'charge',.6);
    else if(e.state==='charge'&&e.stateTime<=0)setState(e,'look',1.3);
    groundMotion(e,dt,platforms,e.state==='flee'?195:e.state==='charge'?235:e.state==='patrol'?130:0,{hop:true});return;
  }
  if(e.type==='monkey'){
    if(e.state==='patrol'&&e.stateTime<=0&&Math.abs(dx)<650){e.face=Math.sign(dx)||-1;setState(e,'throwWarning',.85)}
    else if(e.state==='throwWarning'&&e.stateTime<=0){projectile(g,e,'boomerang',{speed:190,life:3.4,returnTime:1.45,age:0,turned:false});setState(e,'patrol',3.5)}return;
  }
  if(e.type==='fish'){
    if(e.state==='submerged'&&e.stateTime<=0){e.hidden=false;e.vy=-560;setState(e,'jump',2)}
    if(e.state==='jump'){e.vy+=900*dt;e.y+=e.vy*dt;if(e.y>=e.waterY-e.h&&e.vy>0){e.y=e.waterY-e.h;e.hidden=true;setState(e,'submerged',2.2)}}return;
  }
  if(e.type==='eagle'){
    e.x=e.homeX+Math.sin(e.timer*.85)*100;e.y=e.homeY+Math.sin(e.timer*1.4)*12;
    if(e.state==='leave'){e.homeX+=150*dt;e.y-=90*dt;if(e.stateTime<=0)e.alive=false;return}
    if(e.state==='patrol'&&e.stateTime<=0&&Math.abs(dx)<500)setState(e,'dropWarning',.9);
    else if(e.state==='dropWarning'&&e.stateTime<=0){projectile(g,e,'pinecone',{speed:0,vy:45,gravity:220,life:3.5});e.drops=(e.drops||0)+1;setState(e,e.drops>=3?'leave':'patrol',e.drops>=3?2:1.9)}return;
  }
  if(e.type==='duck'){
    if(e.state==='patrol'&&e.stateTime<=0){e.face=Math.sign(dx)||-1;setState(e,'balloonWarning',.8)}
    else if(e.state==='balloonWarning'&&e.stateTime<=0){projectile(g,e,'waterBalloon',{speed:135,vy:-100,gravity:260,life:3});e.vy=-300;e.grounded=false;setState(e,'patrol',2.8)}
    groundMotion(e,dt,platforms,e.state==='patrol'?42:0);return;
  }
  if(e.type==='raccoon'){
    if(!e.theftAttempted&&Math.abs(dx)<480)e.face=Math.sign(dx)||-1;
    if(e.state==='flee')e.face=e.face||1;
    groundMotion(e,dt,platforms,e.state==='flee'?180:115);return;
  }
  if(['hedgehog','goat','trainDog'].includes(e.type)){
    if(e.type==='trainDog'&&!g.chaseState.whistles.includes(e.id)&&Math.abs(dx)<380&&e.state==='patrol'&&e.stateTime<=0){setState(e,'whistleWarning',1.05);e.face=Math.sign(dx)||-1}
    if(e.state==='whistleWarning'){
      if(e.stateTime<=0){g.chaseState.whistles.push(e.id);const support=platforms.find(s=>e.x>=s.x&&e.x+e.w<=s.x+s.w&&Math.abs(s.y-e.y-e.h)<12);const count=g.level.enemies.filter(n=>n.reinforcement&&n.alive&&Math.abs(n.x-e.x)<1000).length;
        if(support&&count<2){const candidates=[support.x+30,support.x+support.w-90],x=candidates.sort((a,b)=>Math.abs(b-p.x)-Math.abs(a-p.x))[0];if(Math.abs(x-p.x)>150){const backup=chaseEnemy(x,'fox',support.y,support.x+10,support.x+support.w-60);backup.reinforcement=true;backup.state='look';backup.stateTime=1;g.level.enemies.push(backup);g.burst(x,support.y-40,'#ffe4a1',15)}}
        setState(e,'rest',1.4);g.emit('save');
      }return;
    }
    chargeCycle(e,p,{radius:e.type==='goat'?320:270,duration:e.type==='hedgehog'?.95:.7,rest:1.8});
    const blocked=groundMotion(e,dt,platforms,e.state==='charge'?(e.type==='goat'?260:245):e.state==='patrol'?45:0);
    if(blocked&&e.state==='charge')setState(e,'rest',1.8);
  }
}
function updateHowl(g,e,dt){
  const p=g.player,fast=e.hp<=3?1.13:1;
  if(e.state==='defeated')return;
  if(e.state==='waiting'){
    if(p.x>=g.main.arena.left-60){g.main.arena.active=true;p.x=32100;p.face=1;setState(e,'intro',0);g.scene={kind:'howlIntro',time:0,line:0};g.projectiles=[];g.emit('inputreset')}return;
  }
  if(e.state==='dashWarning'&&e.stateTime<=0){setState(e,'airDash',3);e.vx=e.face*365*fast}
  else if(e.state==='airDash'){
    e.x+=e.vx*dt;if(e.x<=e.min||e.x>=e.max||e.stateTime<=0){e.x=clamp(e.x,e.min,e.max);e.vx=0;setState(e,'vulnerable',3)}
  }else if(e.state==='windWarning'&&e.stateTime<=0){e.face=Math.sign(p.x-e.x)||-1;setState(e,'windBlast',2.6/fast)}
  else if(e.state==='windBlast'&&e.stateTime<=0)setState(e,'vulnerable',3);
  else if(e.state==='ballsWarning'&&e.stateTime<=0){e.face=Math.sign(p.x-e.x)||-1;e.shots=0;e.shotTime=0;setState(e,'balls',1.8/fast)}
  else if(e.state==='balls'){
    e.shotTime-=dt;if(e.shots<3&&e.shotTime<=0){projectile(g,e,'howlBall',{speed:(150+e.shots*18)*fast,vy:-260,gravity:480,bounce:true,life:4});e.shots++;e.shotTime=.5/fast}
    if(e.stateTime<=0)setState(e,'vulnerable',3);
  }else if(e.state==='aerialWarning'&&e.stateTime<=0){e.airStart=e.x;e.airTarget=e.x<(e.min+e.max)/2?e.max:e.min;e.drops=0;e.dropTime=.9;setState(e,'aerial',3.8)}
  else if(e.state==='aerial'){
    const t=clamp(1-e.stateTime/3.8,0,1);e.x=e.airStart+(e.airTarget-e.airStart)*t;e.y=e.homeY-Math.sin(t*Math.PI)*205;e.dropTime-=dt;
    if(t>.18&&t<.72&&e.drops<2&&e.dropTime<=0){projectile(g,e,'toyCrate',{speed:0,vy:50,gravity:230,life:3,y:e.y+e.h});e.drops++;e.dropTime=1}
    if(e.stateTime<=0){e.y=e.homeY;setState(e,'vulnerable',3.2)}
  }else if(e.state==='vulnerable'&&e.stateTime<=0){
    const phases=e.hp<=3?['dashWarning','windWarning','ballsWarning']:['dashWarning','windWarning','ballsWarning','aerialWarning'];nextBossPhase(e,phases,1.05/fast);e.face=Math.sign(p.x-e.x)||-1;
  }
}
export function breakChaseCrate(g,s){
  if(s.broken)return;s.broken=true;g.collected.add(s.id);g.score+=100;g.burst(s.x+29,s.y,'#dfb482',14);
  if(s.secretCrate){g.collected.add('s5-cargo-open');const pipe=g.main.pipes.find(p=>p.chase);pipe.revealed=true;g.emit('toast','ROYAL CARGO! Pause at the open crate.')}g.emit('state');g.emit('save');
}
export function chaseAttack(g){
  const p=g.player,move=p.attackMove;if(move.dash){p.dashBoost=.16;p.dashFace=p.face}
  const reach=move.reach||55,box={x:p.face>0?p.x+p.w:p.x-reach,y:p.y+8,w:reach,h:60};
  for(const s of g.level.platforms)if(s.weak&&!s.broken&&intersects(box,s))breakChaseCrate(g,s);
}
export function chasePickup(g,it){
  if(it.type==='recoveredCoins'){
    const loot=g.chaseState.thefts[it.theftId];if(loot?.phase==='dropped'){g.coins+=loot.amount;loot.phase='recovered';g.emit('coin');g.emit('toast','Coins recovered!');g.emit('save')}return true;
  }
  if(it.type==='denToken'||it.type==='cargoSeal'){g.score+=1500;g.emit('paw');g.emit('toast',it.type==='denToken'?'FOX TRAIL TOKEN · +1,500':'ROYAL CARGO SEAL · +1,500');g.emit('save');return true}
  return false;
}
export function updateEscape(g,dt,input){
  const p=g.player;p.dashBoost=Math.max(0,(p.dashBoost||0)-dt);p.knockback=Math.max(0,(p.knockback||0)-dt);g.windPush=0;
  if(p.form==='thunder'){p.thunderTime=Math.max(0,(p.thunderTime||0)-dt);if(!p.thunderTime){p.form=p.thunderReturn==='fire'?'fire':'super';p.attack=0;g.emit('toast','Thunder fades. Keep going, Mike!');g.emit('state')}}
  if(p.form==='dash'){
    p.dashTime=Math.max(0,p.dashTime-dt);if(p.dashTime===0){const old=p.dashReturn||{};p.form=old.form==='fire'?'fire':old.form==='thunder'&&old.thunderTime>0?'thunder':'super';if(p.form==='thunder'){p.thunderTime=old.thunderTime;p.thunderReturn=old.thunderReturn}p.dashBoost=0;p.attack=0;g.emit('toast','The wind settles. Keep chasing!');g.emit('state')}
  }
  for(const loot of Object.values(g.chaseState.thefts))if(loot.phase==='carried'){loot.time=Math.max(0,loot.time-dt);if(!loot.time)loot.phase='lost'}
  for(const wind of g.level.winds)if(p.x>wind.x&&p.x<wind.x+wind.w&&Math.sin(g.time*Math.PI*2/wind.period)>.15)g.windPush+=wind.dir*wind.strength;
  const boss=g.main.boss;if(!g.level.cave&&boss.state==='windBlast')g.windPush=boss.face*65;
  if(!g.level.cave){
    const before=g.chaseRegion;g.chaseRegion=escapeSection(p.x).id;if(before!==g.chaseRegion)g.emit('state');
    for(const [x,kind] of [[10600,'trainSight'],[20800,'detach']])if(p.x>=x&&!g.chaseState.scenes.includes(kind)&&!g.scene&&!g.deathTimer){if(kind==='trainSight'&&g.checkpoint<10600){g.checkpoint=10600;g.emit('checkpoint');g.emit('toast','CHECKPOINT!')}g.chaseState.scenes.push(kind);g.scene={kind,time:0,startX:p.x,startY:p.y};g.projectiles=[];g.emit('inputreset');g.emit('save');break}
  }
  for(const pipe of g.main.pipes)if(pipe.chase&&!pipe.revealed&&g.main.platforms.some(s=>s.id&&s.used&&Math.abs(s.x-pipe.x)<150)){g.collected.add('s5-cargo-open');pipe.revealed=true;const crate=g.main.platforms.find(s=>s.secretCrate);if(crate)breakChaseCrate(g,crate)}
  if(p.form==='dash'&&input.run&&Math.abs(p.vx)>=340){const box={x:p.x-5,y:p.y,w:p.w+10,h:p.h};for(const s of g.level.platforms)if(s.weak&&!s.broken&&intersects(box,s))breakChaseCrate(g,s)}
}
export function updateChaseProjectiles(g,dt){
  for(const a of g.projectiles){
    if(a.type==='boomerang'){a.age+=dt;if(!a.turned&&a.age>=a.returnTime){a.vx*=-1;a.turned=true}}
    if(a.gravity)a.vy+=a.gravity*dt;
  }
}
export function updateCargo(g,h,dt){
  if(h.phase==='idle'&&Math.abs(g.player.x-h.x)<600){h.phase='warning';h.timer=1.1}
  else if(h.phase==='warning'){h.timer-=dt;if(h.timer<=0)h.phase='sliding'}
  else if(h.phase==='sliding'){h.x+=h.vx*dt;if(Math.abs(h.x-h.originX)>420){h.phase='cooldown';h.timer=3}}
  else if(h.phase==='cooldown'){h.timer-=dt;if(h.timer<=0){h.phase='idle';h.x=h.originX}}
}
export function updateChaseScene(g,dt,input){
  const s=g.scene,p=g.player,e=g.main.boss,oldX=p.x;s.time+=dt;p.vx=0;p.vy=0;p.attack=0;p.dashBoost=0;p.grounded=true;
  let focus=p.x;
  if(s.kind==='trainSight'){
    p.y=FLOOR-p.h;p.x=Math.min(10980,p.x+55*dt);p.vx=55;p.face=1;focus=p.x+Math.min(230,g.viewWidth*.2);
    if(s.time>=4){g.scene=null;g.emit('inputreset')}
  }else if(s.kind==='detach'){
    const t=clamp(s.time/2.4,0,1);p.x=s.startX+(21220-s.startX)*t;p.y=(s.startY??(485-p.h))+(FLOOR-p.h-(s.startY??(485-p.h)))*t-Math.sin(t*Math.PI)*130;p.grounded=t===1;p.face=1;p.vx=t<1?150:0;focus=p.x+160;
    if(s.time>=3.6){g.scene=null;g.emit('inputreset')}
  }else if(s.kind==='howlIntro'){
    p.y=FLOOR-p.h;if((input.attackPressed||input.jumpPressed)&&s.time>.5)s.time=(Math.floor(s.time/2.5)+1)*2.5;s.line=Math.min(1,Math.floor(s.time/2.5));e.y=e.homeY-Math.max(0,1-s.time)*170;focus=g.viewWidth<900?e.x+20:32600;
    if(s.time>=5){e.y=e.homeY;e.face=Math.sign(p.x-e.x)||-1;setState(e,'dashWarning',1.1);g.scene=null;g.emit('inputreset')}
  }else if(s.kind==='airshipEnding'){
    if(s.time<=dt+.001){p.x=33200;p.y=FLOOR-p.h}
    const t=s.time;focus=t<4.3?p.x+Math.min(140,g.viewWidth*.2):33650;
    if(t<2.5){p.x=Math.min(33510,p.x+145*dt);p.y=FLOOR-p.h;p.face=1;p.vx=145}
    else if(t<4.3){const n=(t-2.5)/1.8;p.x=33510+18*n;p.y=FLOOR-p.h-110*Math.sin(n*Math.PI/2);p.grounded=false}
    else if(t<6.5){p.x=33528;p.y=FLOOR-p.h-110-(t-4.3)*15;p.grounded=false}
    else if(t<8.5){const n=(t-6.5)/2;p.x=33528+32*n;p.y=(FLOOR-p.h-143)+(500-p.h-(FLOOR-p.h-143))*n;p.grounded=n>=1}
    else{p.x=33560;p.y=500-p.h;p.grounded=true}
    if(t>=11&&!g.collected.has('s5-sky-map')){g.collected.add('s5-sky-map');g.emit('toast','Prince Xiaboo left Mike a clue!');g.emit('save')}
    if(t>=15.5)g.finishLevel();
  }
  p.gaitPhase=advanceGait(p.gaitPhase||0,p.x-oldX,p.super);const aim=clamp(focus-g.viewWidth*.5,0,Math.max(0,g.main.width-g.viewWidth));g.camera+=(aim-g.camera)*Math.min(1,dt*3);
}
