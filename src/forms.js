// Future forms supply attacks without changing input or collision handling.
export const playerForms={
  normal:{attack:()=>({duration:.24,reach:40,damage:1})},
  super:{attack:()=>({duration:.32,reach:55,damage:3})},
  fire:{attack:()=>({duration:.4,reach:0,damage:1,projectile:true})},
};
export function currentPlayerForm(player){return playerForms[player.form]||playerForms[player.super?'super':'normal']}
