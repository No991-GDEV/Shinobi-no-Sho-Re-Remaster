// Livro Básico 4.1b, PDF 212. Two distinct benefits, or damage twice.
export const HIBON_BONUSES=Object.freeze([
 {id:'damage2',label:'Dano +2',damageBonus:2,hardnessBonus:0,difficultyBonus:0},
 {id:'damage-hardness',label:'Dano +1 e dureza +2',damageBonus:1,hardnessBonus:2,difficultyBonus:0},
 {id:'damage-difficulty',label:'Dano +1 e dificuldade +1',damageBonus:1,hardnessBonus:0,difficultyBonus:1},
 {id:'hardness-difficulty',label:'Dureza +2 e dificuldade +1',damageBonus:0,hardnessBonus:2,difficultyBonus:1}
]);
export function hibonBonuses(item){return item?.system?.contentId==='sns:power:hibon-ninpou'&&item.system.choice?.kind==='hibonBonuses'?HIBON_BONUSES.find(b=>b.id===item.system.choice.key)??null:null;}
