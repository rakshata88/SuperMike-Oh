// Animation observes physics; it never starts jumps or changes collision state.
export function updatePlayerAnimation(p,dt,{dead=false}={}){
  const speed=Math.abs(p.vx);
  const state=dead?'dead':p.hurtTime>0?'hurt':p.attack>0?'attack':!p.grounded?(p.vy<0?'jump':'fall'):p.landTime>0?'land':p.duck?'duck':speed>15?(p.running?'run':'walk'):'idle';
  if(p.animation!==state){p.animation=state;p.animationTime=0}else p.animationTime=(p.animationTime||0)+dt;
  const target=p.grounded&&speed>15?Math.min(1,speed/285):0;
  p.gaitBlend=(p.gaitBlend||0)+(target-(p.gaitBlend||0))*Math.min(1,dt*18);
}
