import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Game} from '../src/engine.js';
import {Renderer} from '../src/art.js';
import {createWorld,upcomingLevel} from '../src/levels.js';
import {ESCAPE_SECTIONS,chaseEnemy} from '../src/level5.js';
import {updateChaseEnemy,hitChase,chaseContact,breakChaseCrate,updateChaseProjectiles,updateCargo} from '../src/chase.js';
import {updateProjectiles} from '../src/dogs.js';
import {canSelectLevel,completeLevel,completedLevels} from '../src/progress.js';
const game=()=>{const g=new Game();g.reset(null,5);return g};
const tick=(g,s,input={})=>{for(let i=0;i<Math.ceil(s*120);i++)g.step(1/120,input)};
const place=(g,x,y=590-g.player.h)=>Object.assign(g.player,{x,y,vx:0,vy:0,grounded:true,invuln:0,support:null});
const advance=(g,e,s)=>{for(let i=0;i<Math.ceil(s*120);i++){e.timer+=1/120;updateChaseEnemy(g,e,1/120,g.level.platforms)}};
const quiet=g=>{g.main.enemies=[];g.chaseState.scenes=['trainSight','detach']};

test('five connected chase regions preserve the earlier worlds and keep Level 6 unavailable',()=>{
  assert.deepEqual([1,2,3,4,5].map(id=>createWorld(id).width),[19800,25200,27600,30600,34600]);
  assert.deepEqual(ESCAPE_SECTIONS.map(s=>s.id),['forest','river','train','mountain','airship']);
  const g=game();for(const type of ['fox','monkey','hedgehog','duck','fish','trainDog','raccoon','goat','eagle','howl','patrol','shield','soldier'])assert.ok(g.main.enemies.some(e=>e.type===type),type);
  assert.equal(g.main.boss.hp,8);assert.deepEqual(g.main.checkpoints,[10600,28100]);assert.equal(upcomingLevel.id,6);
  const data={completed:true};for(const id of [2,3])completeLevel(data,id);assert.equal(canSelectLevel(data,5),false);completeLevel(data,4);assert.equal(canSelectLevel(JSON.parse(JSON.stringify(data)),5),true);completeLevel(data,5);assert.deepEqual(completedLevels(data),[1,2,3,4,5]);assert.equal(canSelectLevel(data,6),false);g.nextLevel();assert.equal(g.levelId,5);
});
test('separate fox den and royal cargo have unique collections, lives, powers and a harmless sleeping fox',()=>{
  const g=game(),den=g.rooms.den,cargo=g.rooms.cargo;assert.notEqual(den,cargo);
  const ids=[g.main,den,cargo].flatMap(l=>l.items.map(i=>i.id));assert.equal(ids.length,new Set(ids).size);
  for(const l of [den,cargo]){assert.ok(l.items.filter(i=>i.type==='coin').length>=30);assert.ok(l.items.some(i=>i.type==='life'));assert.ok(l.items.some(i=>['fire','thunder'].includes(i.type)))}
  assert.ok(den.enemies.some(e=>e.harmless&&e.state==='sleep'));assert.equal([g.main,den,cargo].flatMap(l=>l.items).filter(i=>i.type==='paw').length,3);
  g.level=den;g.pickup(den.items[0]);const g2=game();g2.reset(JSON.parse(JSON.stringify(g.snapshot())));assert.equal(g2.rooms.den.items[0].taken,true);assert.equal(g2.rooms.cargo.items[0].taken,false);
});
test('both secret rooms enter by waiting and return safely, including the train cargo car',()=>{
  for(const target of ['den','cargo']){const g=game();quiet(g);const pipe=g.main.pipes.find(p=>p.target===target);if(target==='cargo')breakChaseCrate(g,g.main.platforms.find(s=>s.secretCrate));place(g,pipe.x+20,pipe.y-g.player.h);tick(g,1.5);assert.equal(g.level.roomId,target);assert.equal(g.transition,null);
    const exit=g.level.pipes.find(p=>p.exit);place(g,exit.x+20,exit.y-g.player.h);tick(g,1.95);assert.equal(g.level,g.main);assert.equal(g.deathTimer,0);assert.ok(g.player.grounded);assert.ok(Math.abs(g.player.x-(pipe.returnX??pipe.x+120))<1);assert.ok(g.main.platforms.some(s=>!s.broken&&g.player.x+g.player.w>s.x&&g.player.x<s.x+s.w&&Math.abs(g.player.y+g.player.h-s.y)<2));
  }
});
test('Dash mystery block preserves Mike, increases B speed, and touch release stops or returns to walking',()=>{
  const g=game();quiet(g);const b=g.main.platforms.find(s=>s.reward==='dash');place(g,b.x+4,b.y+b.h+1);g.player.vy=-300;g.step(.02,{jump:true});assert.equal(g.player.form,'dash');assert.equal(g.player.super,true);assert.equal(b.used,true);assert.equal(g.player.h,78);g.transform=0;place(g,500);tick(g,.7,{right:true,run:true,touchMovement:true});assert.ok(g.player.vx>410&&g.player.vx<425);
  g.step(.016,{right:true,touchMovement:true,touchRunReleased:true});assert.ok(g.player.vx<=205*1.12+.001);g.step(.016,{touchMovement:true});assert.equal(g.player.vx,0);
});
test('full-speed Dash C gives a bounded burst, one damage window and recovery; release keeps control',()=>{
  const g=game();quiet(g);g.dashPower();g.transform=0;place(g,600);g.player.vx=421;g.step(.016,{right:true,run:true,attackPressed:true,touchMovement:true});assert.ok(g.player.attackMove.dash);assert.ok(g.player.x-600>9);const attack=g.player.attack;g.attack();assert.equal(g.player.attack,attack);g.step(.016,{touchMovement:true});const x=g.player.x;g.step(.016,{touchMovement:true});assert.equal(g.player.x,x);
  tick(g,.3);const e=chaseEnemy(g.player.x+g.player.w+12,'monkey');g.main.enemies=[e];g.step(.016);assert.equal(e.alive,true,'recovery is not a second damaging window');
  tick(g,.6);g.player.attack=0;g.player.running=false;g.attack();assert.equal(g.player.attackMove.dash,undefined,'stationary Dash Mike uses the normal Super punch');
});
test('Dash breaks lightweight crates on collision and C reveals the cargo entrance permanently',()=>{
  const g=game();quiet(g);g.dashPower();g.transform=0;const s=g.main.platforms.find(s=>s.weak&&!s.secretCrate);place(g,s.x-50,s.y+s.h-g.player.h);g.player.vx=421;tick(g,.1,{right:true,run:true});assert.equal(s.broken,true);assert.ok(g.player.x>s.x-44);
  const secret=g.main.platforms.find(s=>s.secretCrate);place(g,secret.x-g.player.w-20,450-g.player.h);g.player.attack=0;g.player.face=1;g.attack();assert.equal(secret.broken,true);assert.equal(g.main.pipes.find(p=>p.chase).revealed,true);const copy=game();copy.reset(JSON.parse(JSON.stringify(g.snapshot())));assert.equal(copy.main.platforms.find(s=>s.secretCrate).broken,true);assert.equal(copy.main.pipes.find(p=>p.chase).revealed,true);
});
test('special forms downgrade consistently; Dash expiry restores Fire or paused Thunder, and Thunder carries from Level 4',()=>{
  for(const power of ['firePower','thunderPower','dashPower']){const g=game();g[power]();g.transform=0;g.player.invuln=0;g.damage();assert.equal(g.player.form,'super');g.player.invuln=0;g.damage();assert.equal(g.player.form,'normal');g.player.invuln=0;g.damage();assert.equal(g.lives,2)}
  const g=game();quiet(g);g.firePower();g.thunderPower();g.transform=0;g.player.thunderTime=7;g.dashPower();g.player.dashTime=.01;g.step(.02);assert.equal(g.player.form,'thunder');assert.equal(g.player.thunderTime,7);tick(g,7.1);assert.equal(g.player.form,'fire');
  g.reset(null,4);g.firePower();g.thunderPower();g.player.thunderTime=9;g.nextLevel();assert.equal(g.levelId,5);assert.equal(g.player.form,'thunder');assert.equal(g.player.thunderTime,9);g.player.thunderTime=.01;g.step(.02);assert.equal(g.player.form,'fire');
});
test('Scout Fox retreats, warns before turning and attacks only briefly; boomerangs return on a fixed path',()=>{
  const g=game(),fox=chaseEnemy(1000,'fox',590,500,1800);place(g,1040);advance(g,fox,.02);assert.equal(fox.state,'flee');assert.equal(fox.face,-1);advance(g,fox,.81);assert.equal(fox.state,'turnWarning');advance(g,fox,.76);assert.equal(fox.state,'charge');advance(g,fox,.62);assert.equal(fox.state,'look');
  const monkey=chaseEnemy(2550,'monkey',475);monkey.stateTime=0;place(g,2200);advance(g,monkey,.01);assert.equal(monkey.state,'throwWarning');advance(g,monkey,.86);const a=g.projectiles[0];assert.equal(a.type,'boomerang');const vx=a.vx,y=a.y;updateChaseProjectiles(g,1.5);assert.equal(a.vx,-vx);assert.equal(a.y,y);updateChaseProjectiles(g,1);assert.equal(a.vx,-vx);assert.equal(a.turned,true);
});
test('curled hedgehogs block plain punches and stomps but take special attacks',()=>{
  const g=game();for(const kind of ['punch','stomp','fireball','electric','dash']){const e=chaseEnemy(500,'hedgehog');e.state='charge';assert.equal(hitChase(g,e,kind),!['punch','stomp'].includes(kind),kind)}const e=chaseEnemy(500,'hedgehog');e.state='rest';assert.equal(hitChase(g,e,'punch'),true);
});
test('Pirate Duck rides its floating platform and throws slow balloons; fish jump vertically at repeatable intervals',()=>{
  const g=game(),duck=g.main.enemies.find(e=>e.type==='duck'&&e.support.type==='moving');place(g,duck.x+100,duck.y);duck.stateTime=10;const initial=duck.y;tick(g,.7);assert.ok(duck.alive);assert.ok(Math.abs(duck.y-initial)>1);assert.ok(Math.abs(duck.y+duck.h-duck.deck.y)<1);
  duck.stateTime=0;advance(g,duck,.01);assert.equal(duck.state,'balloonWarning');advance(g,duck,.81);assert.ok(g.projectiles.some(a=>a.type==='waterBalloon'&&Math.abs(a.vx)<=135));
  const fish=g.main.enemies.find(e=>e.type==='fish'),x=fish.x;fish.stateTime=0;advance(g,fish,.01);assert.equal(fish.hidden,false);advance(g,fish,1.3);assert.equal(fish.hidden,true);assert.equal(fish.x,x);advance(g,fish,2.3);assert.equal(fish.state,'jump');
});
test('train whistle is warned, spawns at most one backup, and cannot be repeated after reload',()=>{
  const g=game(),dog=g.main.enemies.find(e=>e.type==='trainDog');place(g,dog.x-100,450-g.player.h);dog.stateTime=0;advance(g,dog,.01);assert.equal(dog.state,'whistleWarning');advance(g,dog,1.1);assert.equal(g.chaseState.whistles.length,1);assert.equal(g.main.enemies.filter(e=>e.reinforcement).length,1);advance(g,dog,15);assert.equal(g.main.enemies.filter(e=>e.reinforcement).length,1);
  const copy=game();copy.reset(JSON.parse(JSON.stringify(g.snapshot())));const same=copy.main.enemies.find(e=>e.id===dog.id);place(copy,same.x-80,same.y);advance(copy,same,8);assert.equal(copy.main.enemies.filter(e=>e.reinforcement).length,0);
});
test('raccoon theft and refunds persist without duplicating coins, scores, lives or upgrades',()=>{
  const g=game(),e=g.main.enemies.find(e=>e.type==='raccoon');g.coins=100;g.lives=5;g.score=1234;g.firePower();g.transform=0;chaseContact(g,e);chaseContact(g,e);assert.equal(g.coins,97);assert.equal(g.lives,5);assert.equal(g.player.form,'fire');assert.equal(g.score,1234);
  const copy=game();copy.reset(JSON.parse(JSON.stringify(g.snapshot())));const thief=copy.main.enemies.find(n=>n.id===e.id);chaseContact(copy,thief);assert.equal(copy.coins,97);hitChase(copy,thief,'fireball');const score=copy.score;assert.equal(copy.chaseState.thefts[e.id].phase,'dropped');
  const loaded=game();loaded.reset(JSON.parse(JSON.stringify(copy.snapshot())));const refund=loaded.main.items.find(i=>i.type==='recoveredCoins');assert.ok(refund);loaded.pickup(refund);loaded.pickup(refund);assert.equal(loaded.coins,100);assert.equal(loaded.lives,5);assert.equal(loaded.score,score);const again=game();again.reset(loaded.snapshot());assert.ok(!again.main.items.some(i=>i.type==='recoveredCoins'&&!i.taken));
});
test('escaped raccoons keep at most three coins, and empty pockets never become negative',()=>{
  const g=game(),e=g.main.enemies.find(e=>e.type==='raccoon');g.coins=2;chaseContact(g,e);assert.equal(g.coins,0);place(g,300);tick(g,8.1);hitChase(g,e);assert.equal(g.chaseState.thefts[e.id].phase,'lost');assert.ok(!g.main.items.some(i=>i.type==='recoveredCoins'));const empty=g.main.enemies.filter(e=>e.type==='raccoon')[1];chaseContact(g,empty);assert.equal(g.coins,0);
});
test('goats stop before cliffs; eagles leave after three slow, warned drops',()=>{
  const g=game(),goat=g.main.enemies.find(e=>e.type==='goat');place(g,goat.x+40,goat.y);goat.stateTime=0;advance(g,goat,.01);assert.equal(goat.state,'chargeWarning');const support=g.main.platforms.find(s=>s.x<=goat.x&&s.x+s.w>=goat.x+goat.w&&s.y===480);advance(g,goat,2);assert.ok(goat.x>=support.x&&goat.x+goat.w<=support.x+support.w);assert.equal(goat.state,'rest');
  const eagle=g.main.enemies.find(e=>e.type==='eagle');place(g,eagle.x);advance(g,eagle,10);assert.equal(eagle.drops,3);assert.equal(eagle.alive,false);const drops=g.projectiles.filter(a=>a.type==='pinecone');assert.equal(drops.length,3);assert.ok(drops.every(a=>a.gravity===220&&a.vy===45));
});
test('all river deck gaps are crossable by Normal Mike using only Right and held A',()=>{
  const reference=game().main.platforms.filter(s=>s.x>=6200&&s.x<10300);
  for(const start of reference){const g=game();quiet(g);const d=g.main.platforms.find(s=>s.x===start.x);place(g,d.x+d.w-60,d.y-g.player.h);g.player.support=d;g.step(1/120,{right:true,jump:true,jumpPressed:true});tick(g,1.2,{right:true,jump:true});assert.equal(g.deathTimer,0,`deck ${d.x}`);assert.equal(g.lives,3,`deck ${d.x}`);assert.ok(g.player.x>=d.x+d.w+100-34,`crossed ${d.x}`);assert.ok(g.player.grounded,`landed after ${d.x}`)}
});
test('train gaps and the low tunnel are passable by Normal and Super Mike without crouching',()=>{
  for(const powered of [false,true]){
    for(const car of [0,1,2,5,6,7,8,9]){const g=game();quiet(g);if(powered){g.power();g.transform=0}const d=g.main.platforms.find(s=>s.car===car);if(car===5)breakChaseCrate(g,g.main.platforms.find(s=>s.secretCrate));place(g,d.x+d.w-60,d.y-g.player.h);g.step(1/120,{right:true,jump:true,jumpPressed:true});tick(g,1.1,{right:true,jump:true});assert.equal(g.lives,3,`car ${car}`);assert.ok(g.player.x>d.x+d.w);assert.ok(g.player.grounded,`car ${car} landed`)}
    const g=game();quiet(g);if(powered){g.power();g.transform=0}place(g,14500,450-g.player.h);let jumped=false;
    for(let i=0;i<1000&&g.player.x<15770;i++){const jump=g.player.grounded&&((g.player.x>15220&&g.player.x<15320)||(g.player.x>15440&&g.player.x<15520));g.step(1/120,{right:true,jump:jump||!g.player.grounded,jumpPressed:jump&&!jumped});jumped=jump}
    assert.ok(g.player.x>=15770,`tunnel exit ${powered}: ${g.player.x}`);assert.equal(g.lives,3);assert.equal(g.player.duck,false);
  }
});
test('Normal Mike climbs launch tower steps and clears the tall wall using A and Right',()=>{
  for(const x of [28970,29330,29690]){const g=game();quiet(g);const s=g.main.platforms.find(s=>s.x===x);place(g,s.x+s.w-60,s.y-g.player.h);g.player.support=s;g.step(1/120,{right:true,jump:true,jumpPressed:true});tick(g,1,{right:true,jump:true});assert.ok(g.player.x>=s.x+s.w+50);assert.ok(g.player.grounded);assert.equal(g.lives,3)}
  const g=game();quiet(g);place(g,30090,260-g.player.h);tick(g,.7,{right:true});assert.ok(g.player.x>30140+80);assert.equal(g.lives,3);
});
test('deep river uses life loss and respawn; mild mountain wind retains movement control',()=>{
  const g=game();quiet(g);g.power();g.transform=0;place(g,6535,674-g.player.h);g.player.grounded=false;g.step(.03);assert.equal(g.lives,2);tick(g,1);assert.equal(g.player.form,'normal');assert.ok(g.player.x<6200);
  place(g,22200);g.time=1;g.step(.03,{left:true,run:true});assert.ok(g.windPush<=30);tick(g,.4,{left:true,run:true});assert.ok(g.player.vx<-280);assert.ok(g.player.x<22200);
});
test('sliding cargo warns before moving, stays on its car and resets predictably',()=>{
  const g=game(),h=g.main.hazards.find(h=>h.type==='slidingCargo');place(g,h.x-300,450-g.player.h);const origin=h.x;updateCargo(g,h,.01);assert.equal(h.phase,'warning');updateCargo(g,h,1);assert.equal(h.x,origin);updateCargo(g,h,.11);assert.equal(h.phase,'sliding');for(let i=0;i<600;i++)updateCargo(g,h,.01);assert.equal(h.phase,'cooldown');assert.ok(h.x>=17220&&h.x+h.w<=17990);for(let i=0;i<301&&h.phase==='cooldown';i++)updateCargo(g,h,.01);assert.equal(h.phase,'idle');assert.equal(h.x,origin);
});
test('river and mountain scenes reset input, save once, and preserve checkpoints across retry',()=>{
  const g=game(),events=[];g.onEvent=(type)=>events.push(type);place(g,10600);g.step(.01);assert.equal(g.checkpoint,10600);assert.equal(g.scene.kind,'trainSight');assert.ok(events.includes('inputreset'));tick(g,4.1);assert.equal(g.scene,null);g.step(.01);assert.equal(g.scene,null);place(g,20800);g.step(.01);assert.equal(g.scene.kind,'detach');tick(g,3.7);assert.equal(g.scene,null);assert.ok(g.player.x>=21220);place(g,28100);g.step(.01);assert.equal(g.checkpoint,28100);const copy=game();copy.reset(JSON.parse(JSON.stringify(g.snapshot())));copy.damage(true);tick(copy,1);assert.equal(copy.player.x,28100);assert.equal(copy.main.boss.hp,8);assert.equal(copy.scene,null);
  const phone=game();phone.viewWidth=405;place(phone,10600);phone.camera=10470;phone.step(.01);tick(phone,2);assert.ok(phone.player.x>phone.camera&&phone.player.x+phone.player.w<phone.camera+phone.viewWidth,'Mike stays visible during the train glimpse on portrait screens');
});
test('Howl intro freezes combat and starts a committed, warned dash; eight separated hits defeat him nonlethally',()=>{
  const g=game(),b=g.main.boss;g.chaseState.scenes=['trainSight','detach'];place(g,31800);g.step(.01);assert.equal(g.scene.kind,'howlIntro');const x=g.player.x;tick(g,.4,{right:true,attackPressed:true});assert.equal(g.player.x,x);tick(g,5.1);assert.equal(g.scene,null);assert.equal(b.state,'dashWarning');const face=b.face;place(g,b.x+200);advance(g,b,1.2);assert.equal(b.face,face);assert.equal(hitChase(g,b,'fireball'),false);
  for(let i=0;i<8;i++){b.state='vulnerable';b.invuln=0;assert.equal(hitChase(g,b,['punch','stomp','fireball','electric','dash'][i%5]),true);if(i<7){assert.equal(hitChase(g,b),false);assert.equal(b.hp,7-i)}}assert.equal(b.alive,true);assert.equal(b.state,'defeated');assert.equal(g.main.gateOpen,true);assert.equal(g.scene.kind,'airshipEnding');assert.equal(g.completed,false);
});
test('Howl cycles sequential phases, with capped balls and drops and a modest low-health speed increase',()=>{
  const g=game(),b=g.main.boss;place(g,32400);b.state='dashWarning';b.stateTime=.01;b.face=-1;const seen=new Set();let maxShots=0;
  for(let i=0;i<12000;i++){advance(g,b,1/120);updateChaseProjectiles(g,1/120);updateProjectiles(g,1/120,g.main.platforms);g.player.invuln=100;seen.add(b.state);maxShots=Math.max(maxShots,g.projectiles.filter(a=>a.type==='howlBall').length)}
  for(const state of ['airDash','windBlast','balls','aerial','vulnerable'])assert.ok(seen.has(state),state);assert.ok(maxShots<=3);assert.equal(b.drops,2);
  b.hp=3;b.state='dashWarning';b.stateTime=.001;b.face=-1;advance(g,b,.01);assert.equal(Math.abs(b.vx),365*1.13);b.state='vulnerable';b.stateTime=0;b.pattern=2;advance(g,b,.01);assert.equal(b.state,'dashWarning');
});
test('Howl wind alone deals no damage; final chase lands safely, saves Sky Kingdom clue and completes once',()=>{
  const g=game(),b=g.main.boss;g.chaseState.scenes=['trainSight','detach'];place(g,32500);b.state='windBlast';b.stateTime=2;b.face=-1;const lives=g.lives;tick(g,.5,{right:true,run:true});assert.equal(g.lives,lives);assert.equal(g.deathTimer,0);assert.equal(g.windPush,-65);
  b.hp=1;b.state='vulnerable';b.invuln=0;hitChase(g,b);const saved=g.snapshot();const copy=game();copy.reset(JSON.parse(JSON.stringify(saved)));assert.equal(copy.main.boss.hp,0);assert.equal(copy.scene.kind,'airshipEnding');tick(copy,8.6);assert.equal(copy.player.y+copy.player.h,500);assert.equal(copy.lives,lives);assert.equal(copy.completed,false);tick(copy,3);assert.ok(copy.collected.has('s5-sky-map'));tick(copy,4);assert.equal(copy.mode,'won');const score=copy.score;tick(copy,2);assert.equal(copy.score,score);
  const phone=game();phone.reset(saved);phone.viewWidth=405;phone.camera=33100;tick(phone,1.5);assert.ok(phone.player.x>phone.camera&&phone.player.x+phone.player.w<phone.camera+phone.viewWidth,'portrait camera follows Mike as he approaches the airship');
});
test('escape renders all regions, rooms, powers, enemy telegraphs and story moments at mobile and desktop sizes',()=>{
  const c=new Proxy({}, {get(t,k){if(k in t)return t[k];if(k==='createLinearGradient'||k==='createRadialGradient')return ()=>({addColorStop(){}});return (...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${String(k)}: ${n}`)}}});
  const canvas={clientWidth:1280,clientHeight:720,getContext:()=>c},r=new Renderer(canvas),g=game();
  for(const [w,h] of [[1280,720],[844,390],[568,320],[375,667]]){canvas.clientWidth=w;canvas.clientHeight=h;r.resize();g.viewWidth=r.w;
    for(const form of ['normal','fire','thunder','dash']){g.player.form=form;g.player.dashTime=20;g.player.thunderTime=18;for(const e of g.main.enemies)e.state=e.type==='howl'?'vulnerable':'chargeWarning';for(const x of [1000,2500,3700,4500,6500,8200,11500,13000,14650,16300,17500,19400,21600,23900,26300,29600,32400,33500]){place(g,x);g.camera=x-220;r.render(g)}}
    for(const room of Object.values(g.rooms)){g.level=room;g.camera=300;r.render(g)}g.level=g.main;
    for(const kind of ['trainSight','detach','howlIntro','airshipEnding'])for(const time of [0,3,6,9,12,15]){g.scene={kind,time,line:Math.min(1,Math.floor(time/2.5))};r.render(g)}g.scene=null;
  }
  const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');assert.deepEqual([...html.matchAll(/data-key="([^"]+)"/g)].map(m=>m[1]).sort(),['attack','jump','left','right','run']);
});
