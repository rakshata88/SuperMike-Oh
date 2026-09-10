import {drawCharacter} from './characters.js';
const ink='#283c35';
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()}
function path(c,points,fill,stroke=null,width=2){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}}
function rect(c,x,y,w,h,color,r=0){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()}
function line(c,points,color,width=3){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke()}
export function drawMike(c,x,y,scale=1,superMode=false,pose='idle',t=0,face=1){
  if(drawCharacter(c,superMode?'super':'normal',x,y,scale,pose,t,face))return;
  c.save();c.translate(x,y);c.scale(scale*face,scale);c.lineJoin='round';
  const run=pose==='run',jump=pose==='jump',win=pose==='win',duck=pose==='duck';
  const stride=run?Math.sin(t*15)*10:0;const bob=run?Math.abs(Math.sin(t*15))*2:Math.sin(t*2)*1.1;
  c.translate(0,bob);if(duck)c.scale(1,.72);
  const wide=superMode?1.24:1;c.save();c.scale(wide,superMode?1.14:1);
  ellipse(c,0,3,20,5,'#193c3226');
  // Dark trousers and light-soled athletic shoes.
  line(c,[[-8,-25],[-10-stride*.5,-14],[-10-stride,-3]],ink,14);line(c,[[-8,-25],[-10-stride*.5,-14],[-10-stride,-3]],'#39404c',10);
  line(c,[[8,-25],[9+stride*.5,-13+(jump?-6:0)],[11+stride,-3+(jump?-5:0)]],ink,14);line(c,[[8,-25],[9+stride*.5,-13+(jump?-6:0)],[11+stride,-3+(jump?-5:0)]],'#303743',10);
  rect(c,-18-stride,-7,20,10,ink,4);rect(c,4+stride,-7+(jump?-5:0),21,10,ink,4);rect(c,-18-stride,0,20,3,'#e6e4d7',1);rect(c,4+stride,0+(jump?-5:0),21,3,'#e6e4d7',1);
  line(c,[[-13-stride,-4],[-7-stride,-4]],'#a6b0ac',1.5);line(c,[[9+stride,-4+(jump?-5:0)],[15+stride,-4+(jump?-5:0)]],'#a6b0ac',1.5);
  const arm=superMode?10:7;
  const leftHand=win?[-28,-68]:jump?[-27,-51]:[-24+stride*.7,-27];
  const rightHand=pose==='attack'?[45,-43]:win?[28,-70]:jump?[25,-72]:[24-stride*.7,-29];
  line(c,[[-14,-48],[-24,-40],leftHand],ink,arm+4);line(c,[[-14,-48],[-24,-40],leftHand],'#d99865',arm);
  line(c,[[14,-48],[25,-40],rightHand],ink,arm+4);line(c,[[14,-48],[25,-40],rightHand],'#efb27e',arm);
  path(c,[[-15,-52],[15,-52],[18,-26],[-17,-26]],'#22282e',ink,2.4);path(c,[[-9,-45],[9,-42],[14,-28],[-13,-28]],'#2e333b');
  if(!superMode){path(c,[[-16,-53],[-24,-43],[-14,-37],[-8,-49]],'#252b32',ink,1.5);path(c,[[15,-52],[23,-44],[15,-38],[9,-49]],'#252b32',ink,1.5)}
  else {line(c,[[-6,-47],[1,-43],[7,-47]],'#4a4a4b',1);line(c,[[-10,-33],[10,-33]],'#171f26',2)}
  rect(c,-7,-62,15,14,'#d49365',4);
  // Same face, hair, moustache, and skin palette in both forms.
  ellipse(c,0,-72,20,22,ink);ellipse(c,0,-71,18,20,'#efb581');ellipse(c,-17,-70,4,6,'#e3a371');ellipse(c,18,-70,4,6,'#e3a371');
  path(c,[[-19,-77],[-20,-88],[-15,-94],[-18,-96],[-6,-96],[-4,-102],[3,-97],[12,-99],[11,-95],[21,-89],[18,-78],[10,-87],[4,-83],[-1,-87],[-8,-81],[-13,-83],[-15,-75]],'#22282c',ink,1.5);
  path(c,[[-14,-90],[-3,-96],[9,-94],[0,-90],[13,-91],[16,-87],[7,-88],[-3,-85]],'#3d4145');
  line(c,[[-11,-76],[-5,-77]],'#34322d',2.8);line(c,[[5,-77],[12,-76]],'#34322d',2.8);
  if(win){line(c,[[-11,-70],[-8,-73],[-4,-70]],ink,1.8);line(c,[[5,-70],[8,-73],[12,-70]],ink,1.8)}else{ellipse(c,-8,-71,3.5,4,'#fff7e9');ellipse(c,9,-71,3.5,4,'#fff7e9');ellipse(c,-7,-70,1.8,3,'#352e2c');ellipse(c,10,-70,1.8,3,'#352e2c')}
  line(c,[[1,-69],[3,-65],[0,-64]],'#c78c5b',1.3);
  path(c,[[-6,-60],[-2,-62],[1,-61],[4,-62],[8,-60],[3,-59],[-1,-60]],'#574032');
  line(c,[[-4,-57],[2,-56],[7,-58]],'#9a5641',1.4);line(c,[[-4,-52],[1,-51],[5,-53]],'#8c6549',1);
  if(win){ellipse(c,1,-57,5,3,'#663c31');line(c,[[-2,-58],[4,-58]],'#fff6de',1.5)}
  c.restore();c.restore();
}
export function drawCat(c,x,y,scale=1,type='prince',t=0,happy=false,pose='idle',face=1){
  if(type==='prince'&&drawCharacter(c,'prince',x,y,scale,happy?'win':pose,t,face))return;
  c.save();c.translate(x,y);c.scale(scale,scale);const prince=type==='prince',armor=type==='armor',chonky=type==='chonky';const fur=prince?'#fff2d6':type==='jump'?'#afb9b3':type==='fast'?'#c79575':'#e8b27a';
  if(chonky)c.scale(1.25,1.1);
  ellipse(c,0,2,25,5,'#18392b24');
  line(c,[[16,-8],[29,-14],[32+Math.sin(t*3)*3,-28],[26,-32]],'#654b36',8);line(c,[[16,-8],[29,-14],[32+Math.sin(t*3)*3,-28],[26,-32]],fur,5);
  if(prince)path(c,[[-13,-29],[-25,1],[23,1],[13,-29]],'#b9564b','#6e473c',2);
  ellipse(c,0,-12,19,17,'#6e5941');ellipse(c,0,-13,17,16,fur);
  path(c,[[-20,-30],[-22,-53],[-6,-42],[8,-42],[21,-52],[22,-29]],fur,'#715a40',2);
  path(c,[[-18,-34],[-19,-47],[-10,-40]],'#e6b3a2');path(c,[[13,-40],[19,-47],[19,-34]],'#e6b3a2');
  ellipse(c,0,-30,23,19,'#725d43');ellipse(c,0,-31,21,18,fur);ellipse(c,-10,-27,10,9,'#fff7e2');ellipse(c,10,-27,10,9,'#fff7e2');
  if(happy||type==='sleepy'){line(c,[[-13,-32],[-10,-35],[-6,-32]],ink,1.8);line(c,[[6,-32],[10,-35],[13,-32]],ink,1.8)}else{ellipse(c,-10,-33,4,5,'#564d42');ellipse(c,10,-33,4,5,prince?'#829ea4':'#564d42');ellipse(c,-10,-33,2,4,'#29312d');ellipse(c,10,-33,2,4,'#29312d');ellipse(c,-11,-35,1,1,'#fff');ellipse(c,9,-35,1,1,'#fff')}
  path(c,[[-3,-27],[3,-27],[0,-24]],'#be8a7c');line(c,[[-5,-23],[-2,-22],[0,-24],[2,-22],[5,-23]],'#866554',1);
  line(c,[[-14,-25],[-28,-28]],'#baa78a',1);line(c,[[-14,-22],[-28,-22]],'#baa78a',1);line(c,[[14,-25],[28,-28]],'#baa78a',1);line(c,[[14,-22],[28,-22]],'#baa78a',1);
  ellipse(c,-10,-1,9,5,fur);ellipse(c,10,-1,9,5,fur);
  if(prince){line(c,[[-14,-15],[0,-12],[14,-15]],'#a23e3e',5);ellipse(c,0,-12,4,5,'#ecc361');path(c,[[-12,-48],[-16,-64],[-6,-58],[0,-69],[7,-58],[16,-64],[12,-48]],'#f1c662','#816436',2);rect(c,-12,-51,24,5,'#e1a749',1);ellipse(c,0,-56,2.5,3.5,'#b75449')}
  if(armor){path(c,[[-23,-35],[-19,-47],[0,-54],[20,-46],[23,-35]],'#9aaea8','#465d57',2);line(c,[[-13,-42],[13,-42]],'#dce9db',2);path(c,[[0,-52],[-3,-64],[10,-58],[13,-50]],'#ba6651');rect(c,-17,-19,34,12,'#7e9690',4)}
  if(!prince&&!armor){rect(c,-15,-16,30,5,'#738257',2);ellipse(c,0,-13,3,3,'#ebd381')}
  c.restore();
}
export function drawItem(c,it,t){
  const {x,y,type}=it;const yy=y+Math.sin(t*3+x)*4;c.save();c.translate(x+14,yy+16);
  if(type==='coin'){const s=.72+Math.abs(Math.sin(t*2+x))*.28;c.scale(s,1);ellipse(c,0,0,12,15,'#ba8b39');ellipse(c,0,-1,10,13,'#f4ca63');ellipse(c,-1,-2,7,10,'#ffe398');c.fillStyle='#b98631';c.font='900 13px Outfit,sans-serif';c.textAlign='center';c.fillText('M',0,4)}
  else if(type==='power'){const g=c.createRadialGradient(0,0,5,0,0,42);g.addColorStop(0,'#fff3a980');g.addColorStop(1,'#fff3a900');ellipse(c,0,0,42,42,g);rect(c,-13,-17,26,35,'#8b6536',8);rect(c,-10,-15,20,31,'#f7d379',6);rect(c,-8,-9,16,21,'#fff2c2',4);rect(c,-8,-22,16,7,'#a97e48',2);c.fillStyle='#bf7249';c.font='900 18px Outfit,sans-serif';c.textAlign='center';c.fillText('M',0,8)}
  else if(type==='paw'){ellipse(c,0,0,20,20,'#e5d3fb55');ellipse(c,0,5,9,8,'#b29bd5');for(const [a,b] of [[-11,-3],[-5,-10],[5,-10],[11,-3]])ellipse(c,a,b,4,5,'#c5b0e7')}
  else {ellipse(c,0,0,17,17,type==='life'?'#f5c0ae':'#d9ecc3');c.font='800 20px sans-serif';c.textAlign='center';c.fillStyle=type==='life'?'#b76759':'#618b58';c.fillText(({life:'♥',speed:'»',blessing:'✦',multiplier:'×2',jump:'↑'})[type],0,7)}c.restore();
}
function cloud(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);ellipse(c,0,0,70,20,'#fffbed88');ellipse(c,-25,-14,31,28,'#fffbed88');ellipse(c,21,-17,37,34,'#fffbed88');c.restore()}
function tree(c,x,y,s,t=0){c.save();c.translate(x,y);c.scale(s,s);line(c,[[0,0],[5,-190],[-15,-270]],'#577151',15);line(c,[[2,-130],[-50,-187]],'#577151',9);line(c,[[6,-170],[45,-224]],'#577151',9);ellipse(c,-42,-220,61,62,'#6d9564');ellipse(c,19,-257,77,75,'#7c9f69');ellipse(c,64,-216,57,61,'#83a76f');ellipse(c,-3,-299,48,45,'#91af78');ellipse(c,-27,-247,55,48,'#8bac75');for(let i=0;i<6;i++){ellipse(c,-45+i*20,-225+Math.sin(i*7)*40,4,6,'#a3bc83')}c.restore()}
function castle(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);rect(c,-65,-110,130,110,'#a7bda6',3);rect(c,-98,-163,44,163,'#9ab49f',4);rect(c,53,-163,44,163,'#9ab49f',4);path(c,[[-105,-161],[-76,-207],[-47,-161]],'#7d9e8c');path(c,[[47,-161],[75,-207],[104,-161]],'#7d9e8c');rect(c,-14,-55,28,55,'#617f72',14);for(const xx of [-77,76]){rect(c,xx-5,-137,10,22,'#587b70',5);line(c,[[xx,-206],[xx,-230]],'#638571',2);path(c,[[xx,-230],[xx+23,-224],[xx,-216]],'#cfbd7c')}for(let i=-50;i<55;i+=25)rect(c,i,-120,13,15,'#a7bda6');c.restore()}
export class Renderer {
  constructor(canvas){this.canvas=canvas;this.c=canvas.getContext('2d');this.w=1280;this.h=720;this.reduced=false}
  resize(){const ratio=this.canvas.clientWidth/this.canvas.clientHeight;this.w=Math.round(720*ratio);this.canvas.width=this.w;this.canvas.height=720}
  background(g,menu=false){
    const c=this.c,w=this.w,t=this.reduced?0:g.time,cave=g.level.cave&&!menu,cam=menu?0:g.camera;
    const gradient=c.createLinearGradient(0,0,0,720);gradient.addColorStop(0,cave?'#182f38':'#b4d6c8');gradient.addColorStop(1,cave?'#395752':'#edf0c3');rect(c,0,0,w,720,gradient);
    if(cave){for(let i=0;i<25;i++){const x=i*137-cam*.3%137;path(c,[[x,0],[x+35,80+i%3*25],[x+65,0]],'#233f44');path(c,[[x,590],[x+20,450-i%4*25],[x+55,590]],'#46696a');if(i%3===0){path(c,[[x+10,570],[x+20,510],[x+32,555],[x+42,528],[x+51,574]],'#87bbb0');ellipse(c,x+30,538,35,50,'#a4e7d10a')}}return}
    ellipse(c,w*.77-cam*.015,119,57,57,'#fff4cf77');ellipse(c,w*.77-cam*.015,119,83,83,'#fff4cf22');
    for(let i=0;i<7;i++)cloud(c,((i*340+t*3-cam*.06)%(w+400)+w+400)%(w+400)-150,110+(i%3)*60,.5+i%2*.3);
    for(let layer=0;layer<3;layer++){const factor=.08+layer*.08;const offset=cam*factor%500;c.beginPath();c.moveTo(-500,720);for(let x=-500;x<w+500;x+=100)c.lineTo(x-offset,310+layer*66+Math.sin((x+cam*factor)/240)*38+Math.cos(x/150)*20);c.lineTo(w+500,720);c.fillStyle=['#96b9a5','#89ad91','#759a77'][layer];c.fill()}
    castle(c,w*.73-cam*.11,392,.7);
    for(let i=0;i<9;i++){const xx=i*295-(cam*.35%295)-100;tree(c,xx,530,.45+(i%3)*.08,t)}
    for(let i=0;i<10;i++){const xx=i*190-(cam*.5%190);ellipse(c,xx,569,125,60,['#81a368','#91ad70','#a2b67a'][i%3])}
    // Sun flecks and drifting leaves add life without hiding the route.
    for(let i=0;i<19;i++){const xx=(i*163+Math.sin(t*.3+i)*15-cam*.22)%(w+50);ellipse(c,xx,190+(i*53)%350+Math.sin(t+i)*8,2,3,'#fcf0be77')}
  }
  terrain(s){
    const c=this.c;if(s.broken)return;
    if(s.type==='pipe'){const grad=c.createLinearGradient(s.x,0,s.x+s.w,0);grad.addColorStop(0,'#395e49');grad.addColorStop(.3,'#79a06c');grad.addColorStop(.55,'#658d5b');grad.addColorStop(1,'#355743');rect(c,s.x+5,s.y+10,s.w-10,s.h-10,grad,3);rect(c,s.x-5,s.y,s.w+10,22,'#345d46',5);rect(c,s.x-2,s.y+3,s.w+4,12,'#799f68',3);line(c,[[s.x+18,s.y+26],[s.x+18,s.y+s.h-7]],'#8eae7980',3);rect(c,s.x+25,s.y+35,40,18,'#355e4930',3);ellipse(c,s.x+45,s.y+44,5,5,'#98b67d');return}
    const ground=s.h>50;rect(c,s.x,s.y,s.w,s.h,ground?'#8b7956':s.type==='crystal'?'#527879':'#9a8c68',ground?0:5);
    if(ground){rect(c,s.x,s.y+20,s.w,18,'#716c4e');for(let i=0;i<s.w;i+=51){path(c,[[s.x+i,s.y+54+i%29],[s.x+i+20,s.y+42+i%29],[s.x+i+36,s.y+61+i%29]],'#a18a62');ellipse(c,s.x+i+20,s.y+95,5,3,'#74654b')}rect(c,s.x,s.y,s.w,15,'#577b46');rect(c,s.x,s.y,s.w,7,'#bdd48b');for(let i=5;i<s.w;i+=20)path(c,[[s.x+i,s.y+10],[s.x+i+8,s.y+21],[s.x+i+14,s.y+10]],'#577b46')}
    else {rect(c,s.x,s.y,s.w,7,s.type==='crystal'?'#a6d4bc':'#becd91',3);for(let i=30;i<s.w;i+=40)line(c,[[s.x+i,s.y+9],[s.x+i-6,s.y+24]],'#7c785b',2);if(s.type==='moving'){ellipse(c,s.x+10,s.y+16,3,3,'#e6d0a0');ellipse(c,s.x+s.w-10,s.y+16,3,3,'#e6d0a0')}if(s.type==='breakable'){line(c,[[s.x+45,s.y+6],[s.x+55,s.y+15],[s.x+48,s.y+27]],'#685e4b',2)}}
  }
  meadowDetails(g){const c=this.c;const first=Math.floor(g.camera/160)*160;for(let x=first;x<g.camera+this.w+160;x+=160){if(!g.level.platforms.some(s=>s.h>50&&x>s.x&&x<s.x+s.w&&s.type!=='pipe'))continue;const y=588;line(c,[[x,y],[x+3,y-18],[x+9,y-23]],'#587b49',2);ellipse(c,x+9,y-23,4,4,x%320===0?'#ead9a0':'#d7c2a5');line(c,[[x+40,y],[x+36,y-9],[x+33,y-11]],'#577a44',2)}}
  title(g){
    this.background(g,true);const c=this.c,w=this.w,t=this.reduced?0:g.time;
    // Layered foreground island anchors the three original heroes.
    c.save();c.translate(w*.76,0);tree(c,190,596,1.55,t);tree(c,410,580,1.2,t);
    path(c,[[-300,636],[-250,569],[-153,554],[-70,571],[44,540],[170,562],[270,543],[480,575],[520,720],[-350,720]],'#696d4d');
    path(c,[[-300,636],[-250,565],[-153,550],[-70,567],[44,536],[170,558],[270,539],[480,571],[500,595],[260,568],[163,581],[45,560],[-75,591],[-155,575],[-242,592]],'#adc180');
    for(let i=0;i<17;i++){const x=-260+i*47;path(c,[[x,661+i%3*18],[x+20,610+i%4*13],[x+44,635+i%3*10]],'#89906b')}
    drawMike(c,-125,566,1.82,false,'idle',t,1);drawMike(c,20,551,2.25,true,'idle',t,1);drawCat(c,161,572,1.45,'prince',t,true);
    for(let i=0;i<8;i++){const x=-260+i*90;line(c,[[x,596],[x+3,578],[x-4,569]],'#617e48',3);ellipse(c,x-4,569,5,4,'#f4dfa1')}
    drawItem(c,{x:-214,y:325,type:'coin'},t);drawItem(c,{x:161,y:345,type:'coin'},t);drawItem(c,{x:223,y:310,type:'coin'},t);c.restore();
    // Near foreground foliage provides a soft frame.
    for(let i=0;i<6;i++)ellipse(c,w-40+i*40,690+i%2*22,65,56,'#315a43');
  }
  render(g){
    const c=this.c;c.clearRect(0,0,this.w,720);if(['menu','loading','intro'].includes(g.mode)){this.title(g);return}
    this.background(g);c.save();c.translate(-Math.round(g.camera),0);
    if(!g.level.cave){for(const s of g.level.signs){if(s.x<g.camera-400||s.x>g.camera+this.w+400)continue;line(c,[[s.x,s.y+22],[s.x,s.y+62]],'#7d7958',5);rect(c,s.x-113,s.y-20,226,42,'#eee5bd',5);c.fillStyle='#61714b';c.font='600 13px DM Sans,sans-serif';c.textAlign='center';c.fillText(s.text,s.x,s.y+5)}
      const cp=g.main.checkpoint;line(c,[[cp,590],[cp,440]],'#617351',6);path(c,[[cp,442],[cp+72,453],[cp+65,481],[cp,472]],g.checkpoint?'#f1cf76':'#e9e4c5');c.font='800 21px Outfit,sans-serif';c.fillStyle='#54714b';c.fillText('M',cp+33,466);
      castle(c,g.main.goal+165,590,1.4);if(!g.completed)drawCat(c,g.main.goal+165,586,1.1,'prince',g.time,false);
      line(c,[[g.main.goal,590],[g.main.goal,390]],'#65805a',6);path(c,[[g.main.goal,392],[g.main.goal+90,406],[g.main.goal+75,449],[g.main.goal,436]],'#d1b969');c.font='28px serif';c.fillStyle='#fff3c8';c.fillText('♛',g.main.goal+42,430);
    }else for(const s of g.level.signs){c.fillStyle='#b7d4b3';c.font='600 14px DM Sans';c.textAlign='center';c.fillText(s.text,s.x,s.y)}
    for(const s of g.level.platforms)if(s.x+s.w>g.camera-100&&s.x<g.camera+this.w+100)this.terrain(s);
    if(!g.level.cave)this.meadowDetails(g);
    for(const pipe of g.level.pipes)if(pipe.secret||pipe.exit){c.fillStyle='#f7e2a3';c.font='700 18px sans-serif';c.textAlign='center';c.fillText('↓',pipe.x+45,pipe.y-18+Math.sin(g.time*3)*4)}
    for(const h of g.level.hazards)for(let x=h.x;x<h.x+h.w;x+=19)path(c,[[x,h.y+h.h],[x+9,h.y],[x+18,h.y+h.h]],'#99a69c','#526b5d',2);
    for(const it of g.level.items)if(!it.taken&&it.x>g.camera-70&&it.x<g.camera+this.w+70)drawItem(c,it,g.time);
    for(const e of g.level.enemies)if(e.alive&&!e.hidden&&e.x>g.camera-100&&e.x<g.camera+this.w+100){drawCat(c,e.x+e.w/2,e.y+e.h,e.type==='chonky'?.85:.72,e.type,g.time);if(e.type==='armor'&&e.hp===1){c.fillStyle='#fff4d7';c.font='12px sans-serif';c.fillText('!',e.x+20,e.y-10)}}
    const p=g.player;c.save();if(p.invuln>0&&Math.sin(g.time*35)>0)c.globalAlpha=.45;
    if(g.buffs.blessing>0||g.transform>0){const xx=p.x+p.w/2,yy=p.y+p.h/2;const glow=c.createRadialGradient(xx,yy,5,xx,yy,90);glow.addColorStop(0,'#fff2a899');glow.addColorStop(1,'#fff2a800');ellipse(c,xx,yy,90,90,glow)}
    let pose=g.completed?'win':p.attack>0?'attack':p.duck?'duck':!p.grounded?'jump':Math.abs(p.vx)>15?'run':'idle';
    const pipeOffset=g.transition?(1-g.transition.timer/.6)*80:0;
    if(!g.transition||g.transition.timer>.08)drawMike(c,p.x+p.w/2,p.y+p.h+pipeOffset,p.super?.69:.59,p.super,pose,g.time,p.face);
    if(p.attack>.1){line(c,[[p.x+p.w/2+p.face*40,p.y+30],[p.x+p.w/2+p.face*72,p.y+28]],'#ffe8a4',7);line(c,[[p.x+p.w/2+p.face*42,p.y+43],[p.x+p.w/2+p.face*62,p.y+46]],'#f7d375',4)}
    if(g.completed){const catX=Math.max(p.x+42,g.main.goal+165-g.winTime*120);const arrived=catX<=p.x+43;drawCat(c,catX,588,1.1,'prince',g.time,arrived,arrived?'idle':'run',arrived?1:-1)}c.restore();
    for(const a of g.particles){c.globalAlpha=Math.min(1,a.life*2);rect(c,a.x,a.y,a.size,a.size,a.color,1)}c.globalAlpha=1;c.restore();
    if(g.transform>0){c.fillStyle=`rgba(255,240,179,${Math.sin(g.transform*15)*.08+.08})`;c.fillRect(0,0,this.w,720)}
    // Slim route progress line makes the longer level legible.
    if(!g.level.cave){rect(c,0,716,this.w,4,'#1e483851');rect(c,0,716,this.w*Math.min(1,g.maxX/g.main.goal),4,'#ecd18b')}
    const buffs=Object.entries(g.buffs).filter(([,v])=>v>0);if(buffs.length){c.font='600 13px DM Sans';c.textAlign='left';buffs.forEach(([k,v],i)=>{rect(c,24,94+i*30,180,25,'#244c3edb',5);c.fillStyle='#f5e6b2';c.fillText(`${({speed:'Quick paws',blessing:'Xiaboo’s blessing',multiplier:'Double coins',jump:'Sky steps'})[k]} · ${Math.ceil(v)}s`,35,111+i*30)})}
  }
}
