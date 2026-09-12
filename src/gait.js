// One stance travels exactly half a cycle's distance: planted feet stay on the ground.
export const gaitDimensions={normal:{stride:52,hip:33,thigh:22,shin:21,scale:.59},super:{stride:70,hip:46,thigh:30,shin:29,scale:.69}};
export function advanceGait(phase,distance,superMode,strideScale=1){const d=gaitDimensions[superMode?'super':'normal'];return (phase+Math.abs(distance)/(2*d.stride*d.scale*strideScale))%1}
export function runningLeg(phase,kind='normal',strideScale=1){
  const d=gaitDimensions[kind],q=((phase%1)+1)%1,swing=q>=.5,t=swing?(q-.5)*2:q*2;
  const stride=d.stride*strideScale;
  const foot={x:swing?-stride/2+stride*(t*t*(3-2*t)):stride/2-stride*t,y:swing?-Math.sin(t*Math.PI)*(kind==='super'?23:18)*strideScale:0};
  const hip={x:0,y:-d.hip+Math.cos(q*Math.PI*4)*1.4},dx=foot.x-hip.x,dy=foot.y-hip.y;
  const length=Math.max(.001,Math.min(Math.hypot(dx,dy),d.thigh+d.shin-.001));
  const along=(d.thigh*d.thigh-d.shin*d.shin+length*length)/(2*length),bend=Math.sqrt(Math.max(0,d.thigh*d.thigh-along*along));
  const knee={x:hip.x+dx/length*along+dy/length*bend,y:hip.y+dy/length*along-dx/length*bend};
  return {hip,knee,foot,planted:!swing};
}
const textures={
  normal:{thigh:[156,214,36,42],shin:[178,250,28,36],shoe:[178,282,61,26],widths:[12,10,19,8]},
  super:{thigh:[109,500,45,66],shin:[85,567,42,64],shoe:[191,635,59,20],widths:[17,14,22,9]},
};
function limb(c,atlas,source,a,b,width){
  c.save();c.translate(a.x,a.y);c.rotate(Math.atan2(b.y-a.y,b.x-a.x)-Math.PI/2);
  const length=Math.hypot(b.x-a.x,b.y-a.y);
  c.beginPath();c.roundRect(-width/2,-width*.25,width,length+width*.5,width*.45);c.fillStyle='#30343c';c.fill();c.clip();
  c.drawImage(atlas,...source,-width/2,-width*.25,width,length+width*.5);c.restore();
}
export function drawRunningLegs(c,atlas,kind,phase,strideScale=1){
  const tex=textures[kind];
  for(const offset of [.5,0]){
    const leg=runningLeg(phase+offset,kind,strideScale);c.save();if(offset)c.globalAlpha*=.82;
    limb(c,atlas,tex.thigh,leg.hip,leg.knee,tex.widths[0]);limb(c,atlas,tex.shin,leg.knee,leg.foot,tex.widths[1]);
    c.drawImage(atlas,...tex.shoe,leg.foot.x-tex.widths[2]*.4,leg.foot.y-tex.widths[3],tex.widths[2],tex.widths[3]);c.restore();
  }
}

export function runningArm(phase,kind='normal',intensity=1,far=false){
  const big=kind==='super',upper=big?22:16,fore=big?21:15;
  // The same-side arm opposes its leg. Elbow bend stays bounded throughout.
  const swing=-Math.cos(phase*2*Math.PI)*(.28+.5*intensity);
  const shoulder={x:far?10:-12,y:big?-75:-55};
  const elbow={x:shoulder.x+Math.sin(swing)*upper,y:shoulder.y+Math.cos(swing)*upper};
  const bend=.8+.3*intensity;
  const hand={x:elbow.x+Math.sin(swing+bend)*fore,y:elbow.y+Math.cos(swing+bend)*fore};
  return {shoulder,elbow,hand,upper,fore};
}
export function drawRunningArm(c,atlas,kind,phase,intensity,far=false){
  const arm=runningArm(phase,kind,intensity,far),big=kind==='super';
  c.save();if(far)c.globalAlpha*=.82;
  limb(c,atlas,big?[78,434,37,49]:[106,153,29,42],arm.shoulder,arm.elbow,big?15:9);
  limb(c,atlas,big?[67,477,34,47]:[99,184,27,34],arm.elbow,arm.hand,big?12:8);
  const size=big?15:11;
  c.beginPath();c.roundRect(arm.hand.x-size/2,arm.hand.y-size/2,size,size,size*.3);c.clip();
  c.drawImage(atlas,...(big?[64,515,43,37]:[96,211,36,31]),arm.hand.x-size/2,arm.hand.y-size/2,size,size);
  c.restore();
}
