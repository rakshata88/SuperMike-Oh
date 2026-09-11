import {FLOOR} from './level.js';
export const KINGDOM_WIDTH=25200;
export function createKingdom(cave=false){
  const platforms=[],items=[],enemies=[],hazards=[],pipes=[],signs=[],decorations=[];
  const ground=(x,w)=>platforms.push({x,y:FLOOR,w,h:130,type:cave?'cave':'grass'});
  const ledge=(x,y,w=160,type='brick',extra={})=>platforms.push({x,y,w,h:28,type,...extra});
  const item=(x,y,type='coin')=>items.push({x,y,w:28,h:32,type,id:`k${cave?'c':'m'}-${items.length}`,taken:false});
  const coins=(x,y,n=5)=>{for(let i=0;i<n;i++)item(x+i*45,y-Math.sin(i/Math.max(1,n-1)*Math.PI)*22)};
  const block=(x,y,reward='coin')=>ledge(x,y,48,'mystery',{reward,id:`k${cave?'c':'m'}-block-${x}`});
  const pipe=(x,y=500,secret=false,exit=false)=>{platforms.push({x,y,w:90,h:FLOOR-y,type:'pipe'});pipes.push({x,y,w:90,secret,exit})};
  const cat=(x,type='soldier',min=x-90,max=x+90,y=FLOOR)=>{const h=type==='guard'?50:38;enemies.push({x,y:y-h,w:type==='guard'?55:43,h,vx:-55,vy:0,type,hp:type==='guard'?2:1,min,max,alive:true,timer:0,baseY:y-h,platformPatrol:true})};
  if(cave){
    ground(0,3000);ledge(400,480,250);ledge(800,390,240);ledge(1230,470,250);ledge(1720,380,240);ledge(2180,480,250);
    coins(350,530,8);coins(800,340,5);coins(1240,420,5);coins(1730,330,5);coins(2200,430,5);
    item(920,345,'power');item(1795,330,'life');item(2300,435,'bell');item(1330,425,'paw');block(650,430);block(1530,420,'power');
    pipe(90,500,false,true);pipe(2750,500,false,true);
    signs.push({x:470,y:260,text:'THE GOLDEN WHISKER VAULT'},{x:2550,y:380,text:'Stand still on the pipe to return'});
    return {width:3000,platforms,items,enemies,hazards,pipes,signs,decorations,cave:true,checkpoint:0,goal:Infinity};
  }
  const gaps=[[3350,110],[5850,120],[8400,130],[11000,140],[14500,145],[17600,155],[20500,160],[22700,170]];
  let start=0;for(const [x,w] of gaps){ground(start,x-start);start=x+w}ground(start,KINGDOM_WIDTH-start);
  signs.push({x:390,y:480,text:'THE CAT KINGDOM · Keep going, Mike!'},{x:1400,y:385,text:'C / F: a punch in every form'},{x:6500,y:360,text:'A golden bell. A little extra courage.'});
  coins(500,520,6);cat(1050);ledge(1300,470,210);item(1400,425,'power');block(1800,430);pipe(2200);cat(2600);coins(2800,520,6);
  ledge(3260,465,210,'moving',{axis:'x',range:70,speed:1,origin:3260});
  ledge(3800,480,230);ledge(4100,380,250);cat(4210,'fast',4110,4295,380);item(4180,325,'paw');coins(4620,520,6);cat(5000,'fast');
  ledge(5400,470,190,'breakable');block(5650,425,'power');ledge(5760,460,230,'moving',{axis:'x',range:65,speed:1,origin:5760});
  ledge(6370,465,270);item(6500,420,'bell');coins(6840,510,7);cat(7310,'fast');
  pipe(7800,480,true);decorations.push({x:7845,type:'secret'});signs.push({x:7740,y:350,text:'A quiet pipe hums. Stand and listen...'});
  ledge(8310,450,230,'moving',{axis:'y',range:45,speed:.9,origin:450});coins(8900,515,7);cat(9380);cat(9660,'fast');
  for(const x of [10100,16100,19300])hazards.push({x,y:210,w:34,h:38,type:'falling',originY:210,phase:'idle',timer:0,vy:0});
  signs.push({x:9990,y:380,text:'Shaking acorns? Watch their shadows.'});ledge(10370,470,180);block(10600,420,'bell');
  ledge(10910,455,240,'moving',{axis:'x',range:60,speed:1.1,origin:10910});coins(11600,520,7);item(12200,515,'power');
  signs.push({x:12400,y:455,text:'Halfway there. The kingdom remembers.'});
  pipe(13100,490);cat(13450,'fast');ledge(13750,465,210);ledge(14050,365,220);item(14120,320,'paw');
  ledge(14400,450,260,'moving',{axis:'x',range:70,speed:1,origin:14400});coins(15000,520,7);cat(15600);block(15800,420,'power');
  ledge(16450,470,230);ledge(16800,380,240);cat(16900,'fast',16810,16985,380);item(16880,335,'bell');
  ledge(17500,455,270,'moving',{axis:'y',range:40,speed:1,origin:17500});coins(18150,515,8);pipe(18700);cat(19000,'fast');
  ledge(19700,470,160,'breakable');block(19950,420,'power');ledge(20400,450,270,'moving',{axis:'x',range:65,speed:1.1,origin:20400});
  signs.push({x:21100,y:450,text:'Guard Cats! Two hits, or leap past.'});cat(21500,'guard');coins(21800,510,6);item(22200,515,'bell');
  ledge(22600,450,280,'moving',{axis:'x',range:60,speed:1,origin:22600});
  cat(23300,'guard',23180,23400);cat(23900,'guard',23790,24000);cat(24250,'guard',24150,24320);ledge(23570,470,220);coins(23600,420,4);
  signs.push({x:24400,y:390,text:'Beyond this gate... Prince Xiaboo?'});
  for(let x=1800;x<24800;x+=2100)decorations.push({x,type:'banner'});
  return {width:KINGDOM_WIDTH,platforms,items,enemies,hazards,pipes,signs,decorations,cave:false,checkpoint:12500,goal:24700};
}
