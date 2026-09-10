import test from 'node:test';
import assert from 'node:assert/strict';
import {bindTouchControls} from '../src/touch.js';
import {Game} from '../src/engine.js';

function setup(options={}){
  const buttons=['left','right','down','jump','attack','run'].map(key=>({
    dataset:{key},handlers:{},attributes:{},classList:{toggle(){}},
    addEventListener(type,fn){this.handlers[type]=fn},setPointerCapture(){},
    setAttribute(key,value){this.attributes[key]=value},
  }));
  const state={},pressed=[],input=bindTouchControls(buttons,state,{onPress:key=>pressed.push(key),...options});
  const send=(key,type,id)=>buttons.find(b=>b.dataset.key===key).handlers[type]({pointerId:id,pointerType:'touch',preventDefault(){}});
  return {buttons,state,pressed,input,send};
}

test('two fingers can move and jump while sprint stays toggled on',()=>{
  const {buttons,state,pressed,send}=setup();
  send('run','pointerdown',1);send('run','pointerup',1);
  assert.equal(state.run,true);assert.equal(buttons.at(-1).attributes['aria-pressed'],'true');
  send('right','pointerdown',2);send('jump','pointerdown',3);
  const game=new Game();game.mode='playing';Object.assign(game.player,{y:531,grounded:true});
  game.step(1/60,{...state,jumpPressed:pressed.includes('jump')});
  for(let i=0;i<15;i++)game.step(1/60,state);
  assert.ok(game.player.x>180);assert.ok(game.player.y<490);
  send('right','pointercancel',2);assert.equal(state.right,false);assert.equal(state.jump,true);
  send('jump','pointerup',3);assert.equal(state.jump,false);assert.equal(state.run,true);
  send('run','pointerdown',4);assert.equal(state.run,false);
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
