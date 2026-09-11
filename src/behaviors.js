// Small shared components for chase enemies and future chapters.
export const intersects=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export const setState=(e,state,time)=>{e.state=state;e.stateTime=time};
export function tickState(e,dt){e.stateTime-=dt;e.invuln=Math.max(0,(e.invuln||0)-dt)}
export function groundMotion(e,dt,platforms,speed,{hop=false}={}){
  if(e.support&&e.grounded){e.x+=e.support.dx||0;e.y+=e.support.dy||0}
  const oldX=e.x,foot=e.y+e.h;e.vx=e.face*speed;e.x+=e.vx*dt;
  let blocked=e.x<e.min||e.x>e.max;
  for(const s of platforms)if(intersects(e,s)){e.x=e.face>0?s.x-e.w:s.x+s.w;blocked=true}
  const ahead=e.face>0?e.x+e.w+4:e.x-4;
  if(e.grounded&&speed&&!platforms.some(s=>ahead>=s.x&&ahead<=s.x+s.w&&Math.abs(s.y-foot)<14)){
    const landing=hop&&platforms.find(s=>e.face>0?s.x>ahead&&s.x-ahead<140&&s.y>=foot-70&&s.y<=foot+90:s.x+s.w<ahead&&ahead-s.x-s.w<140&&s.y>=foot-70&&s.y<=foot+90);
    if(landing){e.vy=-470;e.grounded=false}else blocked=true;
  }
  if(blocked){e.x=oldX;e.face*=-1;e.vx=0}
  e.vy+=1350*dt;e.y+=e.vy*dt;e.grounded=false;e.support=null;
  for(const s of platforms)if(intersects(e,s)&&e.vy>=0&&foot<=s.y+Math.max(9,Math.abs(s.dy||0)+4)){e.y=s.y-e.h;e.vy=0;e.grounded=true;e.support=s}
  if(e.y>800)e.alive=false;
  return blocked;
}
export function chargeCycle(e,p,{radius=300,warning=.85,duration=.75,rest=1.6}={}){
  if(e.state==='patrol'&&e.stateTime<=0&&Math.abs(p.x-e.x)<radius&&Math.abs(p.y-e.y)<130){e.face=Math.sign(p.x-e.x)||-1;setState(e,'chargeWarning',warning)}
  else if(e.state==='chargeWarning'&&e.stateTime<=0)setState(e,'charge',duration);
  else if(e.state==='charge'&&e.stateTime<=0)setState(e,'rest',rest);
  else if(e.state==='rest'&&e.stateTime<=0)setState(e,'patrol',1.1);
}
export function projectile(g,e,type,{speed=180,vy=0,gravity=0,bounce=false,life=4,x=e.x+e.w/2,y=e.y+e.h/2,w=22,h=22,...extra}={}){
  const p={x,y,w,h,vx:(e.face||1)*speed,vy,gravity,bounce,life,type,distance:0,...extra};g.projectiles.push(p);return p;
}
export function nextBossPhase(e,phases,warning=1.05){e.pattern=(e.pattern+1)%phases.length;setState(e,phases[e.pattern],warning)}
