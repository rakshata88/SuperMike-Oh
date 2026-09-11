import {FLOOR} from './level.js';
import {shadowEnemy} from './level4.js';
import {advanceGait} from './gait.js';
const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const state=(e,name,time)=>{e.state=name;e.stateTime=time};
export const WHISKERON_DIALOGUE=["So... you're the famous Mike.","You've caused quite a problem for my guards.","You came all this way for the Prince?","You'll have to get through me first!"];

export function resetShadowBoss(g){
  const e=g.main.boss;Object.assign(e,{x:e.homeX,y:e.homeY,hp:7,state:'waiting',stateTime:0,pattern:0,invuln:0,vx:0,vy:0,hidden:false,alive:true});g.main.arena.active=false;
  g.main.enemies=g.main.enemies.filter(e=>!e.summoned);g.scene=null;
}
export function hitShadow(g,e,kind='punch',projectile=null){
  if(!e.alive||e.hidden||e.state==='defeated'||e.invuln>0)return false;
  if(e.type==='whiskeron'&&e.state!=='vulnerable')return false;
  if(e.type==='ghost'){
    if(e.harmless||e.state==='stunned')return true;
    state(e,'stunned',4);g.burst(e.x+22,e.y,'#cbd5ff',10);if(!e.rewarded){g.score+=100;e.rewarded=true;g.emit('state')}return true;
  }
  const front=projectile?projectile.vx*e.face<0:(g.player.x+g.player.w/2-e.x-e.w/2)*e.face>0;
  if(e.type==='knight'&&kind==='punch'&&front&&!['lunge','exposed'].includes(e.state)){e.blocked=.3;g.burst(e.x+22,e.y,'#cbebfc',6);return false}
  const damage=e.type==='whiskeron'||e.type==='royalDog'?1:kind==='punch'?(g.player.attackMove?.damage||1):kind==='electric'?2:1;
  e.hp-=damage;e.invuln=e.type==='whiskeron'?1:.5;g.burst(e.x+e.w/2,e.y,'#c7edff',16);g.emit('stomp');
  if(e.hp<=0){
    if(e.type==='whiskeron'){
      state(e,'defeated',0);e.hidden=false;g.main.gateOpen=true;g.projectiles=[];for(const bat of g.main.enemies)if(bat.summoned)bat.alive=false;
      g.kills++;g.score+=5000;g.scene={kind:'escape',time:0};g.emit('inputreset');g.emit('state');g.emit('save');
    }else g.defeat(e);
  }
  return true;
}
function walk(e,dt,platforms,speed){
  e.vx=(e.face||-1)*speed;const foot=e.y+e.h,oldX=e.x;e.x+=e.vx*dt;
  const ahead=e.face>0?e.x+e.w+3:e.x-3;
  const blocked=e.x<e.min||e.x>e.max||platforms.some(s=>overlaps(e,s))||(e.grounded&&!platforms.some(s=>ahead>=s.x&&ahead<=s.x+s.w&&Math.abs(s.y-foot)<12));
  if(blocked){e.x=oldX;e.face*=-1;e.vx=0;if(e.state==='charge')state(e,'rest',1.8)}
  e.vy+=1350*dt;e.y+=e.vy*dt;e.grounded=false;
  for(const s of platforms)if(overlaps(e,s)&&e.vy>=0&&foot<=s.y+8){e.y=s.y-e.h;e.vy=0;e.grounded=true}
  if(e.y>800)e.alive=false;
}
function shot(g,e,type,speed,offset=0){g.projectiles.push({x:e.x+e.w/2,y:FLOOR-38-offset,w:24,h:24,vx:e.face*speed,vy:0,life:4.5,type,distance:0})}
export function updateShadowEnemy(g,e,dt,platforms){
  const p=g.player,dx=p.x-e.x;e.stateTime-=dt;e.invuln=Math.max(0,e.invuln-dt);e.blocked=Math.max(0,(e.blocked||0)-dt);
  if(e.type==='whiskeron'){updateWhiskeron(g,e,dt);return}
  if(e.type==='ghost'){
    if(e.harmless||e.state==='sleep')return;
    if(e.state==='stunned'){if(e.stateTime<=0)state(e,'patrol',0);return}
    e.watched=p.face*(e.x+e.w/2-p.x-p.w/2)>0;
    if(!e.watched){const targetX=clamp(p.x,e.homeX-350,e.homeX+350);e.x+=clamp(targetX-e.x,-48*dt,48*dt);e.y+=clamp(p.y-e.y,-32*dt,32*dt)}return;
  }
  if(e.type==='bat'){
    if(e.state==='patrol'){e.x=e.homeX+Math.sin(e.timer*1.2)*65;e.y=e.homeY+Math.sin(e.timer*2)*12;if(e.stateTime<=0&&Math.abs(dx)<420){e.fromX=e.x;e.fromY=e.y;e.targetX=clamp(p.x,e.homeX-210,e.homeX+210);e.targetY=clamp(p.y+8,e.homeY,535);state(e,'swoopWarning',.85)}}
    else if(e.state==='swoopWarning'&&e.stateTime<=0)state(e,'swoop',.8);
    else if(e.state==='swoop'){const t=clamp(1-e.stateTime/.8,0,1);e.x=e.fromX+(e.targetX-e.fromX)*t;e.y=e.fromY+(e.targetY-e.fromY)*t;if(e.stateTime<=0){e.fromX=e.x;e.fromY=e.y;state(e,'return',1)}}
    else if(e.state==='return'){const t=clamp(1-e.stateTime,0,1);e.x=e.fromX+(e.homeX-e.fromX)*t;e.y=e.fromY+(e.homeY-e.fromY)*t;if(e.stateTime<=0)state(e,'patrol',2.8)}
    e.face=Math.sign(dx)||1;return;
  }
  if(e.type==='cannon'){
    if(e.state==='patrol'&&e.stateTime<=0&&Math.abs(dx)<720){e.face=Math.sign(dx)||-1;state(e,'cannonWarning',.85)}
    else if(e.state==='cannonWarning'&&e.stateTime<=0){shot(g,e,'rubber',185);state(e,'patrol',2.5)}return;
  }
  if(e.type==='mouse'){
    if(e.stateTime<=0)state(e,e.state==='windup'?'patrol':'windup',e.state==='windup'?1.8:1.2);
    walk(e,dt,platforms,e.state==='windup'?0:190);return;
  }
  if(e.type==='knight'){
    if(e.state==='patrol'&&e.stateTime<=0&&Math.abs(dx)<260){e.face=Math.sign(dx)||-1;state(e,'shieldWarning',.8)}
    else if(e.state==='shieldWarning'&&e.stateTime<=0)state(e,'lunge',.4);
    else if(e.state==='lunge'&&e.stateTime<=0)state(e,'exposed',1.5);
    else if(e.state==='exposed'&&e.stateTime<=0)state(e,'patrol',2.4);
    walk(e,dt,platforms,e.state==='patrol'?38:e.state==='lunge'?135:0);return;
  }
  if(e.type==='royalDog'){
    if(e.state==='patrol'&&e.stateTime<=0&&Math.abs(dx)<290){e.face=Math.sign(dx)||-1;state(e,'chargeWarning',.9)}
    else if(e.state==='chargeWarning'&&e.stateTime<=0)state(e,'charge',.65);
    else if(e.state==='charge'&&e.stateTime<=0)state(e,'rest',1.9);
    else if(e.state==='rest'&&e.stateTime<=0)state(e,'patrol',1.4);
    walk(e,dt,platforms,e.state==='patrol'?48:e.state==='charge'?235:0);
  }
}
function updateWhiskeron(g,e,dt){
  const p=g.player,fast=e.hp<=3?1.15:1;
  if(e.state==='defeated')return;
  if(e.state==='waiting'){
    if(p.x>=g.main.arena.left-70){g.main.arena.active=true;p.x=29100;p.face=1;state(e,'intro',0);g.scene={kind:'intro',time:0,line:0};g.projectiles=[];g.emit('inputreset')}return;
  }
  if(e.state==='orbWarning'&&e.stateTime<=0){state(e,'orbs',1.6/fast);e.shots=0;e.shotTime=0}
  else if(e.state==='orbs'){
    e.shotTime-=dt;if(e.shots<2&&e.shotTime<=0){shot(g,e,'orb',170*fast);e.shotTime=.7/fast;e.shots++}
    if(e.stateTime<=0)state(e,'vulnerable',2.9);
  }else if(e.state==='summonWarning'&&e.stateTime<=0){
    const count=g.main.enemies.filter(b=>b.summoned&&b.alive).length;
    for(let i=0;i<Math.min(2,3-count);i++){const x=p.x<29400?29730+i*110:28930+i*110,b=shadowEnemy(x,'bat',410,x-100,x+100);b.summoned=true;b.stateTime=2+i*.8;g.main.enemies.push(b);g.burst(x,370,'#c7b6ef',15)}state(e,'vulnerable',3);
  }else if(e.state==='teleportWarning'&&e.stateTime<=0){
    e.hidden=true;state(e,'teleport',1.1/fast);
  }else if(e.state==='teleport'){
    // If Mike walks into the destination, choose another spot and telegraph again.
    if(e.stateTime<=0){if(Math.abs(p.x-e.destination)<180){e.destination=teleportSpot(g);e.stateTime=.85}else{e.x=e.destination;e.hidden=false;e.face=Math.sign(p.x-e.x)||-1;g.burst(e.x+45,e.y,'#dbb7f5',28);state(e,'vulnerable',2.9)}}
  }else if(e.state==='waveWarning'&&e.stateTime<=0){
    for(const dir of [-1,1])g.projectiles.push({x:e.x+e.w/2,y:FLOOR-20,w:42,h:20,vx:dir*190*fast,vy:0,type:'magicWave',life:4,distance:0});state(e,'vulnerable',2.9);
  }else if(e.state==='vulnerable'&&e.stateTime<=0){
    e.pattern=(e.pattern+1)%4;if(e.hp<=3&&e.pattern===1)e.pattern=2;
    e.face=Math.sign(p.x-e.x)||-1;if(e.pattern===2)e.destination=teleportSpot(g);
    state(e,['orbWarning','summonWarning','teleportWarning','waveWarning'][e.pattern],1.1/fast);
  }
}
function teleportSpot(g){const e=g.main.boss;return [e.min,e.max-30].sort((a,b)=>Math.abs(b-g.player.x)-Math.abs(a-g.player.x))[0]}

export function updateCastle(g,dt){
  for(const m of g.level.mechanisms||[])m.timer=Math.max(0,m.timer-dt);
  for(const h of g.level.hazards)if(h.type==='chandelier'){const angle=Math.sin(g.time*.85+h.anchorX*.001)*.7;h.x=h.anchorX+Math.sin(angle)*h.length-h.w/2;h.y=h.anchorY+Math.cos(angle)*h.length;h.angle=angle}
  if(g.player.form==='thunder'){
    g.player.thunderTime=Math.max(0,(g.player.thunderTime||0)-dt);
    if(g.player.thunderTime===0){g.player.form=g.player.thunderReturn==='fire'?'fire':'super';g.player.attack=0;g.emit('toast','Thunder fades. Keep going, Mike!');g.emit('state')}
  }
  // A used nearby secret block reveals the library entrance as well as a direct C hit.
  for(const pipe of g.level.pipes)if(pipe.archive&&pipe.door&&pipe.secret&&!pipe.revealed&&g.level.platforms.some(s=>s.used&&s.id&&Math.abs(s.x-pipe.x)<160)){pipe.revealed=true;g.collected.add('s4-archives')}
}
export function castleAttack(g){
  const p=g.player,reach=p.attackMove.reach||55,box={x:p.face>0?p.x+p.w:p.x-reach,y:p.y+8,w:reach,h:60};
  for(const pipe of g.level.pipes)if(pipe.archive&&pipe.door&&pipe.secret&&!pipe.revealed&&overlaps(box,{x:pipe.x,y:pipe.y-100,w:pipe.w,h:100})){pipe.revealed=true;g.collected.add('s4-archives');g.emit('toast','ROYAL ARCHIVES! Pause at the secret doorway.');g.emit('save')}
  if(p.attackMove.electric)for(const m of g.level.mechanisms)if(overlaps(box,m)){m.timer=m.duration;g.burst(m.x,m.y,'#aaf4ff',18);g.emit('toast','BONUS LIFT POWERED · 9 seconds!')}
}
export function updateCastleScene(g,dt,input){
  const s=g.scene,p=g.player,e=g.main.boss,previousX=p.x;s.time+=dt;p.vx=0;p.vy=0;p.attack=0;p.grounded=true;p.y=FLOOR-p.h;
  if(s.kind==='intro'){
    if((input.attackPressed||input.jumpPressed)&&s.time>.5)s.time=(Math.floor(s.time/2.5)+1)*2.5;
    s.line=Math.min(3,Math.floor(s.time/2.5));
    if(s.time>=10){g.scene=null;e.face=Math.sign(p.x-e.x)||-1;state(e,'orbWarning',1.2);g.emit('inputreset')}
  }else{
    if(s.time<=dt+.001)p.x=Math.max(p.x,29400);
    if(s.time>5)e.hidden=true;
    if(s.time<3.5){p.x=Math.min(30000,p.x+dt*170);p.face=1;p.vx=170}
    else if(s.time>7&&s.time<10.5){p.x=Math.max(28900,p.x-dt*120);p.face=-1;p.vx=-120}
    if(s.time>=14){g.finishLevel()}
  }
  const focus=s.kind==='intro'?(g.viewWidth<900?(s.line===2?30040:29520):29600):s.time<7?29920:p.x;
  p.gaitPhase=advanceGait(p.gaitPhase||0,p.x-previousX,p.super);
  const aim=clamp(focus-g.viewWidth*.5,0,Math.max(0,g.main.width-g.viewWidth));g.camera+=(aim-g.camera)*Math.min(1,dt*3);
}
