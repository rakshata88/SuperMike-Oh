import test from 'node:test';
import assert from 'node:assert/strict';
import {updatePlayerAnimation} from '../src/animation.js';
import {runningArm,runningLeg} from '../src/gait.js';
test('animation priority and state clocks preserve attacks over movement and air',()=>{
  const p={vx:285,vy:0,grounded:true,running:true};updatePlayerAnimation(p,.016);assert.equal(p.animation,'run');updatePlayerAnimation(p,.016);assert.equal(p.animationTime,.016);
  p.attack=.2;p.grounded=false;p.vy=-300;updatePlayerAnimation(p,.016);assert.equal(p.animation,'attack');updatePlayerAnimation(p,.016);assert.equal(p.animationTime,.016);
  p.hurtTime=.1;updatePlayerAnimation(p,.016);assert.equal(p.animation,'hurt');updatePlayerAnimation(p,.016,{dead:true});assert.equal(p.animation,'dead');
  p.attack=0;p.hurtTime=0;updatePlayerAnimation(p,.016);assert.equal(p.animation,'jump');p.vy=40;updatePlayerAnimation(p,.016);assert.equal(p.animation,'fall');p.grounded=true;p.landTime=.07;updatePlayerAnimation(p,.016);assert.equal(p.animation,'land');p.landTime=0;updatePlayerAnimation(p,.016);assert.equal(p.animation,'run');p.running=false;updatePlayerAnimation(p,.016);assert.equal(p.animation,'walk');p.vx=0;updatePlayerAnimation(p,.016);assert.equal(p.animation,'idle');
});
for(const kind of ['normal','super'])test(`${kind} arms oppose legs with fixed segment lengths, continuous joints and greater run swing`,()=>{
  for(let i=0;i<100;i++){const phase=i/100,a=runningArm(phase,kind,1),b=runningArm(phase+.5,kind,1);
    assert.ok(Math.abs(Math.hypot(a.elbow.x-a.shoulder.x,a.elbow.y-a.shoulder.y)-a.upper)<1e-8);
    assert.ok(Math.abs(Math.hypot(a.hand.x-a.elbow.x,a.hand.y-a.elbow.y)-a.fore)<1e-8);
    assert.ok(Math.abs((a.elbow.x-a.shoulder.x)+(b.elbow.x-b.shoulder.x))<1e-8);
  }
  assert.ok(runningLeg(0,kind).foot.x>0);assert.ok(runningArm(0,kind).elbow.x<runningArm(0,kind).shoulder.x);
  const walk=runningArm(0,kind,.3),run=runningArm(0,kind,1);assert.ok(Math.abs(run.elbow.x-run.shoulder.x)>Math.abs(walk.elbow.x-walk.shoulder.x));
  assert.deepEqual(runningArm(0,kind),runningArm(1,kind));
});
