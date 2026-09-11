import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.js';
import {createWorld} from '../src/levels.js';
import {canSelectLevel,completeLevel,completedLevels} from '../src/progress.js';
const tick=(g,s,input={})=>{for(let i=0;i<s*120;i++)g.step(1/120,input)};
function game2(events=[]){const g=new Game((type,data)=>events.push([type,data]));g.reset(null,2);return g}
test('kingdom is longer, all mandatory gaps are forgiving, and elevated rewards have support',()=>{
  const l=createWorld(2);assert.ok(l.width>createWorld(1).width);assert.ok(l.checkpoint>l.width*.45&&l.checkpoint<l.width*.55);
  const ground=l.platforms.filter(s=>s.type==='grass');for(let i=1;i<ground.length;i++)assert.ok(ground[i].x-ground[i-1].x-ground[i-1].w<=170);
  for(const it of l.items.filter(i=>i.type!=='coin'))assert.ok(l.platforms.some(s=>it.x+28>s.x&&it.x<s.x+s.w&&s.y>=it.y&&s.y-it.y<160),`Unsupported ${it.type} at ${it.x}`);
  for(const type of ['brick','moving','breakable','mystery','pipe'])assert.ok(l.platforms.some(s=>s.type===type));
  for(const type of ['soldier','fast','guard'])assert.ok(l.enemies.some(e=>e.type===type));
});
test('level completion advances with score, lives, coins, and Super Mike intact',()=>{
  const g=new Game();g.mode='playing';g.power();g.transform=0;g.coins=24;g.score=1500;g.lives=4;g.nextLevel();
  assert.equal(g.levelId,2);assert.equal(g.coins,24);assert.equal(g.score,1500);assert.equal(g.lives,4);assert.equal(g.player.super,true);assert.equal(g.checkpoint,0);assert.equal(g.paws,0);
});
test('level selection is locked until completion, supports legacy saves, and survives serialization',()=>{
  const data={};assert.equal(canSelectLevel(data,2),false);assert.equal(canSelectLevel(data,3),false);completeLevel(data,1);
  assert.equal(canSelectLevel(JSON.parse(JSON.stringify(data)),2),true);completeLevel(data,2);completeLevel(data,2);assert.deepEqual(completedLevels(data),[1,2]);
  assert.equal(canSelectLevel({completed:true},2),true);
});
test('checkpoint persists in Level 2 and death respawns in this chapter',()=>{
  const events=[],g=game2(events);Object.assign(g.player,{x:12501,y:531,grounded:true});g.step(.01,{});assert.equal(g.checkpoint,12500);
  const saved=g.snapshot(),loaded=game2();loaded.reset(JSON.parse(JSON.stringify(saved)));assert.equal(loaded.levelId,2);assert.equal(loaded.player.x,12500);
  loaded.damage(true);tick(loaded,1.2);assert.equal(loaded.levelId,2);assert.equal(loaded.player.x,12500);assert.equal(loaded.lives,2);
  assert.ok(events.some(([type])=>type==='checkpoint'));
});
test('stationary pipe entry and exit work without a Down input in both chapters',()=>{
  for(const id of [1,2]){const g=new Game();g.reset(null,id);const pipe=g.main.pipes.find(p=>p.secret);Object.assign(g.player,{x:pipe.x+25,y:pipe.y-g.player.h,grounded:true});tick(g,1.5);assert.equal(g.level.cave,true);
    const exit=g.cavern.pipes.find(p=>p.exit);Object.assign(g.player,{x:exit.x+25,y:exit.y-g.player.h,grounded:true,vx:0,vy:0});tick(g,1.5);assert.equal(g.level.cave,false);assert.ok(g.player.x>pipe.x);
  }
});
test('bonus vault includes coins, power, life, bell, paw, and single-use bonus blocks',()=>{
  const g=game2();for(const type of ['coin','power','life','bell','paw'])assert.ok(g.cavern.items.some(i=>i.type===type));
  g.level=g.cavern;const b=g.cavern.platforms.find(p=>p.type==='mystery');Object.assign(g.player,{x:b.x+5,y:b.y+b.h+1,vy:-300});g.step(.02,{jump:true});assert.equal(b.used,true);assert.equal(g.coins,1);
  const saved=g.snapshot();g.reset(saved);assert.equal(g.cavern.platforms.find(s=>s.id===b.id).used,true);
});
test('normal attack needs two distinct hits on a guard; holding never repeats damage',()=>{
  const g=game2(),e=g.main.enemies.find(e=>e.type==='guard');Object.assign(g.player,{x:e.x-37,y:531,face:1,grounded:true});g.step(.01,{attackPressed:true,attack:true});assert.equal(e.hp,1);assert.equal(e.alive,true);
  tick(g,.1,{attack:true});assert.equal(e.hp,1);tick(g,.2);Object.assign(g.player,{x:e.x-37,y:531,face:1,grounded:true});g.step(.01,{attackPressed:true});assert.equal(e.alive,false);
});
test('normal Mike can punch a soldier while moving; Super Mike keeps his stronger attack',()=>{
  const g=game2(),e=g.main.enemies[0];Object.assign(g.player,{x:e.x-38,y:531,face:1,grounded:true});g.step(.01,{right:true,attackPressed:true});assert.equal(e.alive,false);assert.ok(g.player.vx>0);
  g.power();g.transform=0;g.player.attack=0;g.attack();assert.equal(g.player.attackMove.damage,3);
});
test('cat bell boosts speed, jump and attack for 12 seconds, preserving either form',()=>{
  for(const superMode of [false,true]){const g=game2();if(superMode){g.power();g.transform=0}g.pickup(g.main.items.find(i=>i.type==='bell'));assert.equal(g.buffs.bell,12);
    g.attack();assert.equal(g.player.attackMove.damage,superMode?4:2);Object.assign(g.player,{x:400,y:590-g.player.h,grounded:true});g.step(.01,{jump:true,jumpPressed:true});assert.ok(g.player.vy<-(superMode?760:700));
    g.player.x=150;g.player.vy=0;tick(g,12.1);assert.equal(g.buffs.bell,0);assert.equal(g.player.super,superMode);
  }
});
test('platform Fast Cats stay on their platform, turn at obstacles, and guards take two stomps',()=>{
  const g=game2(),fast=g.main.enemies.find(e=>e.type==='fast'&&e.y<500);g.player.x=fast.x-500;tick(g,5);assert.equal(fast.y+fast.h,380);assert.ok(fast.x>=fast.min&&fast.x<=fast.max);
  const e=g.main.enemies.find(e=>e.type==='guard');for(let i=0;i<2;i++){Object.assign(g.player,{x:e.x+5,y:e.y-g.player.h-1,vy:250,vx:0});g.step(.02);if(i===0)assert.equal(e.hp,1)}assert.equal(e.alive,false);
});
test('falling obstacles warn first and reset after falling; completion awards once',()=>{
  const g=game2(),h=g.main.hazards[0];g.player.x=h.x-190;g.step(.01);assert.equal(h.phase,'warning');assert.equal(h.y,h.originY);tick(g,.5);assert.equal(h.phase,'warning');tick(g,1.5);assert.ok(['falling','cooldown'].includes(h.phase));
  Object.assign(g.player,{x:g.main.goal,y:531,grounded:true});g.step(.01);assert.equal(g.mode,'won');const score=g.score;tick(g,5);assert.equal(g.score,score);
});
