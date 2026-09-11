import {createFullscreenController} from './fullscreen.js';
import {canSelectLevel,completeLevel,completedLevels} from './progress.js';
import {Game} from './engine.js';
import {Renderer,drawMike,drawCat} from './art.js';
import {Audio} from './audio.js';
import {loadCharacters} from './characters.js';
import {bindTouchControls} from './touch.js';
import {openingMarkup,loadOpeningArt,initializeOpening} from './opening.js';
const $=s=>document.querySelector(s),screen=$('#screen'),canvas=$('#game'),hud=$('#hud');
const audio=new Audio(),renderer=new Renderer(canvas);
const STORAGE='super-mike-oh-v1';
let data={settings:{sound:false,music:true,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches},best:0,completed:false,save:null};
try{const parsed=JSON.parse(localStorage.getItem(STORAGE));if(parsed&&typeof parsed==='object'){data={...data,...parsed,settings:{...data.settings,...parsed.settings}};if(data.save&&(!Array.isArray(data.save.collected)||!Number.isFinite(data.save.lives)))data.save=null}}catch{}
function persist(){try{localStorage.setItem(STORAGE,JSON.stringify(data))}catch{toast('Saving is unavailable in this browser. You can still play.')}}
let openingReady=false,selectedLevel=1;
let touchMovementUsed=false,previousTouchRun=false;
let toastTimer,winTimer,previousPanel='menu',hudStamp='',gamepadPrevious={},lastAutoSave=0;
const game=new Game((type,message)=>{
  if(type==='inputreset')clearInput();
  else if(type==='toast')toast(message);
  else if(type==='state')updateHUD();
  else if(type==='save'){data.save=game.snapshot();persist()}
  else if(type==='gameover'){data.save=null;persist();showGameOver()}
  else if(type==='win'){
    clearInput();audio.sfx('win');data.best=Math.max(data.best,game.score);completeLevel(data,game.levelId);
    if(game.levelId===1){data.save={levelId:2,coins:game.coins,score:game.score,lives:game.lives,kills:game.kills,collected:[]};persist();modal('<span class="eyebrow">LEVEL 1 COMPLETE!</span><h2>The Adventure Continues...</h2><p>Prince Xiaboo has been taken deeper into the kingdom.</p>');winTimer=setTimeout(()=>kingdomIntro(true),2200)}
    else if(game.levelId===2){data.save={levelId:3,coins:game.coins,score:game.score,lives:game.lives,kills:game.kills,collected:[]};persist();modal('<span class="eyebrow">LEVEL 2 COMPLETE!</span><h2>Prince Xiaboo is close...</h2><p>He is somewhere inside the kingdom. But a heavily guarded route separates Mike from the inner castle.</p>');audio.sfx('meow');winTimer=setTimeout(()=>territoryIntro(true),3200)}
    else if(game.levelId===3){data.save={levelId:4,coins:game.coins,score:game.score,lives:game.lives,kills:game.kills,collected:[]};persist();winTimer=setTimeout(()=>{modal('<span class="eyebrow">LEVEL 3 COMPLETE!</span><h2>Prince Xiaboo is inside!</h2><p>Mike finds a hidden passage beyond the closed gates.<br>Something is wrong inside the castle...</p>');winTimer=setTimeout(()=>castleIntro(true),3200)},10000)}
    else{data.save=null;persist();winTimer=setTimeout(showVictory,600)}
  }
  else {audio.sfx(type);if(type==='power')toast('SUPER MIKE MODE · Same Mike. Bigger power.');if(type==='checkpoint')audio.sfx('checkpoint')}
});
// The constructor emits before the game binding is assigned; HUD updates begin after initialization.
function updateHUD(){if(!window.__mikeReady)return;const stamp=[game.lives,game.coins,game.paws,game.score,game.player.super,game.player.form,game.level.cave,game.levelId].join();if(stamp===hudStamp)return;hudStamp=stamp;$('#hud-lives').textContent='♥ '.repeat(Math.max(0,Math.min(5,game.lives)))+(game.lives>5?`+${game.lives-5}`:'');$('#hud-coins').textContent=String(game.coins).padStart(2,'0');$('#hud-paws').textContent=`${game.paws}/3`;$('#hud-score').textContent=String(game.score).padStart(6,'0');$('#hud-power').textContent=game.player.form==='thunder'?'ϟ THUNDER MIKE':game.player.form==='fire'?'✦ FIRE MIKE':game.player.super?'✦ SUPER MIKE':'NORMAL MIKE';$('#hud-zone').textContent=game.level.cave?(game.levelId===4?'ROYAL ARCHIVES':game.levelId===3?'SECRET DOG HOUSE':game.levelId===2?'GOLDEN WHISKER VAULT':'THE WHISKER CAVERN'):game.main.title.toUpperCase()}
window.__mikeReady=true;
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2800)}
function settingsApply(){audio.enabled=!!data.settings.sound;audio.music=!!data.settings.music;renderer.reduced=!!data.settings.reduced;$('#sound-button').classList.toggle('sound-on',audio.enabled);$('#sound-button').setAttribute('aria-label',audio.enabled?'Mute sound':'Enable sound');$('#sound-button').setAttribute('aria-pressed',String(audio.enabled))}
settingsApply();
function catPortrait(){const c=$('.story-cat');if(c)drawCat(c.getContext('2d'),75,110,1.4,'prince',game.time,true)}
function modal(content){clearTimeout(winTimer);clearInput();$('#touch-controls').hidden=game.mode!=='paused';screen.innerHTML=`<div class="modal-shade"><section class="modal" role="dialog" aria-modal="true">${content}</section></div>`;catPortrait();requestAnimationFrame(()=>screen.querySelector('button')?.focus())}
function startPlay(saved=false,carry=false){$('#game-shell').classList.add('is-session');lastAutoSave=0;clearTimeout(winTimer);if(carry)game.nextLevel();else game.reset(saved?data.save:null,saved?(data.save?.levelId||1):selectedLevel);selectedLevel=game.levelId;game.mode='playing';screen.innerHTML='';hud.hidden=false;$('#game-bottom').hidden=true;$('#touch-controls').hidden=false;clearInput();canvas.focus({preventScroll:true});audio.unlock();updateHUD();toast(saved?'Welcome back, Mike. Your checkpoint is ready.':game.levelId===4?'LEVEL 4 — THE SHADOW CASTLE · Find Prince Xiaboo!':game.levelId===3?'LEVEL 3 — THE DOG GUARD TERRITORY · GO!':game.levelId===2?'LEVEL 2 — THE CAT KINGDOM · GO!':'GREEN PAW MEADOWS · Prince Xiaboo needs you!');data.save=game.snapshot();persist()}
function showMenu(){$('#game-shell').classList.remove('is-opening');$('#game-shell').classList.remove('is-session');clearTimeout(winTimer);if(game.mode==='playing'||game.mode==='paused'){data.save=game.snapshot();persist()}game.mode='menu';game.level=game.main;hud.hidden=true;$('#touch-controls').hidden=true;$('#game-bottom').hidden=false;clearInput();screen.innerHTML=`<div class="title-screen"><div class="title-copy"><span class="eyebrow">WELCOME TO THE KINGDOM OF XIABOO</span><h1>SUPER<span>MIKE-OH!</span></h1><p>One ordinary guy. One extraordinary cat.<br>A whole kingdom between them.</p><div class="title-actions"><button class="primary-button" data-action="start">Let’s adventure <span>→</span></button>${data.save?'<button class="continue-button" data-action="continue">Continue ↗</button>':'<button class="continue-button" data-action="how">How to play ↗</button>'}</div><div class="title-note">START SMALL. &nbsp; POWER UP. &nbsp; SAVE THE PRINCE.</div><div class="menu-utilities"><button data-action="levels">Level select</button><span>·</span><button data-action="settings">Settings</button><span>·</span><button data-action="credits">Credits</button></div></div><div class="world-tag"><span>✧</span><div><small>YOUR FIRST CHAPTER</small><b>Green Paw Meadows</b></div></div><div class="character-tag"><strong>Prince Xiaboo</strong> · worth every jump.</div></div>`}
function intro(){selectedLevel=1;clearInput();game.mode='intro';hud.hidden=true;$('#game-bottom').hidden=true;modal(`<span class="eyebrow">THE ADVENTURE BEGINS</span><canvas class="story-cat" width="150" height="125" aria-label="Prince Xiaboo, a cream royal cat"></canvas><h2>A tiny crown.<br>A very big problem.</h2><p>A mysterious army of mischievous cats has swept through the kingdom. Prince Xiaboo has been taken to the royal lookout beyond the meadows.</p><p><strong>Mike! Your favorite little royal needs you.</strong></p><div class="modal-actions"><button class="primary-button" data-action="play">I’m coming, Xiaboo! <span>→</span></button></div><button class="text-button" data-action="home">Back to the kingdom</button>`)}
function kingdomIntro(carry=false){
  if(!canSelectLevel(data,2))return;selectedLevel=2;game.mode='levelintro';hud.hidden=true;
  $('#game-shell').classList.add('is-session');$('#game-bottom').hidden=true;
  modal('<span class="eyebrow">SUPER MIKE-OH — LEVEL 2</span><h2>THE CAT KINGDOM</h2><p>Mike has entered the Cat Kingdom...<br>The cat guards know that he is coming.<br>Prince Xiaboo has been taken deeper into the kingdom.<br>Mike must continue his adventure and find him!</p><div class="modal-actions"><button class="primary-button" data-action="kingdomGo">GO!</button></div>');
  actions.kingdomGo=()=>{clearTimeout(winTimer);if(game.mode==='levelintro')startPlay(false,carry)};
  winTimer=setTimeout(actions.kingdomGo,6500);
}
function territoryIntro(carry=false){
  if(!canSelectLevel(data,3))return;selectedLevel=3;game.mode='levelintro';hud.hidden=true;
  $('#game-shell').classList.add('is-session');$('#game-bottom').hidden=true;
  modal('<span class="eyebrow">SUPER MIKE-OH — LEVEL 3</span><h2>THE DOG GUARD TERRITORY</h2><p>Prince Xiaboo is close...<br>The Dog Guard protects the only route to the inner castle. Mike must cross their playful patrol grounds and face Captain Barko!</p><p>A = Jump · Hold B = Run · C = Attack<br>Find a flame mystery block to become Fire Mike.<br>Walk softly around sleeping dogs!</p><div class="modal-actions"><button class="primary-button" data-action="territoryGo">GO!</button></div>');
  actions.territoryGo=()=>{clearTimeout(winTimer);if(game.mode==='levelintro')startPlay(false,carry)};
  winTimer=setTimeout(actions.territoryGo,6500);
}
function castleIntro(carry=false){
  if(!canSelectLevel(data,4))return;selectedLevel=4;game.mode='levelintro';hud.hidden=true;
  $('#game-shell').classList.add('is-session');$('#game-bottom').hidden=true;
  modal('<span class="eyebrow">LEVEL 4</span><h2>THE SHADOW CASTLE</h2><p>Mike enters through a hidden passage.<br>The halls are strange. The guards are different.<br>Someone commands both the Cat Kingdom and the Dog Guard.</p><p><strong>Something is wrong inside the castle...</strong><br>Find Prince Xiaboo!</p><p>A = Jump · B = Run · C = Attack<br>Watch the warnings. Explore the library. Follow the gears.</p><div class="modal-actions"><button class="primary-button" data-action="castleGo">GO!</button></div>');
  actions.castleGo=()=>{clearTimeout(winTimer);if(game.mode==='levelintro')startPlay(false,carry)};
  winTimer=setTimeout(actions.castleGo,8000);
}
function togglePause(){if(game.mode==='playing')pause();else if(game.mode==='paused')resume();else if(game.mode==='levelintro')(selectedLevel===4?actions.castleGo:selectedLevel===3?actions.territoryGo:actions.kingdomGo)();else screen.querySelector('.primary-button')?.click()}
function levelInfo(){if(game.mode==='playing'){pause();modal('<span class="eyebrow">LEVEL '+game.levelId+'</span><h2>'+game.main.title+'</h2><p>'+ (game.checkpoint?'Checkpoint activated.':'Follow the coins to the checkpoint.')+'</p><p>A: Jump · Hold B: Run · C: Attack<br>Stand still on a glowing pipe or by the dog-house door to enter.<br>Collect three royal paws in each chapter.</p><button class="primary-button" data-action="resume">Keep adventuring →</button>')}}
function pause(){if(game.mode!=='playing')return;game.mode='paused';clearInput();data.save=game.snapshot();persist();modal(`<span class="eyebrow">TAKE A LITTLE BREATHER</span><h2>Adventure on pause.</h2><p>The cats can wait. Your checkpoint is saved on this device.</p><div class="modal-actions"><button class="primary-button" data-action="resume">Keep adventuring →</button><button class="secondary-button" data-action="checkpoint">Restart checkpoint</button></div><button class="text-button" data-action="settings">Settings</button><button class="text-button" data-action="home">Main menu</button>`)}
function resume(){game.mode='playing';screen.innerHTML='';$('#touch-controls').hidden=false;clearInput();canvas.focus({preventScroll:true})}
function back(){previousPanel==='paused'?pauseFromPanel():showMenu()}
function pauseFromPanel(){game.mode='playing';pause()}
function how(){previousPanel=game.mode==='playing'||game.mode==='paused'?'paused':'menu';if(previousPanel==='paused')game.mode='paused';clearInput();modal(`<span class="eyebrow">A LITTLE FIELD GUIDE</span><h2>You’ve got this, Mike.</h2><div class="controls-list"><div><kbd>← →</kbd> / A D · Move</div><div><kbd>SPACE</kbd> Hold for a high jump</div><div><kbd>SHIFT</kbd> Sprint</div><div><kbd>↓</kbd> / S · Duck / enter pipe</div><div><kbd>F / X</kbd> Attack</div><div><kbd>ENTER / ESC</kbd> Pause</div></div><p>Jump onto cats to bounce away. Armored cats need two stomps, or one Super Mike hit. Follow the coins, look for the glowing M Capsule, and stand still on pipes marked with an arrow. Fire Mike shoots with C. Shield Dogs need a stomp or a hit from behind; attack Captain Barko when he is dizzy. Thunder Mike sends a short electric burst with C and powers optional castle lifts. Strike Lord Whiskeron while his magic rests.</p><p>On mobile, hold ← or → to move. A jumps, hold B to run, and C attacks. All five controls support simultaneous touches. Stand still on a glowing pipe to enter. Approach the dog house from the left and pause at its door. In the castle, attack the sparkling library shelf, then pause at its doorway. START pauses or resumes; SELECT shows level information. Rotate your phone for a wider view. Controller: stick / D-pad to move, A to jump, B to sprint, X to punch, Start to pause. Three royal paw tokens are hidden in the level.</p><div class="modal-actions"><button class="primary-button" data-action="back">Got it. Let’s go →</button><button class="secondary-button" data-action="levels">Level select</button></div>`)}
function settings(){previousPanel=game.mode==='playing'||game.mode==='paused'?'paused':'menu';if(previousPanel==='paused')game.mode='paused';modal(`<span class="eyebrow">MAKE YOURSELF AT HOME</span><h2>Your kind of adventure.</h2><label class="settings-row">Sound effects<input type="checkbox" data-setting="sound" ${data.settings.sound?'checked':''}></label><label class="settings-row">Original adventure music<input type="checkbox" data-setting="music" ${data.settings.music?'checked':''}></label><label class="settings-row">Reduce background motion<input type="checkbox" data-setting="reduced" ${data.settings.reduced?'checked':''}></label><p>Progress and preferences are saved in this browser on this device.</p><div class="modal-actions"><button class="primary-button" data-action="back">All set →</button></div>`)}
function credits(){previousPanel=game.mode==='playing'||game.mode==='paused'?'paused':'menu';if(previousPanel==='paused')game.mode='paused';modal(`<span class="eyebrow">SMALL CAT. BIG KINGDOM. BIGGER HEART.</span><canvas class="story-cat" width="150" height="125"></canvas><h2>For the royal cat<br>worth saving.</h2><p>SUPER MIKE-OH is an original adventure about everyday courage, a surprisingly powerful protein capsule, and one very loved cat.</p><p>Mike and Prince Xiaboo are inspired by your character references. All in-game illustrations, environments, melodies, and sounds were made for this game.</p><p><strong>Chapter one: Green Paw Meadows</strong><br>Green Paw Meadows, The Cat Kingdom, The Dog Guard Territory, and The Shadow Castle. Hidden bonus rooms and a rescue adventure that continues.</p><div class="modal-actions"><button class="primary-button" data-action="back">Back to the adventure →</button><button class="secondary-button" data-action="settings">Settings</button></div>`)}
function levels(){
  previousPanel=game.mode==='paused'?'paused':'menu';if(game.mode==='playing'){pause();previousPanel='paused'}
  const done=completedLevels(data);
  const choices=[[1,'The Beginning','start'],[2,'The Cat Kingdom','kingdom'],[3,'The Dog Guard Territory','territory'],[4,'The Shadow Castle','castle']].map(([id,title,action])=>{
    const unlocked=canSelectLevel(data,id),finished=done.includes(id),status=finished?'Completed':unlocked?'Unlocked':`Locked · Complete Level ${id-1}`;
    return `<button class="level-choice" data-action="${action}" ${unlocked?'':'disabled'}><span><strong>0${id} · ${title}</strong><small>${id===1?'Green Paw Meadows · ':''}${status}</small></span><span aria-hidden="true">${finished?'★':unlocked?'🔓':'🔒'}</span></button>`;
  }).join('');
  modal(`<span class="eyebrow">CHOOSE YOUR ADVENTURE</span><h2>SELECT LEVEL</h2>${choices}<button class="level-choice" disabled><span><strong>05 · Coming Soon</strong><small>🔒 The chase continues...</small></span></button><p>Personal best: <strong>${data.best.toLocaleString()}</strong></p><button class="secondary-button" data-action="back">Back</button>`);
}

function showGameOver(){clearInput();modal(`<span class="eyebrow">EVERY HERO NEEDS ANOTHER TRY</span><h2>Not yet, Mike!</h2><canvas class="story-cat" width="150" height="125"></canvas><p>Prince Xiaboo still needs you.<br>Shake out those legs. There’s more adventure in you.</p><div class="modal-actions"><button class="primary-button" data-action="play">Try again →</button><button class="secondary-button" data-action="home">Main menu</button></div>`)}
function showVictory(){if(game.mode!=='won')return;modal(`<span class="eyebrow">LEVEL 4 COMPLETE!</span><canvas class="story-cat" width="150" height="125"></canvas><h2>The chase continues...</h2><p>Prince Xiaboo was almost rescued...<br>But Lord Whiskeron escaped!</p><p>He commanded the castle and its Cat and Dog guards.<br>Mike will follow him. How far does this mystery reach?</p><p><strong>LEVEL 5 — COMING SOON</strong></p><div class="results"><div><b>${game.coins}</b><small>MIKE COINS</small></div><div><b>${game.paws}/3</b><small>ROYAL PAWS</small></div><div><b>${game.kills}</b><small>GUARDS OUTWITTED</small></div><div><b>${Math.floor(game.elapsed/60)}:${String(Math.floor(game.elapsed%60)).padStart(2,'0')}</b><small>YOUR TIME</small></div><div><b>${game.score.toLocaleString()}</b><small>TOTAL SCORE</small></div><div><b>+${game.bonus}</b><small>FINISH BONUS</small></div></div><div class="modal-actions"><button class="primary-button" data-action="play">One more adventure →</button><button class="secondary-button" data-action="home">Main menu</button></div>`)}
const actions={castle:()=>castleIntro(),territory:()=>territoryIntro(),kingdom:()=>kingdomIntro(),select:levelInfo,togglePause,enter:()=>{if(openingReady)showMenu()},home:()=>{if(openingReady)showMenu()},start:intro,play:()=>startPlay(),continue:()=>startPlay(true),how,credits,settings,levels,back,resume,checkpoint:()=>{game.respawn();resume();toast('A fresh start at your checkpoint.')},fullscreen:()=>fullscreen.toggle()};
document.addEventListener('click',e=>{const a=e.target.closest('[data-action]');if(a){if(!openingReady&&a.dataset.action!=='fullscreen')return;audio.unlock();actions[a.dataset.action]?.()}});
document.addEventListener('change',e=>{if(e.target.dataset.setting){data.settings[e.target.dataset.setting]=e.target.checked;audio.unlock();settingsApply();persist()}});
$('#sound-button').addEventListener('click',()=>{data.settings.sound=!data.settings.sound;audio.unlock();settingsApply();persist();if(audio.enabled)audio.sfx('coin')});
$('#pause-button').addEventListener('click',pause);
const keys={},touchKeys={},keyMap={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'jump',KeyW:'jump',ShiftLeft:'run',ShiftRight:'run',ArrowDown:'down',KeyS:'down',KeyX:'attack',KeyF:'attack'};
let jumpPressed=false,attackPressed=false,touchInput;
function clearInput(){for(const k in keys)delete keys[k];for(const k in touchKeys)delete touchKeys[k];touchInput?.clear();jumpPressed=false;attackPressed=false;previousTouchRun=false;game.player.vx=0}
document.addEventListener('keydown',e=>{
  if(e.code==='Enter'&&!e.repeat&&['playing','paused','levelintro'].includes(game.mode)){e.preventDefault();togglePause();return}
  if(e.code==='Escape'){if(fullscreen.handleEscape()){e.preventDefault();return}if(game.mode==='playing'){e.preventDefault();pause()}else if(game.mode==='paused'){e.preventDefault();resume()}return}
  if(e.code==='Tab'&&screen.querySelector('[role="dialog"]')){const f=[...screen.querySelectorAll('button,input')],i=f.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();f.at(-1)?.focus()}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0]?.focus()}return}
  if(game.mode!=='playing')return;const key=keyMap[e.code];if(!key)return;if(key==='left'||key==='right')touchMovementUsed=false;e.preventDefault();if(!keys[key]&&!e.repeat){if(key==='jump')jumpPressed=true;if(key==='attack')attackPressed=true}keys[key]=true;
});
document.addEventListener('keyup',e=>{const key=keyMap[e.code];if(key){keys[key]=false;if(game.mode==='playing')e.preventDefault()}});
touchInput=bindTouchControls([...document.querySelectorAll('[data-key]')],touchKeys,{
  enabled:()=>game.mode==='playing',unlock:()=>audio.unlock(),
  onPress:key=>{if(key==='left'||key==='right')touchMovementUsed=true;if(key==='jump')jumpPressed=true;if(key==='attack')attackPressed=true;if(['jump','run','attack'].includes(key))haptic()},
});
function haptic(){try{navigator.vibrate?.(12)}catch{}}
for(const element of [canvas,$('#touch-controls')]){element.addEventListener('contextmenu',e=>e.preventDefault());element.addEventListener('dragstart',e=>e.preventDefault())}
$('#touch-controls').addEventListener('click',e=>{if(e.target.closest('[data-action="togglePause"]'))haptic()});
const orientationReset=()=>{clearInput();if(game.mode==='playing')pause();renderer.resize()};
window.addEventListener('orientationchange',orientationReset);
window.screen?.orientation?.addEventListener('change',orientationReset);
window.addEventListener('blur',()=>{clearInput();if(game.mode==='playing')pause()});
document.addEventListener('visibilitychange',()=>{clearInput();if(document.hidden&&game.mode==='playing')pause()});
window.addEventListener('pagehide',()=>{if(['playing','paused'].includes(game.mode)){data.save=game.snapshot();persist()}});
function gamepad(){const pad=navigator.getGamepads?.()?.find(p=>p?.connected);if(!pad){gamepadPrevious={};return {}}const b=i=>pad.buttons[i]?.pressed;const state={left:pad.axes[0]<-.25||b(14),right:pad.axes[0]>.25||b(15),down:pad.axes[1]>.5||b(13),jump:b(0),run:b(1)||b(5),attack:b(2),pause:b(9)};if(state.jump&&!gamepadPrevious.jump)jumpPressed=true;if(state.attack&&!gamepadPrevious.attack)attackPressed=true;if(state.pause&&!gamepadPrevious.pause){if(game.mode==='playing')pause();else if(game.mode==='paused')resume()}gamepadPrevious=state;return state}
const fullscreen=createFullscreenController({shell:$('#game-shell'),notice:$('#rotate-notice'),button:$('#session-fullscreen'),onNotice:toast,onChange:()=>{clearInput();if(game.mode==='playing')pause();renderer.resize();game.viewWidth=renderer.w}});
new ResizeObserver(()=>{renderer.resize();game.viewWidth=renderer.w}).observe(canvas);
renderer.resize();game.viewWidth=renderer.w;
let last=performance.now();
function frame(now){const dt=Math.min((now-last)/1000,.035);last=now;const pad=gamepad();const input={};for(const key of ['left','right','jump','down','run','attack'])input[key]=keys[key]||touchKeys[key]||pad[key];input.touchMovement=touchMovementUsed&&!keys.left&&!keys.right&&!pad.left&&!pad.right;input.touchRunReleased=previousTouchRun&&!touchKeys.run&&!keys.run&&!pad.run;previousTouchRun=!!touchKeys.run;input.jumpPressed=jumpPressed;input.attackPressed=attackPressed;game.step(dt,input);jumpPressed=false;attackPressed=false;renderer.render(game);audio.step(dt,game.level.cave,game.mode==='playing'&&!game.scene,game.main.music);if(game.mode==='playing'&&game.elapsed-lastAutoSave>12){lastAutoSave=game.elapsed;data.save=game.snapshot();persist()}requestAnimationFrame(frame)}
game.mode='loading';$('#game-shell').classList.add('is-opening');$('#game-bottom').hidden=true;
screen.innerHTML=openingMarkup();requestAnimationFrame(frame);
const failures=await initializeOpening([
  {name:'characters',message:'Mike is ready for adventure.',run:()=>loadCharacters()},
  {name:'opening-art',message:'The royal company has arrived.',run:()=>loadOpeningArt()},
  {name:'title-font',message:'Putting the finishing touches on the kingdom.',run:()=>document.fonts.load?.('24px "Super Mario 256"')||document.fonts.ready},
],(percent,message)=>{
  $('#loading-fill').style.width=`${percent}%`;$('#loading-percent').textContent=`${percent}%`;
  $('#opening-progress').setAttribute('aria-valuenow',String(percent));$('#loading-message').textContent=message;
});
openingReady=true;$('#loading-message').textContent=failures.length?'Ready to play. Some artwork could not load; refresh to retry.':'READY, MIKE-OH!';
$('#opening-enter').disabled=false;$('#opening-enter').textContent='ENTER THE KINGDOM';
$('#opening-enter').focus({preventScroll:true});
