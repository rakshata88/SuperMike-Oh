import {FLOOR} from './level.js';

export const ESCAPE_WIDTH=34600;
export const ESCAPE_SECTIONS=[{x:0,end:6200,id:'forest',name:'Forest Escape'},{x:6200,end:10800,id:'river',name:'River Crossing'},{x:10800,end:21100,id:'train',name:'Moving Train'},{x:21100,end:28500,id:'mountain',name:'Mountain Route'},{x:28500,end:ESCAPE_WIDTH,id:'airship',name:'Airship Launch Platform'}];
export function escapeSection(x){return ESCAPE_SECTIONS.find(s=>x<s.end)||ESCAPE_SECTIONS.at(-1)}
export function chaseEnemy(x,type,y=FLOOR,min=x-130,max=x+130){
  const w=type==='goat'||type==='trainDog'?52:44,h=type==='hedgehog'||type==='fish'?34:46;
  return {id:`s5-${type}-${x}`,x,y:y-h,w,h,type,faction:'chase',hp:1,maxHp:1,min,max,homeX:x,homeY:y-h,face:-1,vx:0,vy:0,grounded:true,alive:true,state:'patrol',stateTime:1.2,timer:0,invuln:0};
}
export function createEscape(room=false){
  if(room===true)room='den';
  const platforms=[],items=[],enemies=[],hazards=[],pipes=[],signs=[],decorations=[],winds=[];
  const ground=(x,w,y=FLOOR,skin='forest')=>platforms.push({x,y,w,h:720-y,type:'escapeGround',skin});
  const ledge=(x,y,w=240,skin='wood',extra={})=>{const s={x,y,w,h:26,type:'escapePlatform',skin,...extra};platforms.push(s);return s};
  const item=(x,y,type='coin')=>items.push({x,y,w:28,h:32,type,id:`s5-${room||'main'}-${items.length}`,taken:false});
  const coins=(x,y,n=6)=>{for(let i=0;i<n;i++)item(x+i*38,y-Math.sin(i/(n-1)*Math.PI)*18)};
  const block=(x,y,reward='coin',hidden=false)=>ledge(x,y,48,'wood',{type:'mystery',reward,hidden,id:`s5-${room||'main'}-block-${x}`});
  const moving=(x,y,w=260,skin='log',extra={})=>ledge(x,y,w,skin,{type:'moving',axis:'y',origin:y,range:18,speed:.8,...extra});
  const foe=(x,type,y=FLOOR,min=x-130,max=x+130)=>{const e=chaseEnemy(x,type,y,min,max);enemies.push(e);return e};
  const sign=(x,y,text)=>signs.push({x,y,text});
  const pipe=(x,y=490,target='den',exit=false)=>{platforms.push({x,y,w:90,h:FLOOR-y,type:'pipe'});pipes.push({x,y,w:90,secret:!exit,exit,target})};
  const crate=(x,y,secret=false)=>ledge(x,y,58,'crate',{h:58,weak:true,secretCrate:secret,id:`s5-crate-${x}`});
  if(room){
    const cargo=room==='cargo';ground(0,2900,FLOOR,cargo?'cargo':'den');ledge(430,480,280);ledge(830,380,280);ledge(1260,470,280);ledge(1690,370,280);ledge(2130,465,290);
    for(const [x,y,n] of [[340,530,9],[830,330,7],[1260,420,7],[1690,320,7],[2130,415,7]])coins(x,y,n);
    item(970,335,'life');item(1830,325,cargo?'thunder':'fire');item(2250,420,cargo?'cargoSeal':'denToken');block(1510,425,'dash',true);
    if(!cargo){item(1380,425,'paw');const fox=foe(720,'fox');fox.state='sleep';fox.harmless=true}
    pipe(2690,490,'',true);sign(730,235,cargo?'ROYAL CARGO — DO NOT OPEN':'DEFINITELY NO TREASURE HERE');sign(730,275,cargo?'Someone packed a LOT of coins.':'FOX TREASURE DEN');sign(2580,400,'Pause on the pipe to return');
    return {width:2900,platforms,items,enemies,hazards,pipes,signs,decorations,winds,cave:true,roomId:room,checkpoint:0,goal:Infinity};
  }
  // Forest: introduce new enemies separately before combining encounters.
  ground(0,3200);ground(3340,2860);ledge(3120,480,330,'bridge');sign(500,430,'THE GREAT ESCAPE');sign(500,466,'Chase Lord Whiskeron!');coins(600,520);
  foe(1180,'fox');ledge(1510,480,270);item(1640,435,'power');block(2040,430,'fire');ledge(2410,475,290);foe(2550,'monkey',475,2550,2550);
  sign(2510,350,'Boomerangs come back. Watch twice!');foe(3650,'hedgehog');sign(3420,390,'Curled up? Jump and wait for it to rest');moving(4010,470,280,'branch');coins(4050,425);
  hazards.push({x:4680,y:330,w:58,h:42,type:'escapeLog',originX:4680,originY:330,phase:'idle',timer:0,vy:0,vx:-115});decorations.push({x:4680,type:'logChute'});
  sign(4410,420,'Logs ahead! Watch the chute');pipe(5250);block(5650,425,'dash');sign(5730,350,'DASH MIKE · Hold B, then C!');foe(5950,'fox');
  // River: wide decks separated by <=110 units, with small vertical bobbing.
  sign(6160,405,'THE CONVOY CROSSED THE RIVER');hazards.push({x:6200,y:675,w:4130,h:80,type:'deepWater'});
  const decks=[];for(let i=0;i<10;i++){const x=6200+i*410,y=[550,495,510,470,515][i%5];const d=i%3===2?ledge(x,y,310,'rock'):moving(x,y,310,i%2?'boat':'log');decks.push(d);coins(x+50,y-48,5)}
  for(const i of [2,6]){const d=decks[i],duck=foe(d.x+140,'duck',d.y,d.x+20,d.x+d.w-60);duck.support=d;duck.deck=d}
  for(const x of [6990,8220,9450]){const f=foe(x,'fish',685,x,x);f.state='submerged';f.stateTime=1.8;f.hidden=true;f.waterY=685}
  decorations.push({x:8090,type:'waterwheel'},{x:10080,type:'waterfall'});ground(10300,830);item(10480,515,'power');sign(10600,420,'CHECKPOINT · What is that whistle?');
  // Train roofs are solid; scenery moves faster while Mike keeps the same physics.
  ledge(11010,500,270,'boarding');
  const cars=[];for(let i=0;i<11;i++){const x=11200+i*860,y=i===4?535:450;const car=ledge(x,y,770,'trainRoof',{car:i});cars.push(car);decorations.push({x,y,w:770,type:'trainCar',car:i});if(i!==4)coins(x+160,y-50,7)}
  hazards.push({x:11130,y:710,w:9410,h:65,type:'tracks'});
  foe(11640,'trainDog',450,11300,11820);crate(12120,392);block(12540,325,'dash');foe(12990,'raccoon',450,12930,13550);
  foe(13780,'monkey',450,13780,13780);ledge(14080,350,200,'cargo');
  // Low tunnel: a lower car gives both Normal and Super Mike ample standing clearance.
  platforms.push({x:14670,y:170,w:770,h:240,type:'tunnelCeiling',skin:'rock'});sign(14520,315,'LOW TUNNEL · Take the lower car');
  ledge(15300,495,230,'boarding');ledge(15540,470,230,'boarding');
  const cargoDoor={x:16180,y:450,w:100,door:true,secret:true,chase:true,target:'cargo',returnX:16400,revealed:false};pipes.push(cargoDoor);crate(16180,392,true);block(16110,320,'coin',true);sign(16120,275,'A suspicious cargo crate...');
  foe(16720,'trainDog',450,16590,16970);hazards.push({x:17680,y:404,w:58,h:46,type:'slidingCargo',originX:17680,originY:404,phase:'idle',timer:0,vx:-100});sign(17040,315,'Cargo shifts after the warning!');
  crate(17800,392);foe(18280,'raccoon',450,18140,18840);block(19100,325,'thunder');item(19200,405,'paw');foe(19480,'hedgehog',450,19300,19620);
  // Jump onto the station platform before the rear train cars disconnect.
  ledge(20580,485,270,'boarding');ground(20780,1750);sign(20930,370,'Lord Whiskeron is getting away!');block(21330,425,'dash');
  // Mountain: platforms, bridges and mild, clearly marked wind zones.
  ground(22660,1690);ground(24490,1760);ground(26390,ESCAPE_WIDTH-26390,FLOOR,'mountain');
  ledge(22440,485,350,'bridge');ledge(24170,480,410,'bridge');moving(26100,480,380,'stone',{range:20});
  ledge(21650,480,270,'stone');foe(21770,'goat',480,21670,21880);foe(23200,'eagle',335,23030,23350);coins(23280,520);
  winds.push({x:22100,w:1400,dir:1,strength:30,period:5},{x:25400,w:1200,dir:-1,strength:28,period:5.5});decorations.push({x:22480,type:'waterfall'},{x:25360,type:'waterfall'});
  pipe(23900,490,'den');foe(24900,'goat');ledge(25170,475,290,'stone');item(25260,430,'fire');foe(26700,'eagle',340,26500,26850);ledge(26970,480,280,'stone');ledge(27320,380,290,'stone');item(27450,335,'paw');
  sign(28200,435,'FINAL CHECKPOINT!');item(28300,515,'power');
  // Launch towers use steps, never climbing controls.
  sign(28800,400,'AIRSHIP LAUNCH PLATFORM');ledge(28970,480,280,'towerDeck');ledge(29330,380,280,'towerDeck');moving(29690,300,300,'lift',{range:18});ledge(30050,260,320,'towerDeck');
  platforms.push({x:30140,y:335,w:80,h:255,type:'escapeGround',skin:'wood'});ledge(30470,375,270,'towerDeck');ledge(30780,475,300,'towerDeck');
  block(31150,425,'dash');block(31350,425,'fire');block(31550,425,'thunder');
  // Familiar guards bridge the factions without crowding new encounters.
  enemies.push({x:3070,y:FLOOR-44,w:46,h:44,type:'patrol',faction:'dog',hp:1,vx:-72,vy:0,min:2880,max:3140,alive:true,timer:0,state:'idle',stateTime:0,face:-1,grounded:true});
  enemies.push({x:22850,y:FLOOR-58,w:54,h:58,type:'shield',faction:'dog',hp:1,vx:-36,vy:0,min:22760,max:23020,alive:true,timer:0,state:'idle',stateTime:0,face:-1,grounded:true});
  enemies.push({x:27760,y:FLOOR-38,w:43,h:38,type:'soldier',hp:1,vx:-55,vy:0,min:27690,max:27830,alive:true,timer:0,platformPatrol:true});
  const boss={...chaseEnemy(32800,'howl'),y:FLOOR-90,w:94,h:90,hp:8,maxHp:8,min:31870,max:33160,homeX:32800,homeY:FLOOR-90,state:'waiting',stateTime:0,pattern:0};enemies.push(boss);
  decorations.push({x:33600,type:'airship'},{x:29550,type:'launchTower'},{x:30300,type:'launchTower'});ledge(33410,500,460,'landing');
  return {width:ESCAPE_WIDTH,platforms,items,enemies,hazards,pipes,signs,decorations,winds,cave:false,checkpoints:[10600,28100],checkpoint:10600,goal:34000,boss,arena:{left:31800,right:33300},gateOpen:false,sections:ESCAPE_SECTIONS};
}
