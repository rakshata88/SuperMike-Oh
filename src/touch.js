// Track each finger separately so pointer cancellation never leaves movement held.
export function bindTouchControls(buttons,state,{enabled=()=>true,onPress=()=>{},onRelease=()=>{},unlock=()=>{}}={}){
  const fingers=new Map(),retired=new Set();
  function sync(){
    for(const key of ['left','right','down','jump','attack','run']){const previous=state[key];state[key]=[...fingers.values()].includes(key);if(previous&&!state[key])onRelease(key)}
    for(const button of buttons){const active=!!state[button.dataset.key];button.classList.toggle('is-held',active);button.setAttribute('aria-pressed',String(active))}
  }
  for(const button of buttons){
    button.addEventListener('pointerdown',event=>{
      if(!enabled()||(event.pointerType==='mouse'&&event.button!==0))return;
      event.preventDefault();unlock();const key=button.dataset.key;
      if(fingers.has(event.pointerId)||retired.has(event.pointerId))return;
      const wasHeld=!!state[key];fingers.set(event.pointerId,key);if(!wasHeld)onPress(key);
      try{button.setPointerCapture(event.pointerId)}catch{}sync();
    });
    const release=event=>{if(fingers.delete(event.pointerId))retired.add(event.pointerId);sync();if(event.type==='pointerup'||event.type==='pointercancel')retired.delete(event.pointerId);try{if(button.hasPointerCapture?.(event.pointerId))button.releasePointerCapture(event.pointerId)}catch{}};
    for(const event of ['pointerup','pointercancel','pointerleave','lostpointercapture'])button.addEventListener(event,release);
    button.addEventListener('pointermove',event=>{if(!fingers.has(event.pointerId))return;const r=button.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)release(event)});
    button.addEventListener('contextmenu',event=>event.preventDefault());
  }
  const end=event=>{fingers.delete(event.pointerId);retired.delete(event.pointerId);sync()};
  globalThis.window?.addEventListener('pointerup',end);
  globalThis.window?.addEventListener('pointercancel',end);
  sync();return {clear(){fingers.clear();retired.clear();sync()}};
}

// CSS handles modern browsers. These scoped, non-passive fallbacks also cover
// Safari gesture events without preventing menu buttons from producing clicks.
export function bindGameplayGestures(shell,enabled){
  const prevent=event=>{if(enabled()&&!event.target.closest?.('.modal,.rotate-notice')&&event.cancelable)event.preventDefault()};
  for(const name of ['touchmove','gesturestart','gesturechange','dblclick','contextmenu','dragstart'])shell.addEventListener(name,prevent,{passive:false});
  shell.addEventListener('touchend',event=>{if(event.target.closest?.('#game,[data-key]'))prevent(event)},{passive:false});
}
