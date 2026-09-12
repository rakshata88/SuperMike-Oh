import {drawRunningLegs,drawRunningArm} from './gait.js';
// Pixel rectangles are deliberately authored for the inspected, transparent atlas.
// The sheet has uneven rows; slicing it as an equal grid would clip hair and crowns.
export const ATLAS_URL = new URL('../assets/characters/mike-xiaboo-atlas.png', import.meta.url).href;
export const FRAMES = {
  normal: [
    [88, 3, 157, 306, 78], [328, 8, 230, 302, 116],
    [626, 9, 221, 301, 110], [914, 3, 248, 283, 124],
    [1217, 75, 225, 236, 113], [1500, 3, 224, 308, 112],
  ],
  super: [
    [53, 309, 209, 350, 108], [306, 321, 266, 335, 140],
    [607, 321, 269, 337, 145], [899, 309, 247, 339, 123],
    [1168, 325, 337, 336, 157], [1500, 318, 261, 343, 134],
  ],
  prince: [
    [27, 660, 235, 223, 126], [268, 672, 314, 192, 172],
    [602, 672, 277, 201, 150], [882, 654, 282, 191, 155],
    [1176, 715, 297, 156, 149], [1481, 653, 255, 228, 136],
  ],
};

let atlas;
export async function loadCharacters(){
  if(atlas)return;
  const image=new Image();image.decoding='async';
  await new Promise((resolve,reject)=>{
    image.onload=resolve;image.onerror=()=>reject(new Error('Character artwork could not load.'));
    image.src=ATLAS_URL;
  });
  if(image.decode)await image.decode();
  if(image.naturalWidth!==1774||image.naturalHeight!==887)throw new Error('Unexpected character atlas dimensions.');
  atlas=image;
}

export function drawCharacter(c,kind,x,y,scale,pose='idle',time=0,face=1,gait=null){
  if(!atlas)return false;
  let frame=0;
  if(pose==='run')frame=1+Math.floor(gait&&kind!=='prince'?gait.phase*2:time*10)%2;
  else if(['jump','fall','hurt','dead'].includes(pose))frame=3;
  else if(pose==='win')frame=5;
  else if(pose==='attack'||pose==='duck'||pose==='sleep')frame=4;
  const articulated=['walk','run'].includes(pose)&&kind!=='prince'&&gait;
  if(articulated)frame=0;
  const [sx,sy,sw,sh,pivot]=FRAMES[kind][frame];
  const unit=kind==='prince'?70/223:kind==='super'?116/353:100/306;
  const bob=articulated?0:pose==='run'?-Math.abs(Math.sin(time*10*Math.PI))*1.7:pose==='idle'?Math.sin(time*2)*.7:0;
  c.save();c.translate(x,y+bob*scale);c.scale(scale*face,scale);
  c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  if(pose==='duck'&&kind==='super')c.scale(1,.72);
  if(pose==='land')c.scale(1,1-.045*Math.max(0,1-(gait?.stateTime||0)/.07));
  if(pose==='fall')c.rotate?.(-.06);
  if(pose==='hurt'||pose==='dead')c.rotate?.(-.16);
  if(articulated){
    const intensity=gait.blend??1,stride=gait.stride??1;
    drawRunningLegs(c,atlas,kind,gait.phase,stride);
    // Keep the original face and clothing; draw connected arms behind/in front
    // of a masked torso so the atlas's stationary hands never flicker through.
    const torsoHeight=kind==='super'?207:208,bounce=Math.cos(gait.phase*Math.PI*4)*(.6+intensity);
    c.save();c.translate(0,bounce);c.rotate((pose==='run'?.075:.025)*intensity);
    drawRunningArm(c,atlas,kind,gait.phase+.5,intensity,true);
    c.save();
    c.beginPath();const torsoPoint=(u,v)=>[(u-pivot)*unit,(v-sh)*unit];
    const outline=kind==='super'?[[0,0],[sw,0],[sw,106],[145,106],[158,207],[55,207],[64,110],[0,110]]:[[0,0],[sw,0],[sw,127],[116,127],[119,208],[39,208],[29,141],[0,127]];
    outline.forEach(([u,v],i)=>i?c.lineTo(...torsoPoint(u,v)):c.moveTo(...torsoPoint(u,v)));c.closePath();c.clip();
    c.drawImage(atlas,sx,sy,sw,torsoHeight,-pivot*unit,-sh*unit,sw*unit,torsoHeight*unit);c.restore();
    drawRunningArm(c,atlas,kind,gait.phase,intensity);c.restore();
  }else c.drawImage(atlas,sx,sy,sw,sh,-pivot*unit,-sh*unit,sw*unit,sh*unit);
  c.restore();return true;
}
