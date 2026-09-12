// One coalesced layout pass for rotation, browser toolbars and fullscreen.
export function createViewportController({shell,canvas,notice,renderer,game,onRotate=()=>{},win=window,doc=document,isTouch=()=>matchMedia('(any-pointer: coarse)').matches}){
  let pending=false,lastPortrait,blocked=false;
  function handleViewportResize(){
    pending=false;
    const vv=win.visualViewport;
    const width=vv?.width||win.innerWidth||canvas.clientWidth;
    const height=vv?.height||win.innerHeight||canvas.clientHeight;
    const portrait=height>width,touch=isTouch();
    shell.style.setProperty('--game-vw',`${width}px`);shell.style.setProperty('--game-vh',`${height}px`);
    shell.style.setProperty('--game-vx',`${vv?.offsetLeft||0}px`);shell.style.setProperty('--game-vy',`${vv?.offsetTop||0}px`);
    shell.classList.toggle('is-mobile-view',touch);shell.classList.toggle('is-portrait-view',portrait);
    if(lastPortrait!==undefined&&portrait!==lastPortrait)onRotate();lastPortrait=portrait;
    blocked=touch&&portrait;notice.hidden=!blocked;
    renderer.resize();game.viewWidth=renderer.w;
    game.camera=Math.max(0,Math.min(game.camera,Math.max(0,game.level.width-game.viewWidth)));
  }
  function schedule(){if(!pending){pending=true;win.requestAnimationFrame(handleViewportResize)}}
  for(const name of ['resize','orientationchange','pageshow','focus'])win.addEventListener(name,schedule);
  win.screen?.orientation?.addEventListener?.('change',schedule);
  for(const name of ['resize','scroll'])win.visualViewport?.addEventListener(name,schedule);
  doc.addEventListener('visibilitychange',schedule);
  const observer=new ResizeObserver(schedule);observer.observe(canvas);
  handleViewportResize();
  return {schedule,handleViewportResize,get blocked(){return blocked}};
}
