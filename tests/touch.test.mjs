import test from 'node:test';
import assert from 'node:assert/strict';
import {bindTouchControls,bindGameplayGestures} from '../src/touch.js';
import {Game} from '../src/engine.js';

function setup(options={}){
  const buttons=['left','right','down','jump','attack','run'].map(key=>({
    dataset:{key},handlers:{},attributes:{},classList:{held:false,toggle(name,value){this.held=value}},
    addEventListener(type,fn){this.handlers[type]=fn},setPointerCapture(){},
    setAttribute(key,value){this.attributes[key]=value},getBoundingClientRect(){return {left:0,right:70,top:0,bottom:70}},
  }));
  const state={},pressed=[],input=bindTouchControls(buttons,state,{onPress:key=>pressed.push(key),...options});
  const send=(key,type,id)=>buttons.find(b=>b.dataset.key===key).handlers[type]({type,pointerId:id,pointerType:'touch',preventDefault(){}});
  return {buttons,state,pressed,input,send};
}
test('sliding a held pointer out and back cannot create a second A press',()=>{
  const released=[],s=setup({onRelease:key=>released.push(key)});s.send('jump','pointerdown',1);s.send('jump','pointerleave',1);s.send('jump','pointerdown',1);assert.deepEqual(s.pressed,['jump']);assert.equal(s.state.jump,false);assert.deepEqual(released,['jump']);s.send('jump','pointerup',1);s.send('jump','pointerdown',1);assert.deepEqual(s.pressed,['jump','jump']);
});
test('rapid taps preserve every press/release and all four simultaneous actions',()=>{
  const released=[],s=setup({onRelease:key=>released.push(key)});for(const [i,key] of ['right','run','attack'].entries())s.send(key,'pointerdown',i+1);
  for(let i=0;i<20;i++){s.send('jump','pointerdown',4);assert.ok(s.state.right&&s.state.run&&s.state.attack&&s.state.jump);s.send('jump','pointerup',4)}assert.equal(s.pressed.filter(k=>k==='jump').length,20);assert.equal(released.filter(k=>k==='jump').length,20);
});
test('gesture prevention is non-passive, scoped to gameplay, and leaves menus clickable',()=>{
  let active=true;const events={},shell={addEventListener(name,fn,options){assert.equal(options.passive,false);events[name]=fn}};bindGameplayGestures(shell,()=>active);
  const fire=(name,menu=false)=>{let prevented=false;events[name]({cancelable:true,target:{closest(selector){return selector.includes('.modal')?menu:true}},preventDefault(){prevented=true}});return prevented};
  for(const name of Object.keys(events)){assert.equal(fire(name),true);assert.equal(fire(name,true),false);active=false;assert.equal(fire(name),false);active=true}
});

test('three fingers can move, hold sprint, and jump; release ends sprint immediately',()=>{
  const {buttons,state,pressed,send}=setup();
  send('run','pointerdown',1);
  assert.equal(state.run,true);assert.equal(buttons.at(-1).attributes['aria-pressed'],'true');
  send('right','pointerdown',2);send('jump','pointerdown',3);
  const game=new Game();game.mode='playing';Object.assign(game.player,{y:531,grounded:true});
  game.step(1/60,{...state,jumpPressed:pressed.includes('jump')});
  for(let i=0;i<15;i++)game.step(1/60,state);
  assert.ok(game.player.x>180);assert.ok(game.player.y<490);
  send('right','pointercancel',2);assert.equal(state.right,false);assert.equal(state.jump,true);
  send('jump','pointerup',3);assert.equal(state.jump,false);assert.equal(state.run,true);
  send('run','pointerup',1);assert.equal(state.run,false);
});

test('releasing one finger does not cancel another finger on the same control; pause clears all',()=>{
  const {state,pressed,input,send}=setup();
  send('jump','pointerdown',1);send('jump','pointerdown',2);
  assert.deepEqual(pressed,['jump']);send('jump','lostpointercapture',1);assert.equal(state.jump,true);
  send('run','pointerdown',3);input.clear();assert.ok(Object.values(state).every(v=>v===false));
  send('jump','pointerup',2);assert.equal(state.jump,false);
});

test('touch presses outside active gameplay are ignored',()=>{
  const {state,pressed,send}=setup({enabled:()=>false});
  send('right','pointerdown',1);send('jump','pointerdown',2);send('run','pointerdown',3);
  assert.deepEqual(pressed,[]);assert.ok(!state.right&&!state.jump&&!state.run);
});

for(const dir of ['left','right'])for(const extra of [[],['jump'],['run'],['attack'],['run','jump'],['run','attack'],['jump','attack'],['run','jump','attack']]){
  test(`independent multitouch: ${[dir,...extra].join(' + ')}`,()=>{
    const {buttons,state,pressed,send}=setup(),actions=[dir,...extra];
    actions.forEach((key,id)=>send(key,'pointerdown',id+1));
    assert.deepEqual(Object.keys(state).filter(key=>state[key]).sort(),[...actions].sort());
    const game=new Game();game.mode='playing';Object.assign(game.player,{x:500,y:531,grounded:true});
    game.step(1/60,{...state,jumpPressed:pressed.includes('jump'),attackPressed:pressed.includes('attack')});
    assert.ok(dir==='left'?game.player.x<500:game.player.x>500);
    assert.equal(game.player.vy<0,extra.includes('jump'));
    assert.equal(game.player.attack>0,extra.includes('attack'));
    for(let id=0;id<actions.length;id++){
      send(actions[id],'pointerup',id+1);assert.equal(state[actions[id]],false);
      assert.equal(buttons.find(b=>b.dataset.key===actions[id]).classList.held,false);
      for(const remaining of actions.slice(id+1))assert.equal(state[remaining],true);
    }
  });
}
for(const event of ['pointerup','pointercancel','pointerleave','lostpointercapture'])test(`${event} clears the corresponding action and visual only`,()=>{
  const {buttons,state,send}=setup();send('right','pointerdown',1);send('run','pointerdown',2);send('run',event,2);
  assert.equal(state.run,false);assert.equal(state.right,true);assert.equal(buttons.at(-1).classList.held,false);
});
test('captured finger dragged outside a button releases it without activating neighbors',()=>{
  const {buttons,state,send}=setup();send('run','pointerdown',1);send('right','pointerdown',2);
  buttons.at(-1).handlers.pointermove({pointerId:1,clientX:80,clientY:35});
  assert.equal(state.run,false);assert.equal(state.right,true);assert.equal(state.jump,false);assert.equal(state.attack,false);
});
test('touch release stops movement and returns sprint to walking speed in one frame',()=>{
  const game=new Game();game.mode='playing';Object.assign(game.player,{x:500,y:531,grounded:true,vx:285});
  game.step(1/60,{right:true,touchRunReleased:true});assert.equal(game.player.vx,205);
  game.step(1/60,{touchMovement:true});assert.equal(game.player.vx,0);
});

for(const levelId of [1,2])test(`Down touch enters and exits the secret tunnel in Level ${levelId}`,()=>{
  const {state,send}=setup(),game=new Game();game.reset(null,levelId);
  for(const exit of [false,true]){
    const pipe=game.level.pipes.find(p=>exit?p.exit:p.secret);
    Object.assign(game.player,{x:pipe.x+25,y:pipe.y-game.player.h,grounded:true,vx:0,vy:0});
    send('down','pointerdown',1);game.step(1/60,state);assert.ok(game.transition);
    assert.equal(game.player.attack,0);assert.equal(state.jump,false);assert.equal(state.run,false);
    send('down','pointerup',1);assert.equal(state.down,false);
    for(let i=0;i<45;i++)game.step(1/60,state);
    assert.equal(game.level.cave,!exit);
  }
});
test('Down releases, cancels, and resets independently of held actions',()=>{
  for(const event of ['pointerup','pointercancel','pointerleave','lostpointercapture']){
    const {state,buttons,input,send}=setup();send('run','pointerdown',1);send('down','pointerdown',2);
    send('down',event,2);assert.equal(state.down,false);assert.equal(state.run,true);
    assert.equal(buttons.find(b=>b.dataset.key==='down').classList.held,false);
    send('down','pointerdown',3);input.clear();assert.ok(Object.values(state).every(v=>!v));
  }
});
