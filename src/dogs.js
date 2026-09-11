import {FLOOR} from './level.js';
const intersects=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const state=(e,name,time)=>{e.state=name;e.stateTime=time};
export function ball(g,e,vx,vy=-100){g.projectiles.push({x:e.x+e.w/2,y:e.y+22,w:18,h:18,vx,vy,life:3.8,type:'tennis',bounce:e.type==='barko',distance:0})}
export function hitDog(g,e,kind='punch',projectile=null){
  if(e.type==='barko'){
    if(e.state!=='dizzy'||e.invuln>0)return false;
    e.hp--;e.invuln=1;g.burst(e.x+e.w/2,e.y,'#ffdc70',18);g.emit('stomp');
    if(e.hp<=0){state(e,'defeated',0);e.vx=0;e.vy=0;g.main.gateOpen=true;g.projectiles=g.projectiles.filter(p=>p.type==='fireball');g.kills++;g.score+=3000;g.emit('toast','Woof... you may pass.');g.emit('state');g.emit('save')}
    return true;
  }
  const front=projectile?projectile.vx*e.face<0:(g.player.x+g.player.w/2-(e.x+e.w/2))*e.face>0;
  if(e.type==='shield'&&kind!=='stomp'&&front){e.blocked=.3;g.burst(e.x+e.w/2,e.y+20,'#aee7ff',5);g.emit('toast','CLANG! Try a stomp or attack from behind.');return false}
  g.defeat(e);return true;
}
function moveDog(e,dt,platforms){
  const oldX=e.x,foot=e.y+e.h;
  e.x+=e.vx*dt;
  if(e.x<e.min||e.x>e.max){e.x=Math.max(e.min,Math.min(e.max,e.x));e.vx*=-1}
  for(const s of platforms)if(intersects(e,s)){e.x=e.vx>0?s.x-e.w:s.x+s.w;e.vx*=-1}
  if(e.grounded&&e.vx){const ahead=e.vx>0?e.x+e.w+2:e.x-2;if(!platforms.some(s=>ahead>=s.x&&ahead<=s.x+s.w&&Math.abs(s.y-foot)<10)){e.x=oldX;e.vx*=-1}}
  e.vy+=1350*dt;e.y+=e.vy*dt;e.grounded=false;
  for(const s of platforms)if(intersects(e,s)&&e.vy>=0&&foot<=s.y+8){e.y=s.y-e.h;e.vy=0;e.grounded=true}
  if(e.vx)e.face=Math.sign(e.vx);
  if(e.y>800)e.alive=false;
}
export function updateDog(g,e,dt,input,platforms){
  const p=g.player,dx=p.x-e.x;e.timer+=dt;e.stateTime-=dt;e.blocked=Math.max(0,(e.blocked||0)-dt);
  if(e.type==='barko'){updateBarko(g,e,dt);return}
  if(e.type==='patrol'||e.type==='shield')e.vx=Math.sign(e.vx||-1)*(e.type==='shield'?36:78);
  if(e.type==='charger'||e.type==='sleepyDog'){
    if(e.state==='sleep'){
      e.vx=0;
      if(Math.abs(dx)<240&&(input.run&&Math.abs(p.vx)>90||p.attack>0||g.landingNoise>0)){state(e,'warning',.8);e.chargeDir=Math.sign(dx)||1}
    }else if(e.state==='idle'){
      e.vx=Math.sign(e.vx||-1)*30;
      if(Math.abs(dx)<340&&Math.abs(p.y-e.y)<110){state(e,'warning',.8);e.chargeDir=Math.sign(dx)||1;e.vx=0}
    }else if(e.state==='warning'){
      e.vx=0;if(e.stateTime<=0){state(e,'charge',1.05);e.min=e.x-330;e.max=e.x+330;e.vx=e.chargeDir*260}
    }else if(e.state==='charge'){
      if(e.stateTime<=0){state(e,'rest',1.7);e.vx=0}
    }else if(e.state==='rest'){e.vx*=Math.max(0,1-dt*8);if(e.stateTime<=0)state(e,e.type==='sleepyDog'?'sleep':'idle',0)}
  }
  if(e.type==='bouncer'){
    if(e.grounded){e.vx=0;if(e.stateTime<=0){e.vx=e.face*125;e.vy=-480;e.grounded=false;state(e,'hop',1.65)}}
  }
  if(e.type==='tennis'){
    e.vx=0;e.face=Math.sign(dx)||-1;
    if(e.state==='warning'&&e.stateTime<=0){ball(g,e,e.face*170,-60);state(e,'rest',2.3)}
    else if(e.stateTime<=0&&Math.abs(dx)<700){state(e,'warning',.7)}
  }
  moveDog(e,dt,platforms);
}
function updateBarko(g,e,dt){
  const p=g.player;e.invuln=Math.max(0,e.invuln-dt);
  if(e.state==='defeated')return;
  if(e.state==='waiting'){if(p.x>=g.main.arena.left-100){g.main.arena.active=true;state(e,'chargeWarning',1.1);e.face=Math.sign(p.x-e.x)||-1;g.emit('toast','CAPTAIN BARKO · Dodge, then attack while dizzy!')}return}
  if(e.state==='chargeWarning'&&e.stateTime<=0){state(e,'charge',3);e.vx=e.face*390}
  else if(e.state==='charge'){
    e.x+=e.vx*dt;
    if(e.x<=e.min||e.x>=e.max){e.x=Math.max(e.min,Math.min(e.max,e.x));e.vx=0;state(e,'dizzy',2.7);g.burst(e.x+45,e.y,'#ffe579',18)}
  }else if(e.state==='ballWarning'&&e.stateTime<=0){state(e,'barrage',1.4);e.shots=0;e.shotTimer=0}
  else if(e.state==='barrage'){
    e.shotTimer-=dt;if(e.shots<3&&e.shotTimer<=0){ball(g,e,e.face*(155+e.shots*25),-270);e.shots++;e.shotTimer=.42}
    if(e.stateTime<=0)state(e,'dizzy',2.7);
  }else if(e.state==='slamWarning'&&e.stateTime<=0){state(e,'slam',2);e.vy=-680}
  else if(e.state==='slam'){
    e.vy+=1350*dt;e.y+=e.vy*dt;
    if(e.y+e.h>=FLOOR){e.y=FLOOR-e.h;e.vy=0;for(const dir of [-1,1])g.projectiles.push({x:e.x+e.w/2,y:FLOOR-20,w:38,h:20,vx:dir*200,vy:0,type:'wave',life:3,distance:0});state(e,'dizzy',2.7);g.burst(e.x+45,FLOOR,'#f8d38d',20)}
  }else if(e.state==='dizzy'&&e.stateTime<=0){e.pattern=(e.pattern+1)%3;e.face=Math.sign(p.x-e.x)||-1;state(e,['chargeWarning','ballWarning','slamWarning'][e.pattern],1.1)}
}
export function updateProjectiles(g,dt,platforms){
  for(const a of g.projectiles){
    a.life-=dt;const bottom=a.y+a.h;a.x+=a.vx*dt;a.distance+=Math.abs(a.vx*dt);
    if(a.type==='tennis')a.vy+=480*dt;
    a.y+=a.vy*dt;
    for(const s of platforms)if(intersects(a,s)){if(a.bounce&&a.vy>0&&bottom<=s.y+10){a.y=s.y-a.h;a.vy=-260}else a.life=0}
    if(a.life<=0)continue;
    if(a.type==='fireball'){
      for(const e of g.level.enemies)if(e.alive&&!e.hidden&&e.state!=='defeated'&&intersects(a,e)){if(e.faction==='dog')hitDog(g,e,'fireball',a);else{e.hp--;if(e.hp<=0)g.defeat(e)}a.life=0;break}
      for(const h of g.level.hazards)if(h.type==='barrel'&&h.phase==='rolling'&&intersects(a,h)){h.phase='cooldown';h.timer=3;a.life=0;g.burst(h.x,h.y,'#d7ab6c',12)}
    }else if(intersects(a,g.player)){g.damage();a.life=0}
  }
  g.projectiles=g.projectiles.filter(a=>a.life>0&&a.distance<950&&a.y<780);
}
export function updateBarrel(g,h,dt){
  if(h.phase==='idle'&&Math.abs(g.player.x-h.x)<650){h.phase='warning';h.timer=1.2}
  else if(h.phase==='warning'){h.timer-=dt;if(h.timer<=0)h.phase='rolling'}
  else if(h.phase==='rolling'){h.vy+=950*dt;h.x+=h.vx*dt;h.y+=h.vy*dt;const ramp=455-(h.x+21-(h.originX-180))/270*140,surface=h.x+21>=h.originX-180?ramp:FLOOR;if(h.y+h.h>=surface){h.y=surface-h.h;h.vy=0}if(h.originX-h.x>650){h.phase='cooldown';h.timer=3}}
  else if(h.phase==='cooldown'){h.timer-=dt;if(h.timer<=0){h.phase='idle';h.x=h.originX;h.y=h.originY;h.vy=0}}
}
