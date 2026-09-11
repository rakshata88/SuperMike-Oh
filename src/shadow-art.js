import {drawDog,drawDogEffects} from './dog-art.js';
import {drawCharacter} from './characters.js';
import {WHISKERON_DIALOGUE} from './shadow.js';
const rect=(c,x,y,w,h,color,r=4)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()};
const oval=(c,x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()};
const line=(c,x,y,xx,yy,color,width=3)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke()};
const poly=(c,points,color)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()};
const label=(c,text,x,y,size=18,color='#fff1c9',max=1000)=>{c.textAlign='center';c.font=`800 ${size}px Outfit,sans-serif`;c.fillStyle=color;c.fillText(text,x,y,max)};

function bookshelf(c,x,y,w,h){
  rect(c,x,y,w,h,'#715c7f');rect(c,x+8,y+8,w-16,h-16,'#494565');
  for(let yy=y+35;yy<y+h;yy+=45){for(let xx=x+15;xx<x+w-20;xx+=17){const color=['#93bcc1','#c892a6','#c2ad71','#8493b9'][Math.abs(Math.floor(xx/17+yy/45))%4];rect(c,xx,yy-21,12,30,color,1);line(c,xx+2,yy-14,xx+10,yy-14,'#edd8ac',1)}rect(c,x+5,yy+10,w-10,6,'#ab8194')}
}
export function castleBackground(c,g,w,t){
  const archive=g.level.cave,library=archive||g.player.x>9100&&g.player.x<14300,clock=g.player.x>17700&&g.player.x<21800;
  const grad=c.createLinearGradient(0,0,0,720);grad.addColorStop(0,archive?'#8b779c':'#66678f');grad.addColorStop(1,archive?'#d4bdb4':'#b2b0c7');rect(c,0,0,w,720,grad,0);
  const offset=g.camera*.32;
  for(let x=-offset%340-340;x<w+340;x+=340){
    rect(c,x+28,55,172,370,'#555b84',85);rect(c,x+41,69,146,341,'#b0d5dc',72);
    rect(c,x+105,70,10,341,'#7581a6');rect(c,x+42,207,144,8,'#7581a6');oval(c,x+151,139,26,26,'#fff0b7');
    poly(c,[[x+44,330],[x+84,280],[x+124,317],[x+181,247],[x+181,408],[x+44,408]],'#899cb9');
    rect(c,x+236,0,40,590,'#8788a7');rect(c,x+229,100,54,14,'#bbb7cb');rect(c,x+229,537,54,18,'#bbb7cb');
    rect(c,x+243,153,82,119,'#88628f',3);poly(c,[[x+243,267],[x+284,289],[x+325,267]],'#88628f');label(c,'✦',x+284,227,36,'#e9ce8f');
  }
  for(let y=440;y<590;y+=48)line(c,0,y,w,y,'#9291ac',2);
  if(library){for(let x=-g.camera*.5%300-300;x<w+300;x+=300)bookshelf(c,x,245,220,330);for(let i=0;i<6;i++){const x=(i*227-g.camera*.15)%(w+100);c.save();c.translate(x,150+i%2*55+Math.sin(t+i)*8);c.rotate(Math.sin(t*.5+i)*.12);rect(c,-20,-10,40,25,'#dbc599');line(c,0,-10,0,15,'#926b85',2);c.restore()}}
  if(clock){for(let x=-g.camera*.2%420;x<w;x+=420)gear(c,x,270,112,t*.25,'#9390ac')}
  // Warm sconces keep platforms visible; no darkness mask or horror lighting.
  for(let x=-g.camera*.4%520;x<w;x+=520){oval(c,x+55,355,60,90,'#ffe9a918');rect(c,x+35,381,40,7,'#d9be8f');oval(c,x+55,360,9,17,'#ffe4a1')}
}
function gear(c,x,y,r,angle,color='#cfad7c'){
  c.save();c.translate(x,y);c.rotate(angle);for(let i=0;i<12;i++){c.rotate(Math.PI/6);rect(c,-r*.16,-r-8,r*.32,22,color,3)}oval(c,0,0,r,r,color);oval(c,0,0,r*.64,r*.64,'#6d718f');for(let i=0;i<6;i++){c.rotate(Math.PI/3);line(c,0,0,0,-r*.78,color,11)}oval(c,0,0,14,14,'#e8d4a2');c.restore();
}
export function castleTerrain(c,s,t){
  if(s.type==='fallingPlatform'&&s.castle){
    const shake=s.fallTimer>0?Math.sin(t*36)*3:0,x=s.x+shake;rect(c,x,s.y,s.w,s.h,s.fallTimer!=null?'#b99cae':'#a4a0b6');rect(c,x,s.y,s.w,5,'#e6d1b0');poly(c,[[x+35,s.y+5],[x+48,s.y+11],[x+37,s.y+20],[x+52,s.y+28],[x+43,s.y+17],[x+55,s.y+10]],'#666481');if(s.fallTimer>0){label(c,'!',x+s.w/2,s.y-12,22);for(let i=0;i<4;i++)rect(c,x+22+i*27,s.y-3-Math.sin(t*9+i)*5,4,4,'#e8d4b7')}return true;
  }
  if(s.type==='castleStone'){
    rect(c,s.x,s.y,s.w,s.h,'#8f8fa8',s.h>50?0:5);rect(c,s.x,s.y,s.w,7,'#e2d2ae',3);
    for(let y=s.y+28;y<s.y+s.h;y+=32)line(c,s.x,y,s.x+s.w,y,'#73768f',2);
    for(let x=s.x+45;x<s.x+s.w;x+=80)line(c,x,s.y+8,x,s.y+Math.min(s.h,31),'#73768f',2);return true;
  }
  if(s.skin==='shelf'){bookshelf(c,s.x,s.y,s.w,s.h);rect(c,s.x,s.y,s.w,6,'#ead6af');return true}
  if(s.type==='gear'){gear(c,s.x+s.w/2,s.y+66,65,t*s.speed);rect(c,s.x,s.y,s.w,s.h,'#bba47d');rect(c,s.x,s.y,s.w,7,'#f4df9d');label(c,'RIDE • JUMP',s.x+s.w/2,s.y+21,12,'#585674');return true}
  return false;
}
export function castleScenery(c,g){
  for(const s of g.level.signs){if(s.x<g.camera-300||s.x>g.camera+g.viewWidth+300)continue;rect(c,s.x-165,s.y-22,330,38,'#eee0c5',6);label(c,s.text,s.x,s.y+3,15,'#605778',315)}
  for(const cp of g.main.checkpoints||[])if(!g.level.cave){line(c,cp,590,cp,440,'#c5b1ae',6);poly(c,[[cp,443],[cp+75,453],[cp+68,486],[cp,476]],g.checkpoint>=cp?'#f2d38c':'#b5becd');label(c,'M',cp+34,470,22,'#68637e')}
  for(const d of g.level.decorations){
    if(d.x<g.camera-300||d.x>g.camera+g.viewWidth+300)continue;
    if(d.type==='secretShelf'){const open=g.level.pipes.find(p=>p.x===d.x)?.revealed;rect(c,d.x,475,110,115,'#4e486e',25);bookshelf(c,d.x+(open?120:0),445,110,145);label(c,open?'Pause to enter':'✦',d.x+55,430,17);}
    if(d.type==='wallPipe'){rect(c,d.x-20,445,145,145,'#83839e');rect(c,d.x,490,105,100,'#6a8f9c',35);rect(c,d.x+15,514,75,76,'#4f617b',28)}
    if(d.type==='treasure'){rect(c,d.x-20,520,100,62,'#a97c89',13);rect(c,d.x-25,528,110,12,'#e9cf90');rect(c,d.x+23,535,16,25,'#e9cf90')}
    if(d.type==='clock'){oval(c,d.x,145,102,102,'#ddd0b3');oval(c,d.x,145,89,89,'#737595');for(let i=0;i<12;i++){const a=i*Math.PI/6;oval(c,d.x+Math.sin(a)*76,145-Math.cos(a)*76,3,5,'#f4e4b9')}line(c,d.x,145,d.x+Math.sin(g.time*.1)*57,145-Math.cos(g.time*.1)*57,'#f6dfaa',6);line(c,d.x,145,d.x-28,118,'#f6dfaa',7)}
  }
  for(const m of g.level.mechanisms){rect(c,m.x,m.y,m.w,m.h,m.timer>0?'#a6e5e7':'#71829e');label(c,'ϟ',m.x+m.w/2,m.y+37,34,'#fff4aa');if(m.timer>0)label(c,`${Math.ceil(m.timer)}s`,m.x+22,m.y-14,15)}
  if(!g.level.cave&&g.camera+g.viewWidth>28600){
    rect(c,30140,270,90,320,'#787894');rect(c,30126,258,118,22,'#cbb995');
    // Prince remains recognizable, visible, and safely behind a magical barrier.
    const t=g.scene?.kind==='escape'?g.scene.time:0,lift=t>4?Math.min(390,(t-4)*120):0;
    rect(c,29965,500-lift,150,18,'#cfc0a0');
    if(t<9&&!drawCharacter(c,'prince',30040,497-lift,1,'idle',g.time,1)){oval(c,30040,467-lift,23,25,'#fff0d2');poly(c,[[30018,451-lift],[30015,427-lift],[30030,442-lift],[30052,442-lift],[30065,427-lift],[30062,451-lift]],'#fff0d2');label(c,'♛',30040,430-lift,26)}
    if(!g.main.gateOpen){rect(c,29957,375,167,140,'#afdff526',25);for(let i=0;i<5;i++)line(c,29970+i*35,384,29970+i*35,505,'#c5edfa',3);label(c,'Prince Xiaboo',30040,351,19)}
    if(t>3.5){rect(c,29520,583,145,20,'#424960',0);label(c,'CLICK!',29595,562,18);}
  }
}
export function drawShadowEnemy(c,e,t,drawCat){
  c.save();if(e.invuln>0&&Math.sin(t*30)>0)c.globalAlpha=.45;
  if(e.type==='bat'){
    const x=e.x+22,y=e.y+22,flap=Math.sin(t*9)*10;
    poly(c,[[x-10,y],[x-58,y-25+flap],[x-49,y+5],[x-32,y+2],[x-20,y+20]],'#635a89');poly(c,[[x+10,y],[x+58,y-25-flap],[x+49,y+5],[x+32,y+2],[x+20,y+20]],'#7a699a');oval(c,x,y,21,23,'#9e84ba');
    for(const dx of [-9,9]){oval(c,x+dx,y-4,8,10,'#fff2d5');oval(c,x+dx+e.face*2,y-3,3,5,'#4b526c')}rect(c,x-21,y-29,42,10,'#a0b6c5');rect(c,x-6,y-36,12,13,'#e6c585');label(c,'⌣',x,y+14,20,'#4f5068');
  }else if(e.type==='mouse'){
    const x=e.x+22,y=e.y+15;line(c,x-19,y+2,x-34,y-8,'#d5c3a5',3);oval(c,x,y,24,13,'#b6c7cf');oval(c,x-10,y-13,10,10,'#d7b2ba');oval(c,x+9,y-12,8,9,'#a7b7c7');oval(c,x+e.face*15,y-1,4,5,'#454d68');oval(c,x-13,y+11,7,5,'#655e7e');oval(c,x+14,y+11,7,5,'#655e7e');c.save();c.translate(x,y-23);c.rotate(e.state==='windup'?t*9:0);line(c,0,0,0,-11,'#f2d398',3);oval(c,-7,-13,7,4,'#e2c38a');oval(c,7,-13,7,4,'#e2c38a');c.restore();
  }else if(e.type==='ghost'){
    c.globalAlpha=e.state==='stunned'?.24:.66;drawCat(c,e.x+22,e.y+e.h,.82,'prince',t,true);oval(c,e.x+22,e.y+e.h+3,24,6,'#d6e9f4');label(c,e.harmless?'Zzz...':e.state==='stunned'?'…':e.watched?'Who, me?':'♪',e.x+22,e.y-24,17,'#eff7ff');
  }else if(e.type==='knight'){
    drawCat(c,e.x+22,e.y+e.h,.86,'guard',t);if(!['lunge','exposed'].includes(e.state)){oval(c,e.x+22+e.face*25,e.y+28,13,22,e.blocked>0?'#e6faff':'#b9c9d7');label(c,'✦',e.x+22+e.face*25,e.y+33,17,'#786b97')}
  }else if(e.type==='royalDog'||e.type==='cannon'){
    drawDog(c,{...e,type:'patrol'},t);if(e.type==='royalDog'){rect(c,e.x+5,e.y-24,43,36,'#5d6488',9);rect(c,e.x+3,e.y+7,47,6,'#e2c595');label(c,'✦',e.x+26,e.y,20)}
    else{const x=e.x+22+e.face*30;rect(c,x-28,e.y+20,56,24,'#ab8fb6',12);oval(c,x+e.face*25,e.y+32,9,12,'#535f7c');oval(c,x-12,e.y+44,12,12,'#d5bf99');label(c,'TOY',x,e.y+14,11)}
  }else if(e.type==='whiskeron'){
    const x=e.x+45,y=e.y+e.h;poly(c,[[x-23,y-76],[x-64,y-5],[x+64,y-5],[x+23,y-76]],'#8e5eac');poly(c,[[x-19,y-70],[x-40,y-9],[x+40,y-9],[x+19,y-70]],'#b086bb');
    drawCat(c,x,y,1.5,'whiskeron',t,e.state==='defeated');poly(c,[[x-30,y-72],[x-38,y-107],[x-14,y-96],[x,y-124],[x+15,y-95],[x+39,y-107],[x+30,y-72]],'#9765ad');rect(c,x-32,y-80,64,10,'#e7c789');label(c,'✦',x,y-91,22,'#f4dfa6');rect(c,x-31,y-41,62,11,'#87629f');oval(c,x,y-34,7,9,'#eacd86');
    line(c,x+60,y-5,x+64,y-108,e.state==='defeated'?'#9994ac':'#e4c78e',6);oval(c,x+64,y-111,12,15,e.state==='defeated'?'#a8a5b8':'#b1e5ed');if(e.state==='vulnerable')label(c,'Oh, whiskers!',x,e.y-32,18);
  }
  c.restore();
  if(e.state.endsWith('Warning'))label(c,({swoopWarning:'SWOOP!',cannonWarning:'POP!',shieldWarning:'Shield lowering...',chargeWarning:'CHARGE!',orbWarning:'MAGIC ORBS',summonWarning:'BATS INCOMING',teleportWarning:'TELEPORT',waveWarning:'JUMP THE WAVE'})[e.state]||'!',e.x+e.w/2,e.y-43,19,'#ffefae');
  if(e.maxHp>1&&e.type!=='whiskeron')label(c,'●'.repeat(Math.max(0,e.hp)),e.x+e.w/2,e.y-18,12,'#f5d99b');
}
export function castleEffects(c,g){
  for(const h of g.level.hazards){if(h.type!=='chandelier')continue;line(c,h.anchorX,h.anchorY,h.x+h.w/2,h.y,'#e1caa3',4);rect(c,h.x,h.y,h.w,h.h,'#c4ab83',12);for(let i=0;i<4;i++){rect(c,h.x+9+i*21,h.y-20,7,23,'#f2e1b9');oval(c,h.x+12+i*21,h.y-25,5,9,'#fff0a9')}oval(c,h.x+h.w/2,h.y+12,70,22,'#fff0b517')}
  drawDogEffects(c,g);
  for(const a of g.projectiles)if(['orb','rubber','magicWave'].includes(a.type)){
    if(a.type==='magicWave'){oval(c,a.x+21,a.y+10,25,11,'#c6aff0');line(c,a.x,a.y,a.x+42,a.y,'#eff0ff',4)}
    else {oval(c,a.x+12,a.y+12,18,18,a.type==='orb'?'#b8b2ea66':'#ebbdc266');oval(c,a.x+12,a.y+12,12,12,a.type==='orb'?'#c9c6ff':'#e0a5b4');label(c,a.type==='orb'?'✧':'•',a.x+12,a.y+17,18,'#fff7d3')}
  }
  const b=g.main.boss;if(!g.level.cave&&b&&['teleportWarning','teleport'].includes(b.state)){oval(c,b.destination+45,581,63,12,'#d1c5f3');line(c,b.destination+45,575,b.destination+45,470,'#d1e6f6',4);label(c,'✧',b.destination+45,510,48)}
  const p=g.player;
  if(p.form==='thunder'){
    oval(c,p.x+p.w/2,p.y+p.h/2,45,57,'#b7f3ff22');rect(c,p.x+p.w/2-12,p.y+26,24,6,'#b6edf5');label(c,'ϟ',p.x+p.w/2,p.y+53,21,'#ffeda5');
    for(const d of [-1,1])poly(c,[[p.x+p.w/2+d*29,p.y+15],[p.x+p.w/2+d*38,p.y+28],[p.x+p.w/2+d*29,p.y+29],[p.x+p.w/2+d*36,p.y+47],[p.x+p.w/2+d*20,p.y+27]],'#c8f6ff');
    if(p.attack>p.attackMove?.duration-p.attackMove?.active){const x=p.face>0?p.x+p.w:p.x;line(c,x,p.y+24,x+p.face*35,p.y+40,'#d6fbff',6);line(c,x+p.face*35,p.y+40,x+p.face*72,p.y+19,'#d6fbff',6);line(c,x+p.face*72,p.y+19,x+p.face*112,p.y+35,'#d6fbff',6)}
  }
}
export function castleItem(c,it,t){
  if(!['thunder','royalMap','relic'].includes(it.type))return false;
  const x=it.x+14,y=it.y+16+Math.sin(t*3+it.x)*4;
  if(it.type==='thunder'){oval(c,x,y,28,28,'#aeeaff40');oval(c,x,y,17,20,'#a8dfe9');poly(c,[[x+3,y-17],[x-11,y+3],[x-1,y+3],[x-4,y+18],[x+12,y-4],[x+3,y-4]],'#fff1a6')}
  else if(it.type==='royalMap'){rect(c,x-21,y-16,42,32,'#f3dfaa');line(c,x-14,y+9,x+12,y-7,'#a87988',2);label(c,'♛',x+9,y,19,'#776689')}
  else{oval(c,x,y,19,22,'#e5c88d');oval(c,x,y,14,17,'#9984b5');label(c,'✦',x,y+7,24)}return true;
}
export function castleOverlay(c,g,w){
  const e=g.main.boss,s=g.scene;
  if(g.player.form==='thunder'&&!s){const y=w<780&&e&&e.state!=='waiting'?222:100;rect(c,24,y,185,28,'#46537edb');label(c,`Thunder Mike · ${Math.ceil(g.player.thunderTime)}s`,116,y+20,15,'#d4f4ff',175)}
  if(g.level.cave)return;
  if(e.state!=='waiting'&&e.state!=='intro'&&e.state!=='defeated'){
    rect(c,w/2-177,96,354,73,'#eee4d5f0',13);label(c,'LORD WHISKERON',w/2,120,18,'#63527d',330);
    for(let i=0;i<7;i++)rect(c,w/2-132+i*39,134,29,14,i<e.hp?'#9e7cba':'#c8c2c9');label(c,e.state==='vulnerable'?'Magic resting! C or stomp now!':e.hp<=3?'He is flustered. Watch the warning!':'Watch his staff. Wait for an opening.',w/2,193,18,'#fff3cc',w-40);
  }
  if(!s)return;
  rect(c,Math.max(16,w/2-400),205,Math.min(800,w-32),112,'#3f4565ef',15);
  if(s.kind==='intro'){label(c,'LORD WHISKERON',w/2,233,19,'#e4ca91');label(c,WHISKERON_DIALOGUE[s.line||0],w/2,270,25,'#fff3d6',w-70);label(c,'A / C: next line',w/2,298,13,'#c8daea')}
  else{
    const t=s.time,message=t<2?'His staff loses its magic...':t<4?'The barrier is gone! Mike runs to Xiaboo.':t<5.5?'A hidden switch! The tower lift rises!':t<7?'MIKE: “Xiaboo!”     PRINCE XIABOO: “Mike!”':t<10.5?'The chamber shakes! Mike reaches the window.':t<12?'Prince Xiaboo was almost rescued...':'But Lord Whiskeron escaped!';
    label(c,message,w/2,258,24,'#fff0cd',w-70);
    if(t>7&&t<10.5){for(let i=0;i<9;i++)rect(c,(i*173+t*32)%w,335+(t*50+i*59)%140,8,8,'#dbcbab',2)}
    if(t>10.5){const x=w*.65+(t-10.5)*24;rect(c,x-70,385,150,14,'#c5b5a0');oval(c,x-40,332,44,40,'#e4d3a9');line(c,x-78,351,x-78,385,'#c4b28b',2);line(c,x-2,351,x-2,385,'#c4b28b',2);poly(c,[[x-48,364],[x-62,384],[x-22,384],[x-32,364]],'#9865ad');oval(c,x-40,357,13,12,'#deb68e');poly(c,[[x-54,349],[x-57,334],[x-43,341],[x-32,331],[x-25,349]],'#9865ad');drawCharacter(c,'prince',x+40,383,.65,'idle',g.time,1);label(c,'Lord Whiskeron escapes with Xiaboo →',x,423,17,'#ffedc6',w-40);}
  }
}
