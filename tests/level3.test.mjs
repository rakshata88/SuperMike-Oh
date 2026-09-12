import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Game} from '../src/engine.js';
import {createWorld} from '../src/levels.js';
import {canSelectLevel,completeLevel} from '../src/progress.js';
import {updateDog,hitDog,updateProjectiles,updateBarrel} from '../src/dogs.js';
import {Renderer} from '../src/art.js';
const tick=(g,s,input={})=>{for(let i=0;i<Math.ceil(s*120);i++)g.step(1/120,input)};
const game=()=>{const g=new Game();g.reset(null,3);return g};
const place=(g,x,y=590-g.player.h)=>Object.assign(g.player,{x,y,vx:0,vy:0,grounded:true,invuln:0});

test('third chapter adds all dogs, cats, bonus room, three paws and forgiving gaps',()=>{
  const l=createWorld(3),c=createWorld(3,true);
  assert.equal(l.title,'The Dog Guard Territory');assert.ok(l.checkpoint>l.width*.45&&l.checkpoint<l.width*.55);
  for(const type of ['patrol','charger','bouncer','shield','sleepyDog','tennis','barko','soldier','fast'])assert.ok(l.enemies.some(e=>e.type===type));
  for(const type of ['moving','fallingPlatform','suspended','breakable','mystery'])assert.ok(l.platforms.some(e=>e.type===type));
  const ground=l.platforms.filter(p=>p.type==='grass');for(let i=1;i<ground.length;i++)assert.ok(ground[i].x-ground[i-1].x-ground[i-1].w<=155);
  assert.equal([...l.items,...c.items].filter(i=>i.type==='paw').length,3);assert.ok(c.items.filter(i=>i.type==='coin').length>=35);
  for(const type of ['life','fire'])assert.ok(c.items.some(i=>i.type===type));assert.ok(c.platforms.some(p=>p.hidden));
  assert.equal(createWorld(1).width,19800);assert.equal(createWorld(2).width,25200);
});
test('saved Level 2 completion unlocks Level 3; three completions unlock the castle',()=>{
  const d={completed:true};assert.equal(canSelectLevel(d,3),false);completeLevel(d,2);assert.equal(canSelectLevel(JSON.parse(JSON.stringify(d)),3),true);completeLevel(d,3);assert.deepEqual(d.completedLevels,[1,2,3]);assert.equal(canSelectLevel(d,4),true);assert.equal(canSelectLevel(d,5),false);
  const g=game();g.nextLevel();assert.equal(g.levelId,4);
});
test('Fire Mike comes from a mystery block, fires both ways, rate limits, and downgrades in stages',()=>{
  const g=game(),b=g.main.platforms.find(p=>p.reward==='fire');place(g,b.x+5,b.y+b.h+1);g.player.vy=-300;g.step(.02,{jump:true});assert.equal(g.player.form,'fire');assert.equal(b.used,true);g.transform=0;
  place(g,500);g.player.face=1;g.attack();assert.equal(g.projectiles[0].vx,420);for(let i=0;i<30;i++)g.attack();assert.equal(g.projectiles.length,1);
  tick(g,.42);g.player.face=-1;g.attack();assert.equal(g.projectiles.at(-1).vx,-420);
  const lives=g.lives;g.player.invuln=0;g.damage();assert.equal(g.player.form,'super');assert.equal(g.player.h,78);g.player.invuln=0;g.damage();assert.equal(g.player.form,'normal');assert.equal(g.player.h,59);g.player.invuln=0;g.damage();assert.equal(g.lives,lives-1);
});
test('fireballs defeat cats and pups, expire at walls/range, and do not also punch',()=>{
  for(const type of ['soldier','patrol']){const g=game(),e=g.main.enemies.find(e=>e.type===type);g.firePower();g.transform=0;place(g,e.x-100);g.player.face=1;g.attack();assert.equal(e.alive,true);tick(g,.3);assert.equal(e.alive,false)}
  const g=game();g.firePower();g.transform=0;place(g,500);g.attack();updateProjectiles(g,2,[]);assert.equal(g.projectiles.length,0);
  g.player.attack=0;g.attack();const a=g.projectiles[0];updateProjectiles(g,.02,[{x:a.x+5,y:a.y-20,w:100,h:100}]);assert.equal(g.projectiles.length,0);
});
test('Shield Dog blocks frontal punches and fireballs, but rear attacks and stomps work',()=>{
  for(const kind of ['punch','fireball','stomp']){const g=game(),e=g.main.enemies.find(e=>e.type==='shield');e.face=-1;place(g,e.x-55);
    assert.equal(hitDog(g,e,kind),kind==='stomp');if(kind!=='stomp'){assert.equal(e.alive,true);g.player.x=e.x+70;assert.equal(hitDog(g,e,kind),true)}assert.equal(e.alive,false)}
});
test('patrol turns at bounds and obstacles; charger warns, commits and rests',()=>{
  const g=game(),e=g.main.enemies.find(e=>e.type==='patrol');e.x=e.min;e.vx=-78;updateDog(g,e,.03,{},g.main.platforms);assert.ok(e.vx>55);
  const c=g.main.enemies.find(e=>e.type==='charger');place(g,c.x-200);const x=c.x;updateDog(g,c,.01,{},g.main.platforms);assert.equal(c.state,'warning');assert.equal(c.x,x);
  for(let i=0;i<210;i++)updateDog(g,c,.01,{},g.main.platforms);assert.equal(c.state,'rest');assert.ok(Math.abs(c.x-x)<330);
});
test('bouncer has repeatable hops and Sleepy Dog ignores walking but wakes to run, attack or landing',()=>{
  const g=game(),b=g.main.enemies.find(e=>e.type==='bouncer');updateDog(g,b,.01,{},g.main.platforms);assert.ok(b.vy<0);for(let i=0;i<100;i++)updateDog(g,b,.01,{},g.main.platforms);assert.ok(b.grounded);assert.equal(b.vx,0);
  for(const noise of ['walk','run','attack','land']){const g=game(),e=g.main.enemies.find(e=>e.type==='sleepyDog');place(g,e.x-100);g.player.vx=noise==='run'?280:150;g.player.attack=noise==='attack'?.2:0;g.landingNoise=noise==='land'?.1:0;updateDog(g,e,.01,{run:noise==='run'},g.main.platforms);assert.equal(e.state,noise==='walk'?'sleep':'warning')}
});
test('tennis guard telegraphs and throws at a dodgeable speed with a cooldown',()=>{
  const g=game(),e=g.main.enemies.find(e=>e.type==='tennis');place(g,e.x-350);updateDog(g,e,.01,{},g.main.platforms);assert.equal(e.state,'warning');assert.equal(g.projectiles.length,0);updateDog(g,e,.71,{},g.main.platforms);assert.equal(g.projectiles.length,1);assert.equal(Math.abs(g.projectiles[0].vx),170);assert.equal(e.state,'rest');
});
test('barrels warn at their fixed chutes, roll down ramps and reset predictably',()=>{
  const g=game(),h=g.main.hazards[0];place(g,h.x-450);updateBarrel(g,h,.01);assert.equal(h.phase,'warning');const start=h.x;updateBarrel(g,h,1.21);assert.equal(h.phase,'rolling');updateBarrel(g,h,.1);assert.ok(h.x<start);assert.ok(h.y<500);for(let i=0;i<700;i++)updateBarrel(g,h,.01);assert.equal(h.phase,'cooldown');updateBarrel(g,h,3.1);assert.equal(h.x,start);assert.equal(h.phase,'idle');
});
test('dog house reveals from the left and enters/exits using only movement and waiting',()=>{
  const g=game(),door=g.main.pipes.find(p=>p.door);place(g,door.x+60);tick(g,1);assert.equal(g.level.cave,false);
  place(g,door.x+5);tick(g,1.5);assert.equal(g.level.cave,true);assert.ok(door.revealed);
  const exit=g.level.pipes[0];place(g,exit.x+25);tick(g,1.5);assert.equal(g.level.cave,false);assert.ok(g.player.x>door.x);
});
test('falling platforms warn before dropping, restore, and checkpoint preserves collections and score',()=>{
  const g=game(),s=g.main.platforms.find(p=>p.type==='fallingPlatform');place(g,s.x+50,s.y-g.player.h);tick(g,.2);assert.ok(s.fallTimer>0);assert.equal(s.y,s.originY);tick(g,.9);assert.ok(s.y>s.originY);
  place(g,g.main.checkpoint+1);g.coins=45;g.score=1234;tick(g,.01);const saved=g.snapshot();const loaded=game();loaded.reset(JSON.parse(JSON.stringify(saved)));assert.equal(loaded.player.x,g.main.checkpoint);loaded.damage(true);tick(loaded,1.2);assert.equal(loaded.score,saved.score);assert.equal(loaded.coins,saved.coins);assert.equal(loaded.player.super,false);assert.equal(loaded.levelId,3);
});
test('Barko cycles telegraphed charge, three balls, and slam waves with damage windows',()=>{
  const g=game(),e=g.main.boss;place(g,g.main.arena.left+50);updateDog(g,e,.01,{},g.main.platforms);assert.equal(e.state,'chargeWarning');assert.equal(hitDog(g,e),false);
  const seen=new Set();for(let i=0;i<1700;i++){updateDog(g,e,.01,{},g.main.platforms);seen.add(e.state)}
  for(const s of ['charge','dizzy','ballWarning','barrage','slamWarning','slam'])assert.ok(seen.has(s),s);assert.equal(g.projectiles.filter(p=>p.type==='tennis').length,3);assert.equal(g.projectiles.filter(p=>p.type==='wave').length,2);
});
test('boss requires five separated vulnerable hits, opens gate, saves defeat and awards completion once',()=>{
  const g=game(),e=g.main.boss;place(g,g.main.goal);g.step(.01);assert.equal(g.completed,false);assert.ok(g.player.x<g.main.goal);
  for(let i=0;i<5;i++){e.state='dizzy';e.invuln=0;assert.equal(hitDog(g,e,i%2?'fireball':'stomp'),true);if(i<4){assert.equal(hitDog(g,e),false);assert.equal(e.hp,4-i)}}
  assert.equal(e.state,'defeated');assert.equal(g.main.gateOpen,true);const saved=g.snapshot(),loaded=game();loaded.reset(saved);assert.equal(loaded.main.gateOpen,true);assert.equal(loaded.main.boss.state,'defeated');
  place(g,g.main.goal);g.step(.01);assert.equal(g.mode,'won');const score=g.score;tick(g,12);assert.equal(g.score,score);
});
test('tower can be climbed by Normal Mike without run or unavailable directional controls',()=>{
  // Real collision and jump simulation for every ascending tower step.
  const g=game();g.main.enemies=[];g.main.hazards=[];
  for(const [x,y,targetX,targetY] of [[14200,590,14325,480],[14490,480,14650,375],[14800,375,14945,275],[15070,275,15240,230]]){
    place(g,x,y-g.player.h);let landed=false;g.step(1/120,{}); // Release A between distinct jumps.
    for(let i=0;i<180;i++){g.step(1/120,{right:g.player.x<targetX,jump:true,jumpPressed:i===0});if(i>20&&g.player.grounded&&g.player.y+g.player.h<=targetY+30){landed=true;break}}
    assert.ok(landed,`Jump from ${x}, ${y} to ${targetX}, ${targetY}`);
  }
});
test('mobile markup has exactly left/right/A/B/C and no up/down button',()=>{
  const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');assert.deepEqual([...html.matchAll(/data-key="([^"]+)"/g)].map(m=>m[1]).sort(),['attack','jump','left','right','run']);
});
test('all territory scenes, dogs, effects, and cutscene render at desktop and mobile sizes',()=>{
  const ctx=new Proxy({}, {get(t,k){if(k in t)return t[k];if(k==='createLinearGradient'||k==='createRadialGradient')return ()=>({addColorStop(){}});return (...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),String(k))}}});
  const canvas={clientWidth:1280,clientHeight:720,getContext:()=>ctx},r=new Renderer(canvas),g=game();
  for(const [w,h] of [[1280,720],[844,390],[375,667]]){canvas.clientWidth=w;canvas.clientHeight=h;r.resize();g.viewWidth=r.w;for(const x of [800,3850,6900,8090,9390,10450,12500,15000,25180]){g.camera=x-250;place(g,x);g.firePower();g.transform=0;g.attack();r.render(g)}g.level=g.cavern;g.camera=0;r.render(g);g.level=g.main;g.main.gateOpen=true;g.completed=true;for(const t of [0,2,5,8]){g.winTime=t;r.render(g)}g.completed=false}
});
