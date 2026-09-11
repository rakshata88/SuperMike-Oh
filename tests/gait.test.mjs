import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceGait,runningLeg,gaitDimensions} from '../src/gait.js';
import {Game} from '../src/engine.js';
import {drawCharacter,loadCharacters} from '../src/characters.js';
test('planted feet stay fixed in world space for both forms and directions',()=>{
  for(const kind of ['normal','super'])for(const face of [-1,1]){const d=gaitDimensions[kind],distance=4,p1=.1,p2=advanceGait(p1,distance,kind==='super');
    const a=runningLeg(p1,kind),b=runningLeg(p2,kind);assert.ok(a.planted&&b.planted);assert.equal(a.foot.y,0);assert.equal(b.foot.y,0);
    assert.ok(Math.abs(face*a.foot.x*d.scale-(face*distance+face*b.foot.x*d.scale))<1e-8);
  }
});
test('opposing legs alternate planted and lifted positions with valid knee joints',()=>{
  for(const kind of ['normal','super'])for(let i=0;i<100;i++){const q=i/100,a=runningLeg(q,kind),b=runningLeg(q+.5,kind);assert.notEqual(a.planted,b.planted);
    for(const leg of [a,b]){assert.ok(Object.values(leg).filter(v=>typeof v==='object').every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));assert.ok(Math.abs(Math.hypot(leg.hip.x-leg.knee.x,leg.hip.y-leg.knee.y)-gaitDimensions[kind].thigh)<.001)}
  }
});
test('ground distance controls cadence; sprint is faster and walls, air, pauses and platform carry do not step',()=>{
  const measure=run=>{const g=new Game();g.reset();Object.assign(g.player,{x:400,y:531,grounded:true});for(let i=0;i<6;i++)g.step(1/120,{right:true,run});return g};
  const walk=measure(false),sprint=measure(true);for(let i=0;i<10;i++){walk.step(1/120,{right:true});sprint.step(1/120,{right:true,run:true})}assert.ok(sprint.player.gaitPhase>walk.player.gaitPhase);
  const g=new Game();g.reset();Object.assign(g.player,{x:1216,y:531,grounded:true,gaitPhase:.25});g.step(.02,{right:true});assert.equal(g.player.gaitPhase,.25);
  g.mode='paused';g.step(.02,{right:true});assert.equal(g.player.gaitPhase,.25);g.mode='playing';Object.assign(g.player,{x:400,y:300,grounded:false});g.step(.02,{right:true});assert.equal(g.player.gaitPhase,.25);
  const moving=g.main.platforms.find(s=>s.type==='moving');Object.assign(g.player,{x:moving.x+30,y:moving.y-g.player.h,grounded:true,support:moving,vx:0,vy:0});g.step(.02);assert.equal(g.player.gaitPhase,.25);
});
test('running renders articulated original artwork and freezes it when phase is unchanged',async()=>{
  globalThis.Image=class{naturalWidth=1774;naturalHeight=887;set src(v){queueMicrotask(()=>this.onload())}async decode(){}};await loadCharacters();
  const capture=(phase,time)=>{const calls=[];const c={globalAlpha:1,save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},roundRect(){},fill(){},clip(){},translate(...v){calls.push(['translate',...v])},scale(...v){calls.push(['scale',...v])},rotate(...v){calls.push(['rotate',...v])},drawImage(image,...v){calls.push(['image',...v])}};
    for(const kind of ['normal','super'])drawCharacter(c,kind,0,0,1,'run',time,1,{phase});return calls};
  const first=capture(.1,0);assert.deepEqual(first,capture(.1,90));assert.notDeepEqual(first,capture(.35,0));assert.equal(first.filter(c=>c[0]==='image').length,14);
});
