const rect=(c,x,y,w,h,color,r=4)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()};
const oval=(c,x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()};
const line=(c,x,y,xx,yy,color,width=3)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke()};
const label=(c,text,x,y,size=18,color='#344f63')=>{c.textAlign='center';c.font=`800 ${size}px Outfit,sans-serif`;c.fillStyle=color;c.fillText(text,x,y)};
export function drawDog(c,e,t){
  const boss=e.type==='barko',sleep=e.state==='sleep',dizzy=e.state==='dizzy'||e.state==='defeated';
  c.save();c.translate(e.x+e.w/2,e.y+e.h);c.scale(boss?1.65:1,boss?1.7:1);
  oval(c,0,0,28,5,'#314b5428');
  if(e.invuln>0&&Math.sin(t*30)>0)c.globalAlpha=.5;
  if(e.state==='defeated'){c.translate(0,-14);c.rotate(-.9)}
  c.save();c.scale(e.face||-1,1);
  if(boss){c.fillStyle='#d35d66';c.beginPath();c.moveTo(-17,-44);c.lineTo(-38,-2);c.lineTo(22,-6);c.fill()}
  line(c,-19,-17,-30,-26+Math.sin(t*8)*4,'#936039',7);
  const coat=e.type==='shield'?'#8d9dbb':e.type==='charger'?'#c59672':e.type==='bouncer'?'#55aaa7':e.type==='tennis'?'#83aa62':'#6687bd';
  rect(c,-21,-32,42,30,coat,10);line(c,-12,-23,12,-23,'#ffe7a3',3);oval(c,0,-18,4,5,'#f8d471');
  const step=Math.abs(e.vx)>0?Math.sin(t*13)*4:0;
  oval(c,-12,-2+step,9,5,'#c5945f');oval(c,13,-2-step,9,5,'#e4b879');
  oval(c,0,-44,23,19,'#e3b47a');oval(c,-20,-40,8,17,'#886043');oval(c,19,-41,7,15,'#986949');
  oval(c,7,-36,16,11,'#fff0c9');oval(c,17,-40,6,4,'#41404b');
  if(sleep||dizzy){line(c,-10,-47,-4,-46,'#424050',2);line(c,5,-48,11,-47,'#424050',2)}
  else{oval(c,-7,-47,4,5,'white');oval(c,8,-47,4,5,'white');oval(c,-5,-46,2,3,'#3d4051');oval(c,10,-46,2,3,'#3d4051');line(c,-12,-54,-3,-52,'#65533e',2);line(c,5,-53,13,-55,'#65533e',2)}
  line(c,7,-31,16,-32,'#946544',2);
  if(e.type==='bouncer'){rect(c,-16,-55,32,12,'#e6a94b');rect(c,-13,-54,10,8,'#b6edf0');rect(c,3,-54,10,8,'#b6edf0')}
  else if(e.type==='sleepyDog'){rect(c,-17,-64,29,13,'#b59bcd',7);oval(c,17,-57,5,5,'#fff0cd')}
  else{c.save();c.translate(0,-60);if(e.state==='defeated')c.rotate(t*5);oval(c,0,0,24,11,boss?'#698eb2':'#879eaf');rect(c,-27,0,54,6,'#53697e');rect(c,-5,-12,10,12,'#f0ca68');c.restore()}
  if(e.type==='shield'){oval(c,27,-23,15,24,e.blocked>0?'#e4faff':'#6b95ad');oval(c,27,-23,11,19,'#a5c9d4');label(c,'M',27,-18,13,'#5e809b')}
  if(e.type==='tennis'){rect(c,-28,-29,18,25,'#9c794f');oval(c,-23,-28,6,6,'#d9ed65');oval(c,-13,-28,6,6,'#daed6e')}
  c.restore();c.restore();
  if(sleep)label(c,'Zzz...',e.x+e.w/2,e.y-26,19,'#82679e');
  if(e.state==='warning'||e.state.endsWith('Warning'))label(c,e.state==='ballWarning'?'TENNIS!':e.state==='slamWarning'?'JUMP SLAM!':'!',e.x+e.w/2,e.y-35,24,'#b75439');
  if(dizzy){for(let i=0;i<3;i++)label(c,'★',e.x+e.w/2+Math.cos(t*4+i*2.1)*38,e.y-17+Math.sin(t*4+i*2.1)*7,18,'#e5a838')}
  if(e.state==='defeated')label(c,'Woof... you may pass.',e.x+e.w/2,e.y-60,20);
}
export function drawDogScenery(c,g){
  for(const d of g.level.decorations){
    if(d.x<g.camera-400||d.x>g.camera+g.viewWidth+400)continue;
    const x=d.x;
    if(d.type==='dogflag'){line(c,x,590,x,300,'#a28d72',6);rect(c,x,305,78,92,'#659cb4',2);oval(c,x+38,360,13,11,'#ffdf96');for(const dx of [-14,0,14])oval(c,x+38+dx,342,5,6,'#ffdf96')}
    if(d.type==='moat'){rect(c,x,625,d.w,80,'#6fc9dc',0);for(let n=0;n<d.w;n+=28)line(c,x+n,638+Math.sin(g.time*3+n)*3,x+n+18,638,'#d9f9f4',3)}
    if(d.type==='doghouse'){rect(c,x-20,476,150,114,'#e4af77');c.fillStyle='#c76865';c.beginPath();c.moveTo(x-40,485);c.lineTo(x+55,416);c.lineTo(x+150,485);c.fill();rect(c,x+23,518,63,72,'#594c59',28);if(g.level.pipes.some(p=>p.x===x&&(p.revealed||p.exit))){oval(c,x+55,574,37,8,'#ffdf9277');label(c,'Pause to enter',x+55,610,14)}label(c,'DOGS ONLY',x+55,505,14);oval(c,x+107,535,8,5,'#ffdb88')}
    if(d.type==='chute'){c.fillStyle='#cba67d';c.beginPath();c.moveTo(x-180,455);c.lineTo(x+90,315);c.lineTo(x+90,343);c.lineTo(x-180,483);c.fill();line(c,x+70,350,x+70,590,'#bc9470',12);label(c,'BARRELS',x+25,294,16)}
    if(d.type==='tower'){rect(c,x-80,290,160,300,'#c0b9d4');for(let y=315;y<570;y+=50)line(c,x-78,y,x+78,y,'#a09ebc',3);rect(c,x-100,262,200,32,'#9b9bb9');for(let n=0;n<5;n++)rect(c,x-95+n*43,238,28,30,'#c0b9d4');rect(c,x-22,328,44,65,'#829bac',22);label(c,'PAW WATCH',x,417,15)}
    if(d.type==='gate'){const lift=g.main.gateOpen?140:0;line(c,x,590,x,385,'#9ba5be',20);line(c,x+150,590,x+150,385,'#9ba5be',20);rect(c,x-15,375,180,25,'#dbca9d');for(let n=0;n<7;n++)line(c,x+12+n*21,405-lift,x+12+n*21,590-lift,'#8c91a9',7);label(c,'INNER CASTLE',x+75,355,18)}
  }
}
export function drawDogEffects(c,g){
  for(const h of g.level.hazards)if(h.type==='barrel'&&h.phase!=='cooldown'){
    c.save();c.translate(h.x+21,h.y+21);if(h.phase==='rolling')c.rotate(-g.time*5);oval(c,0,0,22,22,'#936843');oval(c,0,0,18,18,'#d5a069');line(c,-10,-16,-10,16,'#8e7565',5);line(c,10,-16,10,16,'#8e7565',5);c.restore();
    if(h.phase==='warning')label(c,'! BARREL',h.x+21,h.y-20,20,'#b5563e');
  }
  for(const a of g.projectiles){
    if(a.type==='wave'){oval(c,a.x+a.w/2,a.y+a.h/2,20,10,'#f4ca7c');line(c,a.x,a.y,a.x+a.w,a.y,'#fff1c4',3)}
    else {oval(c,a.x+9,a.y+9,a.type==='fireball'?14:10,10,a.type==='fireball'?'#fa9551':'#c3d94f');oval(c,a.x+9,a.y+9,6,6,a.type==='fireball'?'#ffe58b':'#e1ef89');if(a.type==='tennis')line(c,a.x+4,a.y+3,a.x+12,a.y+14,'#fffde0',2)}
  }
  if(g.player.form==='fire'){
    const p=g.player;oval(c,p.x+p.w/2,p.y+p.h-2,30,7,'#ffad6740');
    // Scarf and flame badge overlay the original black-sando Mike sprite.
    rect(c,p.x+p.w/2-10,p.y+27,20,5,'#ef8253',2);rect(c,p.x+p.w/2-p.face*19,p.y+29,9,18,'#f5b455',2);label(c,'✦',p.x+p.w/2,p.y+49,15,'#ffe4a0');
  }
}
export function drawBarkoHUD(c,g,w){
  const b=g.main.boss;if(g.level.cave||!b||b.state==='waiting'||b.state==='defeated')return;
  rect(c,w/2-160,100,320,63,'#fff1d8ee',12);label(c,'CAPTAIN BARKO',w/2,121,16);
  for(let i=0;i<5;i++)rect(c,w/2-95+i*40,133,30,13,i<b.hp?'#db8863':'#d5d0c7',5);
  label(c,b.state==='dizzy'?'DIZZY! C or stomp now!':b.state==='chargeWarning'?'Charge incoming — jump!':b.state==='ballWarning'?'Tennis barrage incoming!':b.state==='slamWarning'?'Slam incoming — jump the wave!':'Watch his next move',w/2,184,18);
}
export function drawTerritoryEnding(c,g){
  if(!g.completed||g.levelId!==3)return;
  const x=g.main.goal+165,t=g.winTime;
  rect(c,x+110,180,100,410,'#b0b0c9');rect(c,x+132,218,55,90,'#697589',26);
  if(t>1&&t<4.6){oval(c,x+160,281,15,18,'#a37d88');oval(c,x+160,258,17,19,'#ddd6bb');c.fillStyle='#ddd6bb';c.beginPath();c.moveTo(x+143,254);c.lineTo(x+140,236);c.lineTo(x+152,245);c.lineTo(x+171,245);c.lineTo(x+181,236);c.lineTo(x+178,256);c.fill();c.fillStyle='#f7d06f';c.beginPath();c.moveTo(x+141,242);c.lineTo(x+138,224);c.lineTo(x+151,231);c.lineTo(x+160,217);c.lineTo(x+168,231);c.lineTo(x+181,224);c.lineTo(x+178,242);c.fill();oval(c,x+154,257,2,3,'#799d8e');oval(c,x+167,257,2,3,'#91b8d1')}
  if(t>4.6){for(let n=0;n<6;n++)line(c,x-37+n*14,465,x-37+n*14,590,'#73748c',6);oval(c,x+160,272,18,28,'#525970');oval(c,x+160,246,12,12,'#525970')}
  label(c,t<1.5?'A tower in the distance...':t<4.6?'Prince Xiaboo!':t<7.5?'Someone else is controlling the Cat Kingdom...':'The mystery deepens...',g.camera+g.viewWidth/2,340,25,'#374b62');
}
