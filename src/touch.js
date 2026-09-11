// Track each finger separately so pointer cancellation never leaves movement held.
export function bindTouchControls(buttons,state,{enabled=()=>true,onPress=()=>{},unlock=()=>{}}={}){
  const fingers=new Map();
  function sync(){
    for(const key of ['left','right','down','jump','attack','run'])state[key]=[...fingers.values()].includes(key);
    for(const button of buttons){const active=!!state[button.dataset.key];button.classList.toggle('is-held',active);button.setAttribute('aria-pressed',String(active))}
  }
  for(const button of buttons){
    button.addEventListener('pointerdown',event=>{
      if(!enabled()||(event.pointerType==='mouse'&&event.button!==0))return;
      event.preventDefault();unlock();const key=button.dataset.key;
      if(fingers.has(event.pointerId))return;
      const wasHeld=!!state[key];fingers.set(event.pointerId,key);if(!wasHeld)onPress(key);
      try{button.setPointerCapture(event.pointerId)}catch{}sync();
    });
    const release=event=>{fingers.delete(event.pointerId);sync();try{if(button.hasPointerCapture?.(event.pointerId))button.releasePointerCapture(event.pointerId)}catch{}};
    for(const event of ['pointerup','pointercancel','pointerleave','lostpointercapture'])button.addEventListener(event,release);
    button.addEventListener('pointermove',event=>{if(!fingers.has(event.pointerId))return;const r=button.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)release(event)});
    globalThis.window?.addEventListener('pointerup',release);
    globalThis.window?.addEventListener('pointercancel',release);
    button.addEventListener('contextmenu',event=>event.preventDefault());
  }
  sync();return {clear(){fingers.clear();sync()}};
}
