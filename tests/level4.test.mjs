import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Game} from '../src/engine.js';
import {Renderer} from '../src/art.js';
import {createWorld} from '../src/levels.js';
import {shadowEnemy} from '../src/level4.js';
import {updateShadowEnemy,hitShadow,WHISKERON_DIALOGUE} from '../src/shadow.js';
import {updateProjectiles} from '../src/dogs.js';
import {canSelectLevel,completeLevel,completedLevels} from '../src/progress.js';
const tick=(g,s,input={})=>{for(let i=0;i<Math.ceil(s*120);i++)g.step(1/120,input)};
const game=()=>{const g=new Game();g.reset(null,4);return g};
const place=(g,x,y=590-g.player.h)=>Object.assign(g.player,{x,y,vx:0,vy:0,grounded:true,invuln:0,support:null});
const advance=(g,e,seconds)=>{for(let i=0;i<Math.ceil(seconds*120);i++){e.timer+=1/120;updateShadowEnemy(g,e,1/120,g.level.platforms)}};

test('castle extends four worlds, has two safe checkpoints, all enemies, hazards, and three paws',()=>{
  assert.deepEqual([1,2,3,4].map(id=>createWorld(id).width),[19800,25200,27600,30600]);
  const l=createWorld(4),a=createWorld(4,true);assert.deepEqual(l.checkpoints,[14500,27800]);assert.ok(l.checkpoints[1]<l.arena.left);
  for(const type of ['bat','knight','royalDog','mouse','ghost','cannon','whiskeron','soldier','patrol'])assert.ok(l.enemies.some(e=>e.type===type),type);
  assert.ok(l.hazards.some(h=>h.type==='chandelier'));for(const type of ['gear','moving','fallingPlatform','mystery'])assert.ok(l.platforms.some(s=>s.type===type));assert.ok(l.platforms.some(s=>s.skin==='shelf'));
  assert.equal([...l.items,...a.items].filter(i=>i.type==='paw').length,3);assert.ok(a.items.filter(i=>i.type==='coin').length>40);
  for(const type of ['life','fire','relic'])assert.ok(a.items.some(i=>i.type===type));assert.ok(a.enemies.some(e=>e.type==='ghost'&&e.harmless));
  const ground=l.platforms.filter(s=>s.type==='castleStone'&&s.y===590&&s.h>50);for(let i=1;i<ground.length;i++)assert.ok(ground[i].x-ground[i-1].x-ground[i-1].w<=155);
});
test('Level 3 completion unlocks Level 4, legacy saves survive, and completing Level 4 unlocks the chase',()=>{
  const data={completed:true};assert.equal(canSelectLevel(data,4),false);completeLevel(data,2);completeLevel(data,3);assert.equal(canSelectLevel(JSON.parse(JSON.stringify(data)),4),true);completeLevel(data,4);assert.deepEqual(completedLevels(data),[1,2,3,4]);assert.equal(canSelectLevel(data,5),true);
  const g=game();g.nextLevel();assert.equal(g.levelId,5);
});
test('Thunder mystery block grants a temporary recognizable Super form and restores Fire on expiry',()=>{
  const g=game(),b=g.main.platforms.find(s=>s.reward==='thunder');g.firePower();g.transform=0;place(g,b.x+5,b.y+b.h+1);g.player.vy=-300;g.step(.02,{jump:true});assert.equal(g.player.form,'thunder');assert.equal(g.player.super,true);assert.equal(g.player.h,78);assert.equal(b.used,true);
  place(g,500);tick(g,18.1);assert.equal(g.player.form,'fire');
  g.thunderPower();g.player.invuln=0;g.damage();assert.equal(g.player.form,'super');assert.equal(g.player.thunderTime,0);g.player.invuln=0;g.damage();assert.equal(g.player.form,'normal');g.player.invuln=0;const lives=g.lives;g.damage();assert.equal(g.lives,lives-1);
});
test('electric burst hits several nearby enemies in either direction with bounded range and cooldown',()=>{
  for(const dir of [-1,1]){const g=game();g.thunderPower();g.transform=0;place(g,600);g.player.face=dir;const start=dir>0?g.player.x+g.player.w:600;
    const near=shadowEnemy(start+dir*30-(dir<0?44:0),'mouse'),near2=shadowEnemy(start+dir*90-(dir<0?44:0),'mouse'),far=shadowEnemy(start+dir*230,'mouse');g.main.enemies=[near,near2,far];g.step(.01,{attackPressed:true});assert.equal(near.alive,false);assert.equal(near2.alive,false);assert.equal(far.alive,true);
    const original=g.player.attack;g.attack();assert.equal(g.player.attack,original);tick(g,.25);const late=shadowEnemy(start+dir*40-(dir<0?44:0),'mouse');g.main.enemies=[late];g.step(.01);assert.equal(late.alive,true,'electric damage window must close before cooldown ends');
  }
});
test('Thunder powers a timed bonus lift but normal attacks do not; main route needs no electricity',()=>{
  const g=game(),m=g.main.mechanisms[0];place(g,m.x-70);g.attack();assert.equal(m.timer,0);g.player.attack=0;g.thunderPower();g.transform=0;place(g,m.x-70);g.attack();assert.equal(m.timer,9);const lift=g.main.platforms.find(s=>s.powered);const y=lift.y;g.step(.03);assert.notEqual(lift.y,y);place(g,15000);tick(g,9.1);assert.equal(m.timer,0);tick(g,2);assert.ok(Math.abs(lift.y-lift.origin)<1);
  assert.ok(g.main.platforms.some(s=>s.y===590&&s.x<m.x&&s.x+s.w>m.x+800));
});
test('Shadow Bats telegraph a committed swoop and return to their home path',()=>{
  const g=game(),b=g.main.enemies.find(e=>e.type==='bat');place(g,b.x-80);advance(g,b,1.7);assert.equal(b.state,'swoopWarning');const target=b.targetX;g.player.x+=150;advance(g,b,.9);assert.equal(b.targetX,target);assert.equal(b.state,'swoop');advance(g,b,2);assert.equal(b.state,'patrol');assert.ok(Math.abs(b.x-b.homeX)<=65);
});
test('Knight Cat blocks basic front attacks, lowers its shield, and allows rear/fire attacks',()=>{
  const g=game(),e=g.main.enemies.find(e=>e.type==='knight');place(g,e.x-60);e.face=-1;g.attack();assert.equal(hitShadow(g,e),false);advance(g,e,2.5);assert.ok(['lunge','exposed'].includes(e.state));assert.equal(hitShadow(g,e),true);assert.equal(e.hp,1);assert.equal(hitShadow(g,e),false);e.invuln=0;e.state='patrol';assert.equal(hitShadow(g,e,'fireball',{vx:420}),true);assert.equal(e.alive,false);
  const back=shadowEnemy(1000,'knight');g.player.x=1080;assert.equal(hitShadow(g,back),true);
});
test('Royal Guard Dog requires three separated hits and stops at a ledge during its charge',()=>{
  const g=game(),e=shadowEnemy(950,'royalDog',590,800,1300);e.face=1;e.state='charge';e.stateTime=.65;g.main.platforms=[{x:0,y:590,w:1020,h:130,type:'castleStone'}];advance(g,e,.5);assert.ok(e.x+e.w<=1020);assert.equal(e.state,'rest');
  g.thunderPower();g.transform=0;g.attack();for(let i=0;i<3;i++){e.invuln=0;assert.equal(hitShadow(g,e,'electric'),true);assert.equal(e.hp,2-i)}assert.equal(e.alive,false);
});
test('Clockwork Mouse has a fixed wind-up pause; Ghost Cat moves only when unobserved and can be stunned',()=>{
  const g=game(),m=g.main.enemies.find(e=>e.type==='mouse');advance(g,m,1.7);assert.equal(m.state,'windup');const x=m.x;advance(g,m,.7);assert.equal(m.x,x);advance(g,m,.6);assert.equal(m.state,'patrol');
  const ghost=g.main.enemies.find(e=>e.type==='ghost');place(g,ghost.x-160);g.player.face=1;const origin=ghost.x;advance(g,ghost,.6);assert.equal(ghost.x,origin);g.player.face=-1;advance(g,ghost,.6);assert.ok(ghost.x<origin);assert.ok(origin-ghost.x<35);hitShadow(g,ghost);const paused=ghost.x;advance(g,ghost,2);assert.equal(ghost.x,paused);advance(g,ghost,2.1);assert.equal(ghost.state,'patrol');
});
test('Cannon Pup warns and launches slow horizontal toy balls; projectiles collide and expire',()=>{
  const g=game(),e=g.main.enemies.find(e=>e.type==='cannon');place(g,e.x-300);advance(g,e,1.7);assert.equal(e.state,'cannonWarning');assert.equal(g.projectiles.length,0);advance(g,e,.9);const a=g.projectiles[0];assert.equal(a.type,'rubber');assert.equal(Math.abs(a.vx),185);assert.equal(a.vy,0);updateProjectiles(g,.01,[{x:a.x-20,y:a.y-5,w:60,h:40}]);assert.equal(g.projectiles.length,0);
  g.projectiles.push({x:200,y:530,w:24,h:24,type:'orb',vx:170,vy:0,life:1,distance:0});updateProjectiles(g,2,[]);assert.equal(g.projectiles.length,0);
});
test('library doorway needs discovery, persists, and supports attack plus automatic entry and exit',()=>{
  const g=game(),pipe=g.main.pipes.find(p=>p.door);place(g,pipe.x+25);tick(g,1);assert.equal(g.level.cave,false);
  place(g,pipe.x-50);g.player.face=1;g.attack();assert.equal(pipe.revealed,true);assert.ok(g.collected.has('s4-archives'));g.player.attack=0;place(g,pipe.x+25);tick(g,1.5);assert.equal(g.level.cave,true);
  const exit=g.level.pipes[0];place(g,exit.x+25);tick(g,1.5);assert.equal(g.level.cave,false);assert.ok(g.player.x>pipe.x);
  const map=g.main.items.find(i=>i.type==='royalMap');g.pickup(map);g.pickup(g.cavern.items.find(i=>i.type==='relic'));const loaded=game();loaded.reset(JSON.parse(JSON.stringify(g.snapshot())));assert.ok(loaded.collected.has('s4-map'));assert.ok(loaded.collected.has('s4-relic'));assert.equal(loaded.main.pipes.find(p=>p.door).revealed,true);
});
test('both checkpoints preserve latest progress, and boss retry resets only the active fight',()=>{
  const events=[],g=new Game((type,message)=>events.push([type,message]));g.reset(null,4);
  for(const cp of g.main.checkpoints){place(g,cp+5);g.step(.01);assert.equal(g.checkpoint,cp);g.score=7100;g.coins=39;const saved=g.snapshot();g.reset(JSON.parse(JSON.stringify(saved)));assert.equal(g.player.x,cp);assert.equal(g.score,7100);g.damage(true);tick(g,1.2);assert.equal(g.player.x,cp);assert.equal(g.coins,39);assert.equal(g.player.super,false)}
  assert.ok(events.some(([type,text])=>type==='toast'&&text==='FINAL CHECKPOINT!'));
  g.main.boss.hp=2;g.main.boss.hidden=true;g.main.enemies.push({...shadowEnemy(29200,'bat'),summoned:true});g.respawn();assert.equal(g.main.boss.hp,7);assert.equal(g.main.boss.x,29500);assert.equal(g.main.boss.hidden,false);assert.equal(g.main.boss.state,'waiting');assert.equal(g.main.enemies.some(e=>e.summoned),false);
});
test('chandelier swings are deterministic; cracked floor warns before collapse over a real gap',()=>{
  const g=game(),other=game();tick(g,.5);tick(other,.5);assert.equal(g.main.hazards[0].x,other.main.hazards[0].x);assert.notEqual(g.main.hazards[0].x,g.main.hazards[0].anchorX);
  const floor=g.main.platforms.find(s=>s.castle);place(g,floor.x+50);tick(g,.2);assert.ok(floor.fallTimer>0);assert.equal(floor.y,590);tick(g,.9);assert.ok(floor.y>590);place(g,6400);tick(g,5);assert.equal(floor.broken,false);assert.equal(floor.y,590);
});
test('moving shelves and rotating gear platforms carry grounded Mike using existing collision support',()=>{
  for(const type of ['shelf','gear']){const g=game(),s=g.main.platforms.find(s=>type==='shelf'?s.skin==='shelf':s.type==='gear');g.main.enemies=[];place(g,s.x+80,s.y-g.player.h);g.player.support=s;const offset=g.player.x-s.x;tick(g,.2);assert.ok(g.player.grounded);assert.ok(Math.abs(g.player.x-s.x-offset)<.01);assert.ok(Math.abs(g.player.y+g.player.h-s.y)<.01)}
});
test('Normal Mike can climb clock gears and reach the high chamber route without Run',()=>{
  const g=game();g.main.enemies=[];g.main.hazards=[];
  for(const [x,y,targetX,targetY] of [[18220,590,18320,480],[18555,480,18690,400],[18915,380,19030,280],[19265,280,19390,251],[19610,235,19740,220]]){
    const support=g.main.platforms.find(s=>s.x<=x+g.player.w&&s.x+s.w>x&&Math.abs(s.y-y)<40);
    place(g,x,(support?.y||y)-g.player.h);g.player.support=support;let landed=false;g.step(1/120,{}); // Release A between distinct jumps.
    for(let i=0;i<190;i++){g.step(1/120,{right:g.player.x<targetX,jump:true,jumpPressed:i===0});if(i>20&&g.player.grounded&&g.player.x>=targetX-50&&g.player.y+g.player.h<=targetY+12){landed=true;break}}
    assert.ok(landed,`Jump ${x},${y} → ${targetX},${targetY}`);
  }
});
test('Whiskeron introduction freezes combat, supports A/C dialogue, and then starts a warned attack',()=>{
  const g=game();place(g,g.main.arena.left);g.step(.01);assert.equal(g.scene.kind,'intro');assert.equal(g.main.boss.hp,7);assert.equal(WHISKERON_DIALOGUE.length,4);tick(g,.8,{right:true});assert.equal(g.player.x,29100);const clock=g.scene.time;g.mode='paused';tick(g,1);assert.equal(g.scene.time,clock);g.mode='playing';
  for(let i=0;i<4;i++)g.step(.02,{attackPressed:true});assert.equal(g.scene,null);assert.equal(g.main.boss.state,'orbWarning');
});
test('Whiskeron has bounded summons, safe teleports, sequential phases and modest low-health acceleration',()=>{
  const g=game(),e=g.main.boss;place(g,29050);e.state='orbWarning';e.stateTime=.1;const seen=new Set();
  for(let i=0;i<3500;i++){advance(g,e,1/120);seen.add(e.state)}
  for(const name of ['orbs','vulnerable','summonWarning','teleportWarning','teleport','waveWarning'])assert.ok(seen.has(name),name);
  assert.ok(g.main.enemies.filter(b=>b.summoned&&b.alive).length<=3);assert.ok(g.projectiles.some(a=>a.type==='orb'));assert.ok(g.projectiles.some(a=>a.type==='magicWave'));
  e.state='teleport';e.stateTime=.001;e.destination=g.player.x;e.hidden=true;advance(g,e,.01);assert.equal(e.hidden,true);assert.ok(Math.abs(e.destination-g.player.x)>=180);assert.ok(e.stateTime>=.8);
  e.hp=3;e.state='orbWarning';e.stateTime=.001;e.face=-1;g.projectiles=[];advance(g,e,.03);assert.ok(Math.abs(g.projectiles[0].vx)<=170*1.16);
});
test('seven separated vulnerable boss hits trigger a nonlethal escape scene before a single completion',()=>{
  const g=game(),e=g.main.boss;place(g,29400);e.state='orbWarning';assert.equal(hitShadow(g,e,'fireball'),false);
  for(let i=0;i<7;i++){e.state='vulnerable';e.invuln=0;assert.equal(hitShadow(g,e,['punch','fireball','electric','stomp'][i%4]),true);if(i<6){assert.equal(hitShadow(g,e),false);assert.equal(e.hp,6-i)}}
  assert.equal(e.alive,true);assert.equal(e.state,'defeated');assert.equal(g.main.gateOpen,true);assert.equal(g.scene.kind,'escape');assert.equal(g.completed,false);tick(g,7);assert.equal(g.completed,false);assert.equal(e.hidden,true);tick(g,7.1);assert.equal(g.mode,'won');const score=g.score;tick(g,2);assert.equal(g.score,score);
});
test('saving after boss defeat resumes the escape scene instead of requiring a second fight',()=>{
  const g=game();g.checkpoint=27800;g.main.boss.state='vulnerable';g.main.boss.hp=1;hitShadow(g,g.main.boss);const loaded=game();loaded.reset(JSON.parse(JSON.stringify(g.snapshot())));assert.equal(loaded.main.boss.hp,0);assert.equal(loaded.scene.kind,'escape');loaded.step(.01);assert.ok(loaded.player.x>=29400);tick(loaded,14.1);assert.equal(loaded.mode,'won');
});
test('castle rendering covers enemies, power effects, archives, hazards and cinematic stages at mobile sizes',()=>{
  const ctx=new Proxy({}, {get(t,k){if(k in t)return t[k];if(k==='createLinearGradient'||k==='createRadialGradient')return ()=>({addColorStop(){}});return (...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),String(k))}}});
  const canvas={clientWidth:1280,clientHeight:720,getContext:()=>ctx},r=new Renderer(canvas),g=game();
  for(const [w,h] of [[1280,720],[844,390],[568,320],[375,667]]){canvas.clientWidth=w;canvas.clientHeight=h;r.resize();g.viewWidth=r.w;
    for(const x of [1100,2640,4070,6720,7790,8560,9800,11200,15140,18700,19800,29500]){g.camera=x-200;place(g,x);g.thunderPower();g.transform=0;g.player.attack=0;g.attack();r.render(g)}
    g.level=g.cavern;g.camera=0;r.render(g);g.level=g.main;for(const type of ['intro','escape'])for(const t of [0,3,6,9,12]){g.scene={kind:type,time:t,line:Math.min(3,Math.floor(t/2.5))};r.render(g)}g.scene=null;
  }
  const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');assert.deepEqual([...html.matchAll(/data-key="([^"]+)"/g)].map(m=>m[1]).sort(),['attack','jump','left','right','run']);
});
