import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.js';

const dt=1/120;
function scene(platforms=[{x:0,y:590,w:2500,h:80,type:'grass'}],form='normal'){
  const events=[],g=new Game(type=>events.push(type));g.reset();
  if(form!=='normal'){g.power();g.transform=0;g.player.form=form}
  g.main.platforms=platforms;g.main.items=[];g.main.enemies=[];g.main.hazards=[];g.main.pipes=[];
  Object.assign(g.player,{x:100,y:590-g.player.h,vy:0,vx:0,grounded:true,support:platforms[0]});
  return {g,p:g.player,jumps:()=>events.filter(e=>e==='jump').length};
}
for(const form of ['normal','super','fire','thunder','dash'])for(const movement of [{},{left:true},{right:true},{run:true},{right:true,run:true},{left:true,run:true}])test(`one press across landing: ${form} ${JSON.stringify(movement)}`,()=>{
  const {g,p,jumps}=scene(undefined,form);p.x=1000;
  g.step(dt,{...movement,jump:true,jumpPressed:true});
  for(let i=0;i<180;i++)g.step(dt,{...movement,jump:true,jumpPressed:true}); // Defensive against repeated callbacks too.
  assert.equal(jumps(),1);assert.equal(p.grounded,true);assert.equal(p.vy,0);
  g.step(dt,movement);g.step(dt,{...movement,jump:true,jumpPressed:true});assert.equal(jumps(),2);
});
for(const x of [170,267,299.9])test(`landing center/left/right edge at ${x} stays on its surface`,()=>{
  const platform={x:200,y:400,w:100,h:12,type:'stone'},s=scene([platform]);
  Object.assign(s.p,{x,y:400-s.p.h-12,vy:260,grounded:false,support:null});
  for(let i=0;i<80;i++){s.g.step(dt,{jump:true});if(i>10){assert.equal(s.p.grounded,true);assert.equal(s.p.y+s.p.h,400);assert.equal(s.p.vy,0)}}assert.equal(s.jumps(),0);
});
test('side and head contacts never establish grounding; thin tops cannot be tunneled through',()=>{
  const wall={x:200,y:400,w:100,h:40,type:'stone'},{g,p}=scene([wall]);
  Object.assign(p,{x:168,y:402-p.h,grounded:false,support:null,vy:100});g.coyote=0;
  for(let i=0;i<4;i++){g.step(dt,{right:true});assert.equal(p.grounded,false)}
  Object.assign(p,{x:220,y:441,vy:-300,grounded:false});g.step(.02,{});assert.equal(p.grounded,false);assert.equal(p.vy,0);assert.equal(p.y,440);
  wall.h=2;Object.assign(p,{x:220,y:350-p.h,vy:950,grounded:false});g.step(.035,{});g.step(.035,{});assert.equal(p.grounded,true);assert.equal(p.y+p.h,400);
});
test('coyote time permits an intentional press after 70ms but expires after 120ms',()=>{
  for(const delay of [.07,.14]){const {g,p,jumps}=scene([{x:0,y:590,w:200,h:80,type:'grass'}]);p.x=199;p.vx=205;g.step(dt,{right:true});
    for(let i=0;i<Math.round(delay/dt);i++)g.step(dt,{right:true});g.step(dt,{right:true,jump:true,jumpPressed:true});assert.equal(jumps(),delay<.11?1:0);
  }
});
test('landing consumes one buffered tap, including a tap released before landing',()=>{
  for(const held of [true,false]){const {g,p,jumps}=scene();Object.assign(p,{y:500,vy:300,grounded:false,support:null});g.coyote=0;
    g.step(dt,{jump:held,jumpPressed:true});for(let i=0;i<200;i++)g.step(dt,{jump:held});assert.equal(jumps(),1);assert.equal(p.grounded,true);assert.equal(g.jumpBuffer,0);
  }
});
test('expired buffer and input reset cannot jump on a later landing',()=>{
  for(const clear of [false,true]){const {g,p,jumps}=scene();Object.assign(p,{y:100,vy:0,grounded:false,support:null});g.coyote=0;g.step(dt,{jump:true,jumpPressed:true});if(clear)g.clearJumpInput();for(let i=0;i<180;i++)g.step(dt,{jump:true});assert.equal(jumps(),0);assert.equal(p.grounded,true)}
});
for(const gap of [65,150,190])for(const run of [false,true])for(const form of ['normal','dash'])test(`continuous trajectory across ${gap} pit, run=${run}, ${form}`,()=>{
  const {g,p,jumps}=scene([{x:0,y:590,w:300,h:100,type:'grass'},{x:300+gap,y:590,w:1500,h:100,type:'grass'}],form);
  p.x=285;p.vx=run?(form==='dash'?421:285):205;g.step(dt,{right:true,run,jump:true,jumpPressed:true});let falling=false,landed=false;
  for(let i=0;i<180;i++){g.step(dt,{right:true,run,jump:true});if(p.grounded){landed=true;break}if(p.vy>=0)falling=true;if(falling)assert.ok(p.vy>=0);assert.ok(['jump','fall'].includes(p.animation))}
  assert.equal(jumps(),1);assert.equal(landed,true);assert.ok(p.x+p.w>300+gap);
});
for(const kind of ['moving','gear','fallingPlatform'])test(`${kind} carries feet continuously without jitter or automatic jump`,()=>{
  const s={x:50,y:590,w:250,h:16,type:kind,axis:'y',origin:590,range:40,speed:1,cx:175,cy:590,radius:30,phase:0,originY:590}, {g,p,jumps}=scene([s]);
  for(let i=0;i<100;i++){g.step(dt,{jump:true});assert.equal(p.grounded,true);assert.equal(p.support,s);assert.equal(p.y+p.h,s.y);assert.equal(p.vy,0)}assert.equal(jumps(),0);
});
test('airborne press cannot double jump and animation transitions only once per phase',()=>{
  const {g,p,jumps}=scene();g.step(dt,{jump:true,jumpPressed:true});g.step(dt,{});g.step(dt,{jump:true,jumpPressed:true});
  const states=[p.animation];for(let i=0;i<200;i++){g.step(dt,{jump:true});if(states.at(-1)!==p.animation)states.push(p.animation)}
  assert.equal(jumps(),1);assert.deepEqual(states,['jump','fall','land','idle']);
});
test('release and re-press between simulation frames preserves a genuine buffered input',()=>{
  const {g,p,jumps}=scene();g.step(dt,{jump:true,jumpPressed:true});
  for(let i=0;i<150&&!p.grounded;i++)g.step(dt,{jump:true});assert.equal(jumps(),1);
  g.step(dt,{jump:true,jumpPressed:true,jumpReleased:true});assert.equal(jumps(),2);
});
for(const frameTime of [1/60,1/30])test(`moving-platform transfer and release before next jump at ${1/frameTime} FPS`,()=>{
  const a={x:0,y:590,w:300,h:16,type:'moving',axis:'y',origin:590,range:8,speed:1},b={x:420,y:590,w:400,h:16,type:'moving',axis:'y',origin:590,range:8,speed:1};
  const {g,p,jumps}=scene([a,b]);p.x=260;p.vx=285;g.step(frameTime,{right:true,run:true,jump:true,jumpPressed:true});
  for(let i=0;i<90&&!p.grounded;i++)g.step(frameTime,{right:true,run:true,jump:true});assert.equal(p.support,b);assert.equal(jumps(),1);
  for(let i=0;i<10;i++){g.step(frameTime,{jump:true});assert.equal(p.y+p.h,b.y)}assert.equal(jumps(),1);
  g.step(frameTime,{});g.step(frameTime,{jump:true,jumpPressed:true});assert.equal(jumps(),2);
});
test('running over adjoining small platforms keeps a stable foot height',()=>{
  const platforms=Array.from({length:12},(_,i)=>({x:i*70,y:590,w:70,h:18,type:'stone'}));const {g,p,jumps}=scene(platforms);p.x=20;
  for(let i=0;i<100;i++){g.step(1/60,{right:true,run:true});assert.equal(p.grounded,true);assert.equal(p.y+p.h,590)}assert.equal(jumps(),0);
});
