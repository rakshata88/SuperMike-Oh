import {FLOOR} from './level.js';

export const CASTLE_WIDTH=30600;
export function shadowEnemy(x,type,y=FLOOR,min=x-110,max=x+110){
  const h=type==='royalDog'?60:type==='mouse'?28:42,w=type==='royalDog'?56:44;
  return {x,y:y-h,w,h,type,faction:'shadow',hp:type==='royalDog'?3:type==='knight'?2:1,maxHp:type==='royalDog'?3:type==='knight'?2:1,vx:-55,vy:0,min,max,homeX:x,homeY:y-h,face:-1,alive:true,grounded:true,timer:0,state:'patrol',stateTime:1.6,invuln:0};
}
export function createCastle(cave=false){
  const platforms=[],items=[],enemies=[],hazards=[],pipes=[],signs=[],decorations=[],mechanisms=[];
  const ground=(x,w)=>platforms.push({x,y:FLOOR,w,h:130,type:'castleStone'});
  const ledge=(x,y,w=240,type='castleStone',extra={})=>{const s={x,y,w,h:28,type,...extra};platforms.push(s);return s};
  const item=(x,y,type='coin')=>items.push({x,y,w:28,h:32,type,id:`s4${cave?'a':'h'}-${items.length}`,taken:false});
  const coins=(x,y,n=6)=>{for(let i=0;i<n;i++)item(x+i*39,y-Math.sin(i/(n-1)*Math.PI)*18)};
  const block=(x,y,reward='coin',hidden=false)=>ledge(x,y,48,'mystery',{reward,hidden,id:`s4${cave?'a':'h'}-block-${x}`});
  const enemy=(x,type,y=FLOOR,min=x-110,max=x+110)=>{const e=shadowEnemy(x,type,y,min,max);enemies.push(e);return e};
  const sign=(x,y,text)=>signs.push({x,y,text});
  const moving=(x,y,w,extra={})=>ledge(x,y,w,'moving',{axis:'x',origin:x,range:45,speed:.8,...(extra.skin==='shelf'?{h:FLOOR-y}:{}),...extra});
  const chandelier=(x,y=535)=>hazards.push({x,y,w:86,h:30,type:'chandelier',anchorX:x+43,anchorY:110,length:y-110,phase:0});
  if(cave){
    ground(0,3300);ledge(420,480,290);ledge(840,380,290);ledge(1280,470,280);ledge(1720,365,290);ledge(2190,470,300);ledge(2630,380,280);
    for(const [x,y,n] of [[340,530,10],[840,330,7],[1280,420,7],[1720,315,7],[2190,420,7],[2630,330,6]])coins(x,y,n);
    item(510,515,'royalMap');item(970,335,'life');item(1840,320,'fire');item(2320,425,'relic');item(2750,335,'paw');block(1470,400,'thunder',true);
    const ghost=enemy(740,'ghost',FLOOR-15);ghost.state='sleep';ghost.harmless=true;
    pipes.push({x:3110,y:FLOOR,w:110,door:true,exit:true,archive:true});
    sign(700,240,'ROYAL ARCHIVES — KEEP OUT');sign(700,275,'Even the ghosts are on a book break.');sign(3090,420,'Pause at the wall pipe to return');
    decorations.push({x:2320,type:'treasure'},{x:3110,type:'wallPipe'});
    return {width:3300,platforms,items,enemies,hazards,pipes,signs,decorations,mechanisms,cave:true,checkpoint:0,goal:Infinity,region:'archives'};
  }
  const gaps=[[3550,120],[6050,140],[13300,140],[17200,150],[21850,155],[25000,150]];
  let start=0;for(const [x,w] of gaps){ground(start,x-start);start=x+w}ground(start,CASTLE_WIDTH-start);
  // Cracked drawbridges sit over real gaps; their visible shake precedes collapse.
  for(const x of [6050,13300,25000])ledge(x,FLOOR,140,'fallingPlatform',{originY:FLOOR,castle:true});
  sign(510,440,'THE SHADOW CASTLE');sign(510,470,'Find Prince Xiaboo!');coins(650,520);enemy(1180,'bat',430);
  ledge(1510,480);item(1620,435,'power');block(2080,430,'fire');enemy(2640,'knight');sign(2380,365,'Knight Cat: wait for the shield to lower');
  moving(3430,465,330);chandelier(4070);sign(3870,455,'Swinging lights: wait, then jump');enemy(4760,'mouse');coins(5150,520);
  sign(5770,425,'Cracked floor? Keep moving!');enemy(6720,'royalDog');ledge(7030,470,280);coins(7070,425);
  enemy(7790,'ghost',540);sign(7520,375,'Ghost Cats freeze when you face them');enemy(8560,'cannon');sign(8270,420,'Soft balls. Big bounce. Jump!');
  // The library spans approximately one third of the course.
  sign(9540,430,'THE CASTLE LIBRARY');moving(9800,480,300,{skin:'shelf',range:50});moving(10200,380,310,{skin:'shelf',range:40});ledge(10650,285,300);item(10760,240,'paw');
  block(9600,430,'thunder');sign(9710,340,'THUNDER MIKE · C powers blue switches');
  pipes.push({x:11200,y:FLOOR,w:110,door:true,secret:true,archive:true,revealed:false});decorations.push({x:11200,type:'secretShelf'});block(11150,440,'coin',true);
  sign(11180,390,'One bookshelf has a curious spark...');item(11700,515,'royalMap');sign(11730,425,'A royal map lies open...');
  enemy(12460,'knight');coins(12830,520);chandelier(13780,535);item(14100,515,'power');
  sign(14500,445,'CHECKPOINT · The highest tower awaits');
  // Thunder opens a timed treasure alcove; the main floor remains passable.
  mechanisms.push({x:15140,y:510,w:42,h:58,type:'electric',timer:0,duration:9});
  moving(15300,475,270,{axis:'y',origin:475,range:85,speed:.8,powered:true});ledge(15680,295,330);coins(15690,245,8);item(15820,245,'life');
  block(14900,430,'thunder');sign(15120,410,'C + lightning: power the bonus lift');enemy(16400,'mouse');moving(17070,460,340,{axis:'y',origin:460,range:30});
  sign(18060,435,'THE CLOCK TOWER');
  // Wide landings and shallow gear orbits keep every ascent reachable without Run.
  ledge(18300,480,290);ledge(18660,380,280,'gear',{cx:18800,cy:394,radius:18,speed:.65,phase:0});ledge(19010,280,290);
  ledge(19360,235,290,'gear',{cx:19505,cy:249,radius:16,speed:.6,phase:Math.PI});ledge(19710,220,330);
  platforms.push({x:19730,y:300,w:90,h:290,type:'castleStone'});item(19850,175,'paw');decorations.push({x:19800,type:'clock'});
  // Bats are over fixed platforms, separated from the gear transfers.
  enemy(20050,'bat',355,20000,20240);ledge(20120,340,290);ledge(20470,450,290);enemy(20980,'knight');
  moving(21700,460,360,{axis:'y',origin:460,range:25});enemy(22550,'mouse');enemy(23230,'ghost',540);
  // A wall pipe opens a short, optional underground treasury.
  pipes.push({x:23750,y:490,w:90,secret:true,archive:true});platforms.push({x:23750,y:490,w:90,h:100,type:'pipe'});decorations.push({x:23795,type:'wallPipe'});
  sign(23720,380,'Royal tunnels: pause on the wall pipe');block(24150,430,'fire');enemy(24610,'cannon');
  // Selected familiar guards, with ample space between encounters.
  enemies.push({x:25660,y:FLOOR-38,w:43,h:38,type:'soldier',hp:1,vx:-55,vy:0,min:25580,max:25740,alive:true,timer:0,platformPatrol:true});
  enemies.push({x:26050,y:FLOOR-44,w:46,h:44,type:'patrol',faction:'dog',hp:1,vx:-78,vy:0,min:25970,max:26130,alive:true,timer:0,state:'idle',stateTime:0,face:-1,grounded:true});
  enemy(26600,'royalDog');ledge(26900,475,270);coins(26920,430);item(27300,515,'power');
  sign(27920,435,'FINAL CHECKPOINT!');block(28100,430,'fire');block(28300,430,'thunder');
  sign(28600,370,'THE HIGHEST CHAMBER');sign(28600,405,'Prince Xiaboo is just ahead...');
  const boss={...shadowEnemy(29500,'whiskeron'),y:FLOOR-96,w:90,h:96,hp:7,maxHp:7,min:28900,max:29900,homeX:29500,homeY:FLOOR-96,state:'waiting',stateTime:0,pattern:0};enemies.push(boss);
  return {width:CASTLE_WIDTH,platforms,items,enemies,hazards,pipes,signs,decorations,mechanisms,cave:false,checkpoints:[14500,27800],checkpoint:14500,goal:30100,boss,arena:{left:28800,right:30150},gateOpen:false,regions:[{x:0,name:'Hidden Passage'},{x:9200,name:'Castle Library'},{x:14500,name:'Treasure Gallery'},{x:17900,name:'Clock Tower'},{x:23500,name:'Royal Tunnels'},{x:27800,name:'Highest Chamber'}]};
}
