import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/engine.js';
import {Renderer} from '../src/art.js';
function context(){return new Proxy({}, {get(t,k){if(k in t)return t[k];if(k==='createLinearGradient'||k==='createRadialGradient')return ()=>({addColorStop(){}});return (...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${String(k)}: invalid canvas coordinate`)}}})}
function element(){return {innerHTML:'',textContent:'',hidden:false,style:{},dataset:{},handlers:{},classList:{held:false,add(){},remove(){},toggle(k,v){this.held=v}},clientWidth:1280,clientHeight:720,addEventListener(type,fn){(this.handlers[type]??=[]).push(fn)},setAttribute(){},focus(){},getContext:()=>context(),querySelector(){return null},setPointerCapture(){}}}
test('chapter transitions, persisted unlocks, retry chapter, and interrupted touches work through the web entry',async()=>{
  const elements=new Map(),handlers={},windowHandlers={},timers=new Map(),buttons=['left','right','run','jump','attack'].map(key=>Object.assign(element(),{dataset:{key}}));let timerId=0,saved,activeGame;
  const originalReset=Game.prototype.reset,nativeTimeout=globalThis.setTimeout,nativeClear=globalThis.clearTimeout;
  Game.prototype.reset=function(...args){activeGame=this;return originalReset.apply(this,args)};
  globalThis.window=globalThis;globalThis.matchMedia=()=>({matches:false});globalThis.localStorage={getItem:()=>null,setItem(k,v){saved=JSON.parse(v)}};
  globalThis.document={querySelector:s=>{if(!elements.has(s))elements.set(s,element());return elements.get(s)},querySelectorAll:()=>buttons,addEventListener:(type,fn)=>handlers[type]=fn,fonts:{ready:Promise.resolve()}};
  globalThis.addEventListener=(type,fn)=>(windowHandlers[type]??=[]).push(fn);
  Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate(){}},configurable:true});
  globalThis.Image=class{naturalWidth=1774;naturalHeight=887;set src(value){queueMicrotask(()=>this.onload())}async decode(){}};
  globalThis.ResizeObserver=class{constructor(fn){this.fn=fn}observe(){this.fn()}};
  globalThis.requestAnimationFrame=cb=>{if(cb.name!=='frame')queueMicrotask(()=>cb(performance.now()));return 1};
  globalThis.setTimeout=(fn,ms)=>{timers.set(++timerId,{fn,ms});return timerId};globalThis.clearTimeout=id=>timers.delete(id);
  try{
    await import('../src/main.js');const screen=elements.get('#screen');
    const click=action=>handlers.click({target:{closest:()=>({dataset:{action}})}});
    const press=(key,id,type='pointerdown')=>buttons.find(b=>b.dataset.key===key).handlers[type].forEach(fn=>fn({pointerId:id,pointerType:'touch',preventDefault(){}}));
    const fireTimer=ms=>{const entry=[...timers].find(([,t])=>t.ms===ms);assert.ok(entry,`Missing ${ms}ms story timer`);timers.delete(entry[0]);entry[1].fn()};
    click('enter');click('levels');assert.match(screen.innerHTML,/Locked · Complete Level 1/);click('kingdom');assert.match(screen.innerHTML,/SELECT LEVEL/);
    click('start');click('play');
    for(const trigger of [()=>click('togglePause'),()=>windowHandlers.blur.forEach(fn=>fn()),()=>windowHandlers.orientationchange.forEach(fn=>fn()),()=>{document.hidden=true;handlers.visibilitychange();document.hidden=false}]){
      ['right','run','jump','attack'].forEach((key,i)=>press(key,i+1));assert.ok(buttons.filter(b=>b.dataset.key!=='left').every(b=>b.classList.held));trigger();assert.ok(buttons.every(b=>!b.classList.held));assert.equal(activeGame.mode,'paused');click('togglePause');assert.equal(activeGame.mode,'playing');
    }
    press('right',1);activeGame.damage(true);assert.ok(buttons.every(b=>!b.classList.held));activeGame.respawn();
    Object.assign(activeGame.player,{x:activeGame.main.goal,y:531,grounded:true});activeGame.step(.01);assert.match(screen.innerHTML,/LEVEL 1 COMPLETE!/);assert.deepEqual(saved.completedLevels,[1]);assert.equal(saved.save.levelId,2);
    fireTimer(2200);assert.match(screen.innerHTML,/Mike has entered the Cat Kingdom/);fireTimer(6500);assert.equal(activeGame.levelId,2);assert.equal(activeGame.mode,'playing');assert.equal(screen.innerHTML,'');
    click('select');assert.match(screen.innerHTML,/The Cat Kingdom/);click('togglePause');assert.equal(activeGame.mode,'playing');
    // A reload-style Continue must retry the same chapter after game over.
    click('home');click('continue');assert.equal(activeGame.levelId,2);activeGame.lives=1;activeGame.damage(true);for(let i=0;i<40;i++)activeGame.step(.03);assert.match(screen.innerHTML,/Not yet, Mike/);click('play');assert.equal(activeGame.levelId,2);
    Object.assign(activeGame.player,{x:activeGame.main.goal,y:531,grounded:true});activeGame.step(.01);assert.match(screen.innerHTML,/LEVEL 2 COMPLETE!/);assert.match(screen.innerHTML,/Prince Xiaboo is close/);assert.deepEqual(saved.completedLevels,[1,2]);assert.equal(saved.save.levelId,3);
    fireTimer(3200);assert.match(screen.innerHTML,/THE DOG GUARD TERRITORY/);fireTimer(6500);assert.equal(activeGame.levelId,3);assert.equal(activeGame.mode,'playing');
    click('home');click('levels');assert.equal((screen.innerHTML.match(/Completed/g)||[]).length,2);assert.match(screen.innerHTML,/03 · The Dog Guard Territory/);assert.match(screen.innerHTML,/04 · The Shadow Castle/);assert.match(screen.innerHTML,/Locked · Complete Level 3/);assert.match(screen.innerHTML,/06 · Coming Soon/);
    click('territory');click('togglePause');assert.equal(activeGame.levelId,3);assert.equal(activeGame.mode,'playing');
    activeGame.main.gateOpen=true;activeGame.main.boss.state='defeated';Object.assign(activeGame.player,{x:activeGame.main.goal,y:531,grounded:true});activeGame.step(.01);assert.deepEqual(saved.completedLevels,[1,2,3]);assert.equal(saved.save.levelId,4);fireTimer(10000);assert.match(screen.innerHTML,/LEVEL 3 COMPLETE!/);assert.match(screen.innerHTML,/Prince Xiaboo is inside!/);
    fireTimer(3200);assert.match(screen.innerHTML,/THE SHADOW CASTLE/);fireTimer(8000);assert.equal(activeGame.levelId,4);assert.equal(activeGame.mode,'playing');
    click('home');click('continue');assert.equal(activeGame.levelId,4);activeGame.lives=1;activeGame.damage(true);for(let i=0;i<40;i++)activeGame.step(.03);click('play');assert.equal(activeGame.levelId,4);
    activeGame.main.gateOpen=true;activeGame.main.boss.state='defeated';activeGame.scene={kind:'escape',time:13.99};activeGame.step(.02);assert.deepEqual(saved.completedLevels,[1,2,3,4]);assert.equal(saved.save.levelId,5);assert.match(screen.innerHTML,/LEVEL 4 COMPLETE!/);assert.match(screen.innerHTML,/Lord Whiskeron escaped!/);fireTimer(3200);assert.match(screen.innerHTML,/THE GREAT ESCAPE/);fireTimer(8000);assert.equal(activeGame.levelId,5);assert.equal(activeGame.mode,'playing');
    click('home');click('levels');assert.equal((screen.innerHTML.match(/Completed/g)||[]).length,4);assert.match(screen.innerHTML,/05 · The Great Escape/);assert.match(screen.innerHTML,/06 · Coming Soon/);click('escape');click('togglePause');assert.equal(activeGame.levelId,5);
    click('home');click('continue');assert.equal(activeGame.levelId,5);activeGame.lives=1;activeGame.damage(true);for(let i=0;i<40;i++)activeGame.step(.03);click('play');assert.equal(activeGame.levelId,5);
    activeGame.main.gateOpen=true;activeGame.main.boss.state='defeated';activeGame.scene={kind:'airshipEnding',time:15.49};activeGame.step(.02);assert.deepEqual(saved.completedLevels,[1,2,3,4,5]);assert.equal(saved.save,null);fireTimer(600);assert.match(screen.innerHTML,/LEVEL 5 COMPLETE!/);assert.match(screen.innerHTML,/THE CHASE GOES TO THE SKY!/);assert.match(screen.innerHTML,/LEVEL 6 — COMING SOON/);click('home');click('levels');assert.equal((screen.innerHTML.match(/Completed/g)||[]).length,5);
  }finally{Game.prototype.reset=originalReset;globalThis.setTimeout=nativeTimeout;globalThis.clearTimeout=nativeClear}
});
test('Cat Kingdom, bonus vault, guard attacks, bell glow, acorns and ending render without invalid coordinates',()=>{
  const canvas=element(),renderer=new Renderer(canvas),g=new Game();g.reset(null,2);
  for(const [w,h] of [[1280,720],[844,390],[568,320],[320,240],[1024,768]]){
    canvas.clientWidth=w;canvas.clientHeight=h;renderer.resize();
    for(const x of [150,1400,6500,7800,10100,12500,16900,21500,24700]){g.camera=x-150;g.player.x=x;g.buffs.bell=12;g.attack();for(const phase of ['idle','warning','falling','cooldown']){g.main.hazards[0].phase=phase;renderer.render(g)}}
    g.level=g.cavern;g.camera=0;renderer.render(g);g.level=g.main;g.completed=true;g.winTime=2;renderer.render(g);g.completed=false;
  }
});
