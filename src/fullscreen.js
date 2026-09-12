// Browser fullscreen and orientation are separate permissions. Retain a viewport
// fallback and a rotate prompt when either API is unavailable on a phone.
export function createFullscreenController({shell,notice,button,doc=globalThis.document,win=globalThis.window,onChange=()=>{},onNotice=()=>{},isTouch=()=>globalThis.matchMedia('(any-pointer: coarse)').matches}){
  let active=false,busy=false,locked=false,native=false;
  const orientation=()=>win.screen?.orientation;
  const nativeElement=()=>doc.fullscreenElement||doc.webkitFullscreenElement;
  const portrait=()=>orientation()?.type?orientation().type.startsWith('portrait'):win.innerHeight>win.innerWidth;
  function update(){
    shell.classList.toggle('is-fullscreen',active);
    if(notice)notice.hidden=!(active&&isTouch()&&portrait());
    if(button){button.textContent=active?'✕':'⛶';button.setAttribute('aria-label',active?'Exit fullscreen':'Fullscreen landscape');button.setAttribute('aria-pressed',String(active))}
    onChange();
  }
  function unlock(){if(locked){try{orientation()?.unlock?.()}catch{}locked=false}}
  async function exit(){
    unlock();
    try{if(nativeElement()===shell){const leave=doc.exitFullscreen||doc.webkitExitFullscreen;await leave?.call(doc)}}catch{onNotice('Use your browser’s fullscreen exit control.');return}
    active=false;native=false;update();
  }
  async function toggle(){
    if(busy)return;busy=true;
    try{
      if(active||nativeElement()===shell){await exit();return}
      const request=shell.requestFullscreen||shell.webkitRequestFullscreen;
      if(request){try{await request.call(shell,{navigationUI:'hide'});native=nativeElement()===shell}catch{native=false}}
      active=true;update();
      if(isTouch()){
        try{if(!orientation()?.lock)throw Error('Orientation lock unavailable');await orientation().lock('landscape');locked=true}
        catch{if(portrait())onNotice('Turn your phone sideways for landscape play.')}
        update();
      }
    }finally{busy=false}
  }
  const changed=()=>{if(native&&!nativeElement()){active=false;native=false;unlock();update()}};
  doc.addEventListener('fullscreenchange',changed);doc.addEventListener('webkitfullscreenchange',changed);
  return {toggle,exit,refresh:update,handleEscape(){if(active&&!native){void exit();return true}return false},get active(){return active}};
}
