import test from 'node:test';
import assert from 'node:assert/strict';
import {createViewportController} from '../src/viewport.js';
import {Renderer} from '../src/art.js';
function setup(width,height,{visual=true,touch=true}={}){
  const events={},frames=[],properties={},classes=new Set();let layouts=0,rotations=0;
  const target=prefix=>({addEventListener(name,fn){assert.equal(events[prefix+name],undefined,`duplicate ${prefix+name}`);events[prefix+name]=fn}});
  const win={...target('window.'),innerWidth:width,innerHeight:height,requestAnimationFrame(fn){frames.push(fn)},screen:{orientation:target('orientation.')}};
  if(visual)win.visualViewport={...target('visual.'),width,height,offsetTop:0,offsetLeft:0};
  const doc=target('document.'),shell={style:{setProperty(k,v){properties[k]=v}},classList:{toggle(k,v){v?classes.add(k):classes.delete(k)}}},notice={},canvas={clientWidth:width,clientHeight:height};
  const game={camera:4000,level:{width:5000},viewWidth:0},renderer={w:1280,resize(){layouts++;this.w=Math.round(720*parseFloat(properties['--game-vw'])/parseFloat(properties['--game-vh']))}};
  globalThis.ResizeObserver=class{constructor(fn){events.observer=fn}observe(){}};
  const controller=createViewportController({shell,canvas,notice,renderer,game,win,doc,isTouch:()=>touch,onRotate(){rotations++}});
  function resize(w,h){win.innerWidth=w;win.innerHeight=h;if(visual){win.visualViewport.width=w;win.visualViewport.height=h}}
  function flush(){while(frames.length)frames.shift()()}
  return {controller,notice,properties,classes,game,renderer,events,frames,win,resize,flush,get layouts(){return layouts},get rotations(){return rotations}};
}
for(const [w,h] of [[375,667],[390,844],[393,852],[430,932],[412,915]])for(const visual of [true,false])test(`phone rotation round trip ${w}x${h}, VisualViewport=${visual}`,()=>{
  const s=setup(w,h,{visual});assert.equal(s.notice.hidden,false);assert.equal(s.controller.blocked,true);
  s.resize(h,w);s.events['window.orientationchange']();s.events['window.resize']();s.events['orientation.change']();s.events['visual.resize']?.();s.events.observer();assert.equal(s.frames.length,1);s.flush();
  assert.equal(s.layouts,2);assert.equal(s.rotations,1);assert.equal(s.notice.hidden,true);assert.equal(s.controller.blocked,false);assert.equal(s.properties['--game-vh'],`${w}px`);assert.equal(s.game.viewWidth,Math.round(720*h/w));assert.ok(s.game.camera<=5000-s.game.viewWidth);
  s.resize(w,h);s.events['window.resize']();s.flush();assert.equal(s.controller.blocked,true);s.resize(h,w);s.events['window.resize']();s.flush();assert.equal(s.controller.blocked,false);assert.equal(s.rotations,3);
});
test('Safari toolbar/focus/pageshow updates resize without repeating orientation resets',()=>{
  const s=setup(844,390);s.win.visualViewport.height=320;s.win.visualViewport.offsetTop=12;
  for(const event of ['visual.resize','visual.scroll','window.focus','window.pageshow','document.visibilitychange'])s.events[event]();s.flush();
  assert.equal(s.layouts,2);assert.equal(s.rotations,0);assert.equal(s.properties['--game-vh'],'320px');assert.equal(s.properties['--game-vy'],'12px');assert.equal(s.notice.hidden,true);
});
test('desktop portrait window does not block keyboard gameplay',()=>{const s=setup(600,900,{touch:false});assert.equal(s.controller.blocked,false);assert.equal(s.notice.hidden,true)});
test('canvas resize preserves uniform world scaling and ignores temporary zero geometry',()=>{
  const canvas={clientWidth:844,clientHeight:390,width:0,height:0,getContext:()=>({})},r=new Renderer(canvas);r.resize();
  assert.ok(Math.abs(canvas.width/canvas.height-844/390)<.001);canvas.clientHeight=0;r.resize();assert.ok(Number.isFinite(r.w));assert.equal(canvas.height,720);
});
