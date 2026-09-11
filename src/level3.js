import {FLOOR} from './level.js';

export const TERRITORY_WIDTH=27600;
export function createTerritory(cave=false){
  const platforms=[],items=[],enemies=[],hazards=[],pipes=[],signs=[],decorations=[];
  const ground=(x,w)=>platforms.push({x,y:FLOOR,w,h:130,type:'grass'});
  const ledge=(x,y,w=200,type='brick',extra={})=>platforms.push({x,y,w,h:28,type,...extra});
  const item=(x,y,type='coin')=>items.push({x,y,w:28,h:32,type,id:`d${cave?'c':'m'}-${items.length}`,taken:false});
  const coins=(x,y,n=6)=>{for(let i=0;i<n;i++)item(x+i*40,y-Math.sin(i/(n-1)*Math.PI)*20)};
  const block=(x,y,reward='coin',hidden=false)=>ledge(x,y,48,'mystery',{reward,hidden,id:`d${cave?'c':'m'}-block-${x}`});
  const dog=(x,type='patrol',y=FLOOR,min=x-100,max=x+100)=>{const h=type==='shield'?58:44;enemies.push({x,y:y-h,w:type==='shield'?54:46,h,type,faction:'dog',hp:1,vx:-72,vy:0,min,max,alive:true,timer:0,state:type==='sleepyDog'?'sleep':'idle',stateTime:0,face:-1,grounded:true})};
  const cat=(x,type='soldier',y=FLOOR)=>enemies.push({x,y:y-38,w:43,h:38,type,hp:1,vx:-55,vy:0,min:x-80,max:x+80,alive:true,timer:0,platformPatrol:true});
  const sign=(x,y,text)=>signs.push({x,y,text});
  if(cave){
    ground(0,3000);ledge(420,475,270);ledge(850,370,270);ledge(1300,465,270);ledge(1770,365,280);ledge(2200,470,250);
    coins(350,530,10);coins(850,320,7);coins(1300,415,7);coins(1770,315,7);coins(2200,420,6);
    item(960,325,'life');item(1880,320,'fire');item(2320,425,'paw');block(1560,425,'power',true);
    dog(710,'sleepyDog');dog(1660,'sleepyDog');dog(2530,'sleepyDog');
    pipes.push({x:2780,y:FLOOR,w:100,exit:true,door:true});decorations.push({x:2780,type:'doghouse'});
    sign(570,250,'SECRET DOG HOUSE');sign(570,280,'DOGS ONLY');sign(1830,245,'Shhh... absolutely no Mikes.');sign(2730,420,'Stand by the door to return');
    return {width:3000,platforms,items,enemies,hazards,pipes,signs,decorations,cave:true,checkpoint:0,goal:Infinity};
  }
  const gaps=[[3150,110],[5700,120],[8800,130],[11900,140],[15800,145],[18500,150],[21900,155]];
  let start=0;for(const [x,w] of gaps){ground(start,x-start);decorations.push({x,w,type:'moat'});start=x+w}ground(start,TERRITORY_WIDTH-start);
  sign(470,445,'DOG GUARD TERRITORY');sign(470,475,'A: Jump · B: Run · C: Attack');
  coins(560,520);dog(1120);ledge(1430,470,230);item(1520,425,'power');cat(2040);dog(2360);
  block(2750,430,'fire');sign(2780,340,'FIRE MIKE! C launches fireballs');ledge(3040,465,260,'moving',{axis:'x',origin:3040,range:50,speed:1});
  dog(3850,'charger');sign(3530,420,'See !? Jump, then strike!');ledge(4200,465,250);coins(4220,420);
  dog(4950,'bouncer');sign(4710,390,'Boing. Rest. Boing. Learn the beat.');ledge(5600,460,270,'fallingPlatform',{originY:460});
  ledge(6250,480,200,'breakable');block(6510,420,'power');dog(6900,'shield');sign(6630,350,'Shield: stomp or attack behind');cat(7410,'fast');
  dog(8090,'sleepyDog');sign(7800,420,'Zzz... walk softly. Running wakes him!');ledge(8680,450,300,'moving',{axis:'y',origin:450,range:35,speed:1});
  ledge(9250,460,280);dog(9390,'tennis',460,9390,9390);cat(9770);sign(9260,350,'Tennis practice! Dodge the balls');
  pipes.push({x:10450,y:FLOOR,w:110,secret:true,door:true});decorations.push({x:10450,type:'doghouse'});block(10390,440,'coin',true);
  sign(10470,390,'DOGS ONLY');coins(10700,520);ledge(11780,450,310,'moving',{axis:'x',origin:11780,range:45,speed:.85});
  for(const x of [12500,19500,22500]){hazards.push({x,y:320,w:42,h:42,type:'barrel',originX:x,originY:320,phase:'idle',timer:0,vy:0,vx:-115});decorations.push({x,type:'chute'})}
  sign(12250,405,'Barrels ahead: watch the chute!');item(13200,515,'power');coins(13500,515);
  sign(14000,445,'WATCH TOWER · Take the high road');
  // The tower blocks the ground route; wide steps climb it using jump alone.
  ledge(14300,480,250);ledge(14620,375,250,'moving',{axis:'y',origin:375,range:25,speed:.85});
  ledge(14900,275,250);ledge(15190,230,250,'suspended');platforms.push({x:15220,y:310,w:90,h:280,type:'towerWall'});
  ledge(15510,340,250,'fallingPlatform',{originY:340});ledge(15730,450,340,'moving',{axis:'x',origin:15730,range:35,speed:1});
  decorations.push({x:15260,type:'tower'});coins(14920,230);item(15280,185,'paw');
  dog(16650);cat(16960);ledge(17300,470,260);dog(17430,'tennis',470,17430,17430);block(17900,430,'fire');
  ledge(18380,455,320,'fallingPlatform',{originY:455});dog(19050,'charger');ledge(19920,465,260,'suspended');coins(19950,420);
  dog(20750,'shield');cat(21100,'fast');ledge(21780,460,320,'moving',{axis:'y',origin:460,range:30,speed:.9});dog(23100,'bouncer');
  item(23500,515,'paw');block(23800,430,'fire');item(24050,515,'life');
  sign(24180,355,'CAPTAIN BARKO');sign(24180,385,'Dodge the charge. Strike when dizzy!');
  const boss={x:25180,y:FLOOR-96,w:94,h:96,type:'barko',faction:'dog',hp:5,maxHp:5,vx:0,vy:0,min:24460,max:25800,alive:true,timer:0,state:'waiting',stateTime:0,face:-1,pattern:0,invuln:0};enemies.push(boss);
  decorations.push({x:25930,type:'gate'});sign(26500,430,'The inner castle... Xiaboo is close.');
  for(let x=1900;x<26600;x+=2300)decorations.push({x,type:'dogflag'});
  return {width:TERRITORY_WIDTH,platforms,items,enemies,hazards,pipes,signs,decorations,cave:false,checkpoint:13700,goal:27000,boss,arena:{left:24400,right:25930},gateOpen:false};
}
