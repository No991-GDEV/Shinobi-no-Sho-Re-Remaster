// D142 · preço em Ryo na aba Equipamentos do catálogo.
// Regra central: o preço é sempre o valor publicado em system.details.price —
// nunca derivado do nível, nunca convertido em zero quando ausente e nunca
// inventado. Zero explícito permanece zero; ausência/nulo vira "—".
// Números inválidos (NaN/Infinity) não são renderizados como preço.
const dash=v=>typeof v==='string'&&/^-{1,3}$|^—$|^$/.test(v.trim());
export function catalogPrice(row,tabId=''){
 if(tabId!=='equipment'||!row||row.builtin||row.documentName==='Actor')return {display:'',title:''};
 const details=row.ruleSystem?.details??{},raw=details.price;
 if(raw===null||raw===undefined||dash(raw))return {display:'—',title:'Preço não informado na publicação'};
 if(typeof raw==='number'){
  if(!Number.isFinite(raw))return {display:'—',title:'Preço inválido na publicação'};
  const lot=Number.isInteger(details.perCompartment)&&details.perCompartment>0?' · '+details.perCompartment+' unidades por compartimento':'';
  return {display:String(raw)+' Ryo',title:'Preço em Ryo'+lot};
 }
 const text=String(raw).trim(),n=Number(text);
 if(text!==''&&Number.isFinite(n)){
  const lot=Number.isInteger(details.perCompartment)&&details.perCompartment>0?' · '+details.perCompartment+' unidades por compartimento':'';
  return {display:String(n)+' Ryo',title:'Preço em Ryo'+lot};
 }
 // Textos variáveis (ex.: "10 Ryo por lote") são exibidos exatamente como
 // publicados, sem interpretação ou arredondamento.
 return {display:text,title:'Preço conforme a publicação'};
}
