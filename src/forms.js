// Future forms supply attacks without changing input or collision handling.
export const playerForms={
  normal:{attack:()=>({duration:.24,reach:40,damage:1})},
  super:{attack:()=>({duration:.32,reach:55,damage:3})},
  fire:{attack:()=>({duration:.4,reach:0,damage:1,projectile:true})},
  dash:{attack:g=>g.player.running&&Math.abs(g.player.vx)>=340?{duration:.85,active:.18,reach:70,damage:3,dash:true}:{duration:.32,reach:55,damage:3}},
  thunder:{attack:()=>({duration:.65,active:.2,reach:112,damage:2,electric:true})},
};
export function currentPlayerForm(player){return playerForms[player.form]||playerForms[player.super?'super':'normal']}
