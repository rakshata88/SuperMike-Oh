import {escapeSection} from './level5.js';
import {HOWL_DIALOGUE} from './chase.js';
import {drawDog} from './dog-art.js';
import {castleEffects} from './shadow-art.js';
import {drawCharacter} from './characters.js';

const ink='#3c4d4e',gold='#ffe0a0';
function rect(c,x,y,w,h,color,r=0){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()}
function oval(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()}
function line(c,x,y,xx,yy,color=ink,width=3){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke()}
function poly(c,pts,color){c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()}
function label(c,text,x,y,size=16,color=ink,max=500){c.fillStyle=color;c.font=`800 ${size}px Outfit, sans-serif`;c.textAlign='center';c.fillText(text,x,y,max)}
function goggles(c,x,y,t=0){c.save();c.translate(x,y);c.rotate(t);line(c,-17,0,17,0,'#715847',6);for(const d of [-1,1]){oval(c,d*9,0,9,8,'#e8c581');oval(c,d*9,0,6,5,'#8dd7df');line(c,d*9-2,-2,d*9+2,1,'#f6ffff',2)}c.restore()}
function tree(c,x,y,scale=1){c.save();c.translate(x,y);c.scale(scale,scale);rect(c,-12,-190,24,190,'#99775a',5);line(c,0,-85,-50,-155,'#99775a',10);for(const [dx,dy,r] of [[-50,-170,62],[46,-190,65],[0,-242,78]]){oval(c,dx,dy,r,r*.82,'#5eaa72');oval(c,dx-9,dy-10,r*.8,r*.58,'#8ec17e')}c.restore()}
function wheel(c,x,y,r,t){oval(c,x,y,r,r,'#4a6265');oval(c,x,y,r-6,r-6,'#ccb38b');for(let i=0;i<8;i++){const a=t+i*Math.PI/4;line(c,x,y,x+Math.cos(a)*(r-4),y+Math.sin(a)*(r-4),'#68736c',4)}oval(c,x,y,6,6,'#526a67')}
function trainCar(c,d,t,royal=false){
  const {x,y,w}=d;rect(c,x+5,y+23,w-10,134,royal?'#866492':['#5a9c91','#6e8ca3','#8a7397'][d.car%3],10);rect(c,x+8,y+115,w-16,15,'#e6bd77');
  for(let xx=x+50;xx<x+w-80;xx+=130){rect(c,xx,y+45,87,58,'#e8c789',8);rect(c,xx+6,y+51,75,46,'#b8e4e7',5);line(c,xx+45,y+52,xx+45,y+98,'#788a87',3)}
  if(royal)drawCharacter(c,'prince',x+w*.53,y+103,.66,'idle',t,1);
  rect(c,x+w-42,y+29,13,91,'#c1cbbb',4);rect(c,x+w-55,y+24,26,14,'#e3d5a9',4);
  for(const xx of [x+94,x+w-94])wheel(c,xx,y+164,27,-t*7);
  line(c,x+w,y+142,x+w+88,y+142,'#63716c',8);for(let i=0;i<4;i++)rect(c,x+w+8+i*19,y+138,12,8,'#e0c48c',3);
  // Decorative ladders only; roofs and lower cars are reached by jumping.
  for(const xx of [x+18,x+38])line(c,xx,y+30,xx,y+143,'#dfd2a2',3);for(let yy=y+40;yy<y+144;yy+=18)line(c,x+18,yy,x+38,yy,'#dfd2a2',3);
}
function airship(c,x,y,t,depart=0){
  c.save();c.translate(x+Math.max(0,depart-8)*50,y-Math.max(0,depart-4.3)*15);
  oval(c,105,-208,232,83,'#987598');oval(c,100,-220,221,68,'#ebca98');oval(c,100,-225,148,62,'#f7dfb6');
  for(const xx of [-45,70,190]){line(c,xx,-275,xx-8,-161,'#b58b8a',3);line(c,xx-8,-150,xx-18,-58,'#a68b72',3)}
  poly(c,[[-120,-212],[-192,-239],[-174,-189],[-128,-176]],'#94759b');label(c,'♛',100,-207,45,'#937293');
  rect(c,-75,-83,345,71,'#85657f',15);rect(c,-89,-83,370,13,'#e7c18a',4);for(const xx of [-26,37,100,163,226])oval(c,xx,-45,17,19,'#b4dfdf');
  for(const xx of [-87,268]){rect(c,xx-17,-23,34,23,'#667a80',5);wheel(c,xx,-27,22,t*13)}
  drawCharacter(c,'prince',45,-82,.83,'idle',t,-1);
  // Whiskeron's familiar purple cloak and staff, seen above the gondola.
  poly(c,[[164,-137],[134,-83],[197,-83],[183,-136]],'#73518c');oval(c,174,-146,20,18,'#d7b59b');poly(c,[[154,-153],[151,-180],[169,-164],[186,-182],[194,-151]],'#9877ac');line(c,204,-92,212,-162,'#d2ad72',4);oval(c,213,-167,7,8,'#d5b8f5');
  if(depart>5.8&&depart<7.4){line(c,210,-165,-72,20,'#dfbdfa',7);oval(c,-72,20,34,28,'#cfb2ec66')}
  c.restore();
}
export function escapeBackground(c,g,w,t){
  const region=escapeSection(g.player.x).id,cave=g.level.cave,cargo=g.level.roomId==='cargo',cam=g.camera;
  const grad=c.createLinearGradient(0,0,0,720);grad.addColorStop(0,cave?(cargo?'#766780':'#b69372'):region==='forest'?'#a9ded2':region==='airship'?'#a9cde6':'#a6dbe6');grad.addColorStop(1,cave?'#edcf9c':region==='mountain'?'#f4e4c7':'#fff2c9');rect(c,0,0,w,720,grad);
  if(cave){for(let x=-cam%180-180;x<w+180;x+=180){rect(c,x,0,9,590,cargo?'#aa8c85':'#8d72594d');if(cargo){rect(c,x+30,160,110,135,'#e3c593',15);rect(c,x+39,169,92,117,'#add8d6',10);line(c,x+85,170,x+85,285,'#997e74',5)}else{oval(c,x+80,110,38,30,'#cfa77b');oval(c,x+80,115,24,19,'#e5c89e')}}return}
  oval(c,w*.8,120,55,55,'#fff4c4aa');
  const speed=region==='train'?t*100:0;
  for(let i=0;i<Math.ceil(w/280)+2;i++){const x=i*280-(cam*.07+t*4)%280;oval(c,x,100+i%3*42,64,17,'#fff9e6bb');oval(c,x-14,86+i%3*42,31,25,'#fff9e6bb')}
  for(let layer=0;layer<3;layer++){const stride=layer===0?560:430,offset=(cam*(.08+layer*.06)+speed*(.2+layer*.3))%stride;for(let x=-stride-offset;x<w+stride;x+=stride){const y=370+layer*65;poly(c,[[x,650],[x+stride*.42,y-120],[x+stride,650]],['#9cbab9','#8dada6','#81a78c'][layer]);if(region==='mountain'||region==='airship')poly(c,[[x+stride*.28,y-30],[x+stride*.42,y-120],[x+stride*.55,y-28],[x+stride*.43,y-52],[x+stride*.36,y-27]],'#ecedda')}}
  if(region==='forest'||region==='river'||region==='train')for(let x=-250-(cam*.35+speed*1.5)%280;x<w+280;x+=280)tree(c,x,565,.72);
  if(region==='river'){rect(c,0,620,w,100,'#67bfc7');for(let i=0;i<w/90+1;i++)line(c,i*90-t*25%90,650,i*90+46-t*25%90,650,'#b8f2e5',3)}
  if(region==='train'){for(let i=0;i<16;i++){const x=(i*173-t*430)% (w+200);line(c,x,275+i%8*34,x+70,275+i%8*34,'#fff7d34d',2)}}
}
export function escapeTerrain(c,s,t){
  if(!['escapeGround','escapePlatform','tunnelCeiling'].includes(s.type)&&!(s.type==='moving'&&['log','boat','branch','stone','lift'].includes(s.skin)))return false;
  if(s.weak){rect(c,s.x,s.y,s.w,s.h,s.secretCrate?'#ab7983':'#b68b5a',5);rect(c,s.x+6,s.y+6,s.w-12,s.h-12,'#d3ad76',3);line(c,s.x+6,s.y+6,s.x+s.w-6,s.y+s.h-6,'#927258',5);line(c,s.x+s.w-6,s.y+6,s.x+6,s.y+s.h-6,'#927258',5);if(s.secretCrate)label(c,'✧',s.x+s.w/2,s.y+36,28,gold);return true}
  if(s.type==='tunnelCeiling'){rect(c,s.x,s.y,s.w,s.h,'#859a98');for(let x=s.x;x<s.x+s.w;x+=85){rect(c,x,s.y+100,78,40,'#9faba1',3);poly(c,[[x,s.y+s.h-15],[x+22,s.y+s.h],[x+44,s.y+s.h-15]],'#e3c784')}return true}
  if(s.type==='escapeGround'){
    const stone=s.skin==='mountain',wood=s.skin==='wood';rect(c,s.x,s.y,s.w,s.h,stone?'#9eaa9a':wood?'#a18460':'#ac8e63');rect(c,s.x,s.y,s.w,13,stone?'#c8ceac':wood?'#ead3a1':'#93bd73');
    for(let x=s.x;x<s.x+s.w;x+=80){poly(c,[[x+12,s.y+40],[x+46,s.y+28],[x+67,s.y+60],[x+23,s.y+74]],stone?'#bac2ad':'#c5a677')}
    return true;
  }
  const metal=['trainRoof','lift','landing','stone','rock'].includes(s.skin);rect(c,s.x,s.y,s.w,s.h,metal?'#687c7f':'#957553',5);rect(c,s.x+2,s.y,s.w-4,7,metal?'#c7d6c4':'#e0c997',3);
  for(let x=s.x+18;x<s.x+s.w-10;x+=42){if(metal)oval(c,x,s.y+16,2,2,'#d1d9bd');else line(c,x,s.y+9,x,s.y+s.h-3,'#bd996b',3)}
  if(s.skin==='bridge'){for(const x of [s.x+10,s.x+s.w-10])line(c,x,s.y-45,x,s.y,'#a68963',4);line(c,s.x+10,s.y-38,s.x+s.w-10,s.y-38,'#c2aa79',3)}
  if(s.skin==='boat')poly(c,[[s.x,s.y+s.h],[s.x+s.w,s.y+s.h],[s.x+s.w-28,s.y+56],[s.x+30,s.y+56]],'#8f6a50');
  if(s.skin==='log'||s.skin==='branch')for(const x of [s.x+12,s.x+s.w-12]){oval(c,x,s.y+16,11,13,'#d6b787');oval(c,x,s.y+16,6,8,'#a9825b')}
  if(s.skin==='towerDeck'||s.skin==='landing'){for(const x of [s.x+15,s.x+s.w-15]){line(c,x,s.y+26,x,710,'#8e8066',10);line(c,x,s.y+100,x+(x===s.x+15?70:-70),s.y+26,'#b29a76',7)}}return true;
}
export function escapeScenery(c,g,t=g.time){
  for(const d of g.level.decorations){if(d.x<g.camera-1100||d.x>g.camera+g.viewWidth+800)continue;
    if(d.type==='trainCar'){trainCar(c,d,t);if(d.car===10)for(let i=0;i<7;i++)oval(c,d.x+d.w-45-i*52-(t*30)%52,d.y-34-i*13,19+i*5,13+i*4,'#fff1d777')}
    if(d.type==='waterwheel'){line(c,d.x,570,d.x,710,'#997a56',12);wheel(c,d.x,609,77,t*.6);for(let i=0;i<8;i++){const a=t*.6+i*Math.PI/4;rect(c,d.x+Math.cos(a)*72-9,609+Math.sin(a)*72-9,18,18,'#bc9e70')}}
    if(d.type==='waterfall'){rect(c,d.x,310,110,390,'#a6e1dd99');for(let i=0;i<7;i++)line(c,d.x+10+i*15,320+(t*70+i*57)%250,d.x+10+i*15,390+(t*70+i*57)%250,'#e1faf2',3);oval(c,d.x+55,683,91,17,'#cff3df')}
    if(d.type==='logChute'){poly(c,[[d.x-225,590],[d.x+30,310],[d.x+75,590]],'#a4b081');line(c,d.x-180,455,d.x+60,330,'#b09064',12);label(c,'LOG CHUTE',d.x+5,294,16)}
    if(d.type==='airship')airship(c,d.x,445,t,g.scene?.kind==='airshipEnding'?g.scene.time:0);
    if(d.type==='launchTower'){for(const x of [d.x,d.x+130])line(c,x,590,x,190,'#98876b',12);for(let y=250;y<590;y+=90){line(c,d.x,y,d.x+130,y+90,'#b4a077',7);line(c,d.x+130,y,d.x,y+90,'#b4a077',7)}line(c,d.x-50,200,d.x+190,200,'#d7c49a',10);line(c,d.x-50,200,d.x-50,390,'#c8b68d',3)}
  }
  for(const h of g.level.hazards){if(h.type==='deepWater'){rect(c,h.x,h.y,h.w,h.h,'#61b4c5cc');for(let x=Math.max(h.x,Math.floor(g.camera/70)*70);x<Math.min(h.x+h.w,g.camera+g.viewWidth+70);x+=70)line(c,x,h.y+8+Math.sin(t*2+x)*3,x+38,h.y+8,'#c6f2e9',3)}else if(h.type==='tracks'){for(const y of [688,704])line(c,h.x,y,h.x+h.w,y,'#9e9579',5);for(let x=Math.max(h.x,Math.floor(g.camera/55)*55);x<Math.min(h.x+h.w,g.camera+g.viewWidth+55);x+=55)line(c,x,683,x+10,714,'#7a8170',5)}}
  for(const s of g.level.signs){if(Math.abs(s.x-g.player.x)>1600)continue;rect(c,s.x-173,s.y-21,346,34,'#fff0cef0',7);label(c,s.text,s.x,s.y+2,15,'#536c5a',330)}
  if(!g.level.cave){for(const cp of g.main.checkpoints){line(c,cp,590,cp,444,'#70876c',5);poly(c,[[cp,444],[cp+68,454],[cp+58,485],[cp,475]],g.checkpoint>=cp?'#ffd075':'#e8e7c4');label(c,'M',cp+30,469,20)}
    if(escapeSection(g.player.x).id==='forest')for(let x=Math.floor(g.camera/300)*300;x<g.camera+g.viewWidth;x+=300)if(g.level.platforms.some(s=>s.type==='escapeGround'&&x>=s.x&&x<s.x+s.w)){rect(c,x,570,7,20,'#ead4a5',3);oval(c,x+3,569,16,8,'#d88163');for(let i=0;i<3;i++)oval(c,x-6+i*8,568,2,2,'#ffe4b5')}
  }
  for(const pipe of g.level.pipes)if(pipe.chase&&pipe.revealed){rect(c,pipe.x,pipe.y-75,pipe.w,75,'#57495e',12);label(c,'ROYAL CARGO',pipe.x+50,pipe.y-48,12,gold,94);label(c,'Pause here',pipe.x+50,pipe.y-22,13,'#fff0ce',92)}
}
export function drawChaseEnemy(c,e,t){
  const x=e.x+e.w/2,y=e.y+e.h,warning=/Warning$/.test(e.state),boss=e.type==='howl';
  if(e.type==='trainDog'||boss){
    drawDog(c,{...e,type:boss?'barko':'patrol',state:e.state==='defeated'?'defeated':e.state==='vulnerable'?'dizzy':e.state},t);
    c.save();c.translate(x,y);const scale=boss?1.5:.8;c.scale(scale,scale);
    rect(c,-24,-39,48,22,boss?'#786d59':'#516e8e',5);rect(c,-22,-45,44,8,'#d5ba89',3);
    if(boss){goggles(c,0,-66,e.state==='defeated'?t*5:0);poly(c,[[15,-44],[40,-41],[30,-27],[15,-34]],'#d28767');if(e.state==='windBlast'||e.state==='windWarning'){wheel(c,e.face*43,-31,24,t*(e.state==='windBlast'?15:1));rect(c,e.face*43-5,-9,10,16,'#766f67')}}
    else{rect(c,-24,-74,48,10,'#3e566f',3);rect(c,-17,-88,34,17,'#7395ad',5);label(c,'M',0,-74,12,gold);oval(c,e.face*19,-42,5,5,gold)}c.restore();
    if(boss&&e.state==='aerial'){rect(c,e.x-18,y+6,e.w+36,17,'#839897',7);wheel(c,x,y+29,15,t*10)}
  }else{
    c.save();c.translate(x,y);c.scale(e.face||1,1);const bob=['patrol','flee','charge'].includes(e.state)?Math.abs(Math.sin(t*10))*2:0;c.translate(0,bob);
    if(e.type==='fish'){poly(c,[[-19,-17],[-34,-30],[-34,-3]],'#dc9b63');oval(c,0,-17,24,15,'#eabf74');oval(c,12,-21,6,7,'#fff6d3');oval(c,14,-21,2,3,ink);line(c,18,-11,23,-13,ink,2)}
    else if(e.type==='eagle'){const flap=Math.sin(t*6)*10;poly(c,[[-10,-22],[-45,-42+flap],[-34,-13],[-13,-6]],'#887867');poly(c,[[10,-22],[43,-42-flap],[34,-11],[10,-5]],'#a18b70');oval(c,0,-23,16,19,'#b09778');oval(c,8,-39,14,13,'#eee1b9');poly(c,[[20,-43],[31,-35],[18,-32]],'#dfaf65');goggles(c,6,-42);rect(c,-16,-15,17,15,'#976f52',4)}
    else if(e.type==='hedgehog'&&e.state==='charge'){c.rotate(-t*12);oval(c,0,-17,21,20,'#8c796c');oval(c,0,-17,16,15,'#c6af8f');line(c,-11,-28,13,-8,'#e6c57e',5)}
    else{
      const color=({fox:'#df985c',raccoon:'#a8a194',monkey:'#ad8760',hedgehog:'#b9a58c',duck:'#f0d694',goat:'#dfd8b9'})[e.type];
      if(e.type==='fox'||e.type==='raccoon'){poly(c,[[-14,-12],[-36,-34],[-47,-28],[-34,-7],[-12,-4]],e.type==='fox'?'#d58451':'#878d87');poly(c,[[-36,-34],[-47,-28],[-40,-16],[-31,-23]],e.type==='fox'?'#ffebc7':'#515f5e')}
      if(e.type==='monkey'){c.strokeStyle='#936b4b';c.lineWidth=6;c.beginPath();c.arc(-25,-18,13,.7,Math.PI*2);c.stroke()}
      for(const d of [-1,1]){rect(c,d*12-5,-12+Math.sin(t*8+d)*2,11,12,color,4);oval(c,d*13,-43,8,10,color)}
      oval(c,0,-22,20,18,color);oval(c,3,-42,21,17,color);oval(c,11,-36,15,10,'#f6e4bc');oval(c,22,-39,4,3,e.type==='duck'?'#d99a52':ink);
      for(const dx of [-5,12]){oval(c,dx,-47,5,6,'#fff6df');oval(c,dx+1,-47,2,3,ink)}
      if(e.type==='fox'){poly(c,[[-17,-49],[-18,-68],[-5,-55],[11,-55],[23,-66],[21,-47]],color);goggles(c,0,-57);rect(c,-20,-31,38,6,'#679b99',3);rect(c,-25,-30,10,23,'#77afaa',2);rect(c,-26,-27,10,20,'#947250',3)}
      if(e.type==='raccoon'){rect(c,-17,-52,37,13,'#59605d',5);for(const dx of [-5,12])oval(c,dx,-46,2,3,'#fff2ce');rect(c,-22,-66,40,8,'#665e58',3);rect(c,-12,-77,26,14,'#87775e',4);rect(c,-20,-23,20,19,'#9a734f',5);if(e.stolen)label(c,'M',-10,-9,11,gold)}
      if(e.type==='monkey'){rect(c,-24,-64,46,7,'#d6ba79',3);oval(c,0,-65,17,11,'#e4cc91');line(c,23,-23,36,-38,'#cba06c',7);line(c,36,-38,43,-27,'#cba06c',7)}
      if(e.type==='duck'){poly(c,[[-25,-60],[0,-77],[26,-60]],'#4c6570');label(c,'✧',0,-63,14,gold);rect(c,7,-52,12,10,ink,3);line(c,20,-14,37,-42,'#ac8660',5);line(c,27,-21,17,-30,'#e2be7c',4)}
      if(e.type==='hedgehog'){poly(c,[[-21,-14],[-28,-24],[-22,-31],[-29,-41],[-17,-42],[-14,-53],[-1,-41]],'#8f796b');oval(c,0,-59,19,8,'#9ba6a1');line(c,-16,-56,20,-56,'#6d807e',4)}
      if(e.type==='goat'){line(c,-13,-51,-19,-68,'#9b8a72',5);line(c,12,-52,16,-68,'#9b8a72',5);oval(c,0,-61,16,7,'#8d9a93');line(c,-14,-56,18,-56,'#617b7b',4);rect(c,-16,-29,32,4,'#a4825a');oval(c,4,-23,7,7,'#e0b65c')}
    }
    c.restore();
  }
  if(warning){oval(c,x,e.y-23,14,15,'#fff0c7');label(c,'!',x,e.y-17,22,'#b96542');if(['chargeWarning','turnWarning','dashWarning'].includes(e.state))label(c,e.face>0?'→':'←',x+e.face*40,e.y+e.h-8,30,'#c67543')}
  if(e.harmless)label(c,'z z z',x,e.y-10,16,'#7b7963');
  if(e.state==='vulnerable'||e.state==='defeated')for(let i=0;i<3;i++)label(c,'✧',x+Math.cos(t*3+i*2)*35,e.y-12+Math.sin(t*3+i*2)*7,18,gold);
}
export function escapeItem(c,it,t){
  if(!['dash','denToken','cargoSeal','recoveredCoins'].includes(it.type))return false;
  const x=it.x+14,y=it.y+16+Math.sin(t*3+it.x)*4;oval(c,x,y,26,26,it.type==='dash'?'#a9f4df55':'#fff0ab55');oval(c,x,y,17,18,it.type==='dash'?'#83d8c6':'#e4be76');label(c,({dash:'»',denToken:'✧',cargoSeal:'♛',recoveredCoins:'M'})[it.type],x,y+8,27,it.type==='dash'?'#efffdf':'#937255');return true;
}
export function escapeEffects(c,g,t=g.time){
  castleEffects(c,{...g,projectiles:g.projectiles.filter(a=>a.type==='fireball')});
  for(const h of g.level.hazards)if(['escapeLog','slidingCargo'].includes(h.type)&&h.phase!=='cooldown'){
    if(h.type==='escapeLog'){c.save();c.translate(h.x+h.w/2,h.y+h.h/2);c.rotate(h.phase==='rolling'?-t*4:0);oval(c,0,0,29,21,'#ad8158');oval(c,-17,0,10,18,'#e0bb80');oval(c,-17,0,5,11,'#b78e62');c.restore()}
    else{rect(c,h.x,h.y,h.w,h.h,'#bb9470',4);line(c,h.x+5,h.y+5,h.x+h.w-5,h.y+h.h-5,'#ecd097',5)}
    if(h.phase==='warning')label(c,h.type==='escapeLog'?'! LOG':'! ← CARGO',h.x+h.w/2,h.y-15,18,'#a8523d');
  }
  for(const a of g.projectiles){if(a.type==='fireball')continue;const x=a.x+a.w/2,y=a.y+a.h/2;
    if(a.type==='boomerang'){c.save();c.translate(x,y);c.rotate(t*8);line(c,-13,8,0,-8,'#7f6950',7);line(c,0,-8,13,8,'#d8b27b',7);c.restore()}
    else if(a.type==='toyCrate'){rect(c,a.x,a.y,a.w,a.h,'#d5b480',3);line(c,a.x,a.y,a.x+a.w,a.y+a.h,'#a08364',3)}
    else{oval(c,x,y,a.w/2+2,a.h/2+2,a.type==='waterBalloon'?'#91dbe4':a.type==='howlBall'?'#e9a7a0':'#b7986d');line(c,x-5,y-6,x+4,y+5,a.type==='pinecone'?'#826953':'#fff1cf',3)}
  }
  for(const wind of g.level.winds)if(g.player.x>wind.x-250&&g.player.x<wind.x+wind.w+250&&Math.sin(g.time*Math.PI*2/wind.period)>.15)for(let i=0;i<14;i++){const x=wind.x+((i*97+t*wind.dir*90)%wind.w+wind.w)%wind.w,y=365+i%5*43;line(c,x,y,x+wind.dir*37,y,'#f4f4d5aa',2);oval(c,x,y,5,2,'#d6bc79')}
  const b=g.main.boss,p=g.player;if(!g.level.cave&&b.state==='windBlast')for(let i=0;i<13;i++){const x=b.x+b.face*((t*260+i*77)%750);line(c,x,450+i%4*30,x+b.face*48,450+i%4*30,'#e1f7e3bb',3)}
  if(p.form==='dash'){oval(c,p.x+p.w/2,p.y+p.h-3,34,8,'#bcffeab0');for(let i=0;i<4;i++){const x=p.x+p.w/2-p.face*(15+i*8);line(c,x,p.y+15+i*16,x-p.face*(20+Math.sin(t*9+i)*7),p.y+15+i*16,'#c5fff0',3)}rect(c,p.x+p.w/2-10,p.y+26,20,5,'#a0e8d3',2)}
  if(g.scene?.kind==='trainSight'){const x=g.camera+g.viewWidth+400-g.scene.time*(g.viewWidth+1300)/4;trainCar(c,{x,y:385,w:700,car:1},t,true);for(let i=0;i<5;i++)oval(c,x+600+i*45,323-i*14,18+i*6,12+i*4,'#fff3d477')}
  if(g.scene?.kind==='detach'){const d=g.level.decorations.find(d=>d.type==='trainCar'&&d.car===10);if(d)trainCar(c,{...d,x:d.x-g.scene.time*140},t);label(c,'×',20750-g.scene.time*95,574,46,'#efd08b')}
  if(g.scene?.kind==='airshipEnding'&&g.scene.time>8.5&&g.scene.time<11){const n=(g.scene.time-8.5)/2.5;const x=33640-80*n,y=305+135*n;rect(c,x-19,y-15,38,30,'#f8e6b4',3);label(c,'♛',x,y+6,19,'#9a77a1')}
}
export function escapeOverlay(c,g,w){
  const b=g.main.boss,s=g.scene,p=g.player,battle=!g.level.cave&&!['waiting','intro','defeated'].includes(b.state);
  if(battle){const bw=Math.min(360,w-32);rect(c,(w-bw)/2,96,bw,80,'#fff0d9f2',12);label(c,'COMMANDER HOWL',w/2,122,20,ink,bw-18);for(let i=0;i<8;i++)rect(c,w/2-144+i*37,139,27,14,i<b.hp?'#c68666':'#d6d4bd',4);
    const hints={dashWarning:'Air dash! Get ready to jump.',airDash:'Jump over Howl!',windWarning:'The fan is winding up...',windBlast:'Hold B to push against the wind.',ballsWarning:'Three bouncing balls incoming!',balls:'Watch the bounce, then jump.',aerialWarning:'Flying platform! Watch overhead.',aerial:'Two slow drops. Keep moving.',vulnerable:'Howl is resting! C or jump now!'};label(c,hints[b.state]||'Watch for the warning.',w/2,202,19,ink,w-40)}
  if(['dash','thunder'].includes(p.form)&&!s){const y=battle&&w<850?222:100;rect(c,24,y,187,29,'#426f71e8',6);label(c,`${p.form==='dash'?'Dash':'Thunder'} Mike · ${Math.ceil(p.form==='dash'?p.dashTime:p.thunderTime)}s`,117,y+20,16,'#dcfff0',170)}
  if(!s)return;
  c.save();if(s.kind==='airshipEnding')c.translate(0,-124);
  const width=Math.min(820,w-32);rect(c,(w-width)/2,220,width,105,'#465c6aef',14);
  if(s.kind==='howlIntro'){label(c,'COMMANDER HOWL',w/2,245,18,gold,width-24);label(c,HOWL_DIALOGUE[s.line||0],w/2,279,26,'#fff6da',width-30);label(c,'A / C: next line',w/2,307,13,'#d3e9e4')}
  else if(s.kind==='trainSight'){label(c,'CHECKPOINT!  •  PRINCE XIABOO!',w/2,259,25,gold,width-26);label(c,'Mike races toward the convoy’s train.',w/2,294,18,'#f7efd5',width-26)}
  else if(s.kind==='detach'){label(c,'Lord Whiskeron is getting away!',w/2,260,26,gold,width-26);label(c,'The rear cars disconnect. Mike jumps for the mountain!',w/2,295,18,'#f7efd5',width-26)}
  else if(s.kind==='airshipEnding'){const t=s.time,title=t<2?'COMMANDER HOWL':t<4.3?'PRINCE XIABOO':t<6.5?'LORD WHISKERON':t<8.5?'A SAFE LANDING':t<11?'A GIFT FROM XIABOO':'SKY KINGDOM';const message=t<2?"You're... faster than you look...":t<4.3?'MIKE!':t<6.5?'Still following me?':t<8.5?'Mike lands on the lower platform.':t<11?'Prince Xiaboo left Mike a clue!':'The airship is heading toward the Sky Kingdom...';label(c,title,w/2,251,20,gold,width-26);label(c,message,w/2,293,25,'#fff6da',width-26)}c.restore();
}
