import test from 'node:test';
import assert from 'node:assert/strict';
import {Renderer} from '../src/art.js';
import {Game} from '../src/engine.js';

function context(){return new Proxy({}, {get(target,key){if(key in target)return target[key];if(key==='createLinearGradient'||key==='createRadialGradient')return ()=>({addColorStop(){}});return (...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`Canvas ${String(key)} received a non-finite coordinate`)}}})}
function element(){return {innerHTML:'',textContent:'',hidden:false,style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},clientWidth:1280,clientHeight:720,addEventListener(){},setAttribute(){},focus(){},getContext:()=>context(),querySelector(){return null}}}

test('renderer runs all scenes at desktop and mobile sizes with valid canvas coordinates',()=>{const canvas=element(),r=new Renderer(canvas),g=new Game();for(const width of [1280,960,640]){canvas.clientWidth=width;r.resize();g.viewWidth=r.w;for(const mode of ['menu','intro','playing','won']){g.mode=mode;for(const x of [150,3740,9500,14000,19220]){g.camera=x-150;g.player.x=x;r.render(g)}}g.level=g.cavern;g.mode='playing';g.camera=0;r.render(g);g.level=g.main}});

test('web entry initializes, starts a run, pauses, resumes, and opens settings without runtime errors',async()=>{
  const elements=new Map(),handlers={},frames=[];
  globalThis.window=globalThis;globalThis.matchMedia=()=>({matches:false});globalThis.localStorage={getItem:()=>null,setItem(){}};
  globalThis.document={querySelector:s=>{if(!elements.has(s))elements.set(s,element());return elements.get(s)},querySelectorAll:()=>[],addEventListener:(event,fn)=>handlers[event]=fn,fonts:{ready:Promise.resolve()}};
  globalThis.addEventListener=()=>{};Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[]},configurable:true});
  globalThis.Image=class{naturalWidth=1774;naturalHeight=887;set src(value){this.url=value;queueMicrotask(()=>this.onload())}async decode(){}};
  globalThis.ResizeObserver=class{constructor(fn){this.fn=fn}observe(){this.fn()}};
  const nativeTimeout=globalThis.setTimeout;
  globalThis.setTimeout=(fn,ms)=>{const t=nativeTimeout(fn,ms);t.unref();return t};
  globalThis.requestAnimationFrame=cb=>{if(cb.name==='frame'){frames.push(cb);return 1}return nativeTimeout(()=>cb(performance.now()),0)};
  try{
    await import('../src/main.js');const screen=elements.get('#screen');assert.match(screen.innerHTML,/opening-screen/);
    const click=action=>handlers.click({target:{closest:()=>({dataset:{action}})}});
    assert.equal(elements.get('#opening-enter').disabled,false);assert.equal(elements.get('#loading-percent').textContent,'100%');
    click('enter');assert.match(screen.innerHTML,/Let’s adventure/);
    click('start');assert.match(screen.innerHTML,/I’m coming, Xiaboo/);
    click('play');assert.equal(screen.innerHTML,'');assert.equal(elements.get('#hud').hidden,false);
    frames.shift()(performance.now()+16);
    handlers.keydown({code:'Escape',preventDefault(){}});assert.match(screen.innerHTML,/Adventure on pause/);
    click('resume');assert.equal(screen.innerHTML,'');click('settings');assert.match(screen.innerHTML,/Sound effects/);
    click('home');assert.match(screen.innerHTML,/Continue/);
  }finally{globalThis.setTimeout=nativeTimeout}
});
