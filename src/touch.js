// Track each finger separately so pointer cancellation never leaves movement held.
export function bindTouchControls(buttons,state,{enabled=()=>true,onPress=()=>{},unlock=()=>{}}={}){
  const fingers=new Map();let sprint=false;
  function sync(){
    for(const key of ['left','right','down','jump','attack','run'])state[key]=key==='run'?sprint:[...fingers.values()].includes(key);
    for(const button of buttons){const active=!!state[button.dataset.key];button.classList.toggle('is-held',active);if(button.dataset.key==='run')button.setAttribute('aria-pressed',String(active))}
  }
  for(const button of buttons){
    button.addEventListener('pointerdown',event=>{
      if(!enabled()||(event.pointerType==='mouse'&&event.button!==0))return;
      event.preventDefault();unlock();const key=button.dataset.key;
      if(key==='run')sprint=!sprint;
      else{const wasHeld=!!state[key];fingers.set(event.pointerId,key);if(!wasHeld)onPress(key)}
      button.setPointerCapture(event.pointerId);sync();
    });
    const release=event=>{fingers.delete(event.pointerId);sync()};
    for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,release);
    button.addEventListener('contextmenu',event=>event.preventDefault());
  }
  return {clear(){fingers.clear();sprint=false;sync()}};
}
