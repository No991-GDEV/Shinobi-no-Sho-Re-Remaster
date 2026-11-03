import {NPC_GENERATOR_WORKBOOK as BOOK} from '../data/npc-generator-workbook.mjs';
export const GENERATOR_SOURCE=BOOK.source;
export const GENERATOR_DIFFICULTIES=['TRIVIAL','FÁCIL','PADRÃO','DIFÍCIL','EXTREMO','DIFÍCIL PER.','EXTREMO PER.'];
export const GENERATOR_STYLES=['taijutsu','ninjutsu','genjutsu'];
export const GENERATOR_SIZES=['MINÚSCULO','DIMINUTO','MIÚDO','PEQUENO','MÉDIO','GRANDE','ENORME','IMENSO','COLOSSAL','INCRÍVEL'];
export function generatorOptions(input={}){
 const o={nc:4,difficulty:'PADRÃO',style:'ninjutsu',size:'MÉDIO',noCombatBonus:false,oneHp:false,...input};
 if(!Number.isInteger(o.nc)||o.nc<4||o.nc>20)throw Error('Escolha um NC de 4 a 20.');
 if(!GENERATOR_DIFFICULTIES.includes(o.difficulty)||!GENERATOR_STYLES.includes(o.style)||!GENERATOR_SIZES.includes(o.size))throw Error('Modelo de NPC inválido.');
 if(typeof o.noCombatBonus!=='boolean'||typeof o.oneHp!=='boolean')throw Error('Opção de capanga inválida.');
 return o;
}
// Closed, data-only interpreter for the workbook's nine functions. Nothing is executed as code.
export function generatorWorkbook(input={}){
 const o=generatorOptions(input),overrides={H4:o.nc,H8:o.difficulty,K35:o.size,G35:o.noCombatBonus,G36:o.oneHp},cache=new Map(),active=new Set();
 const num=v=>v===''||v===undefined?0:Number(v),flat=xs=>xs.flat(Infinity);
 function node(n){
  if(!Array.isArray(n))return n;
  const [kind,op,a,b]=n;
  if(kind==='r')return cell(op,a);
  if(kind==='v')return n.slice(1).map(node);
  if(kind==='u')return op==='-'?-num(node(a)):num(node(a));
  if(kind==='b'){
   let l=node(a),r=node(b);
   if(['=','<>','<','>','<=','>='].includes(op)){
    if(typeof l==='boolean'||typeof r==='boolean'){l=num(l);r=num(r);}
    else if(typeof l==='string'&&typeof r==='string'){l=l.toUpperCase();r=r.toUpperCase();}
    return {'=':()=>l===r,'<>':()=>l!==r,'<':()=>l<r,'>':()=>l>r,'<=':()=>l<=r,'>=':()=>l>=r}[op]();
   }
   l=num(l);r=num(r);if(op==='/'&&r===0)throw Error('Divisão por zero na planilha.');
   if(op==='+')return l+r;if(op==='-')return l-r;if(op==='*')return l*r;if(op==='/')return l/r;if(op==='^')return l**r;
  }
  if(kind==='f'){
   const args=n.slice(2);if(op==='IF')return node(node(args[0])?args[1]:args[2]);
   const values=args.map(node),numbers=flat(values).map(num);
   if(op==='MAX')return Math.max(...numbers);if(op==='MIN')return Math.min(...numbers);if(op==='SUM')return numbers.reduce((a,b)=>a+b,0);
   if(op==='INT')return Math.floor(numbers[0]);
   if(op==='ROUNDUP'||op==='ROUNDDOWN'){const [v,d]=numbers,scale=10**d;return Math.sign(v)*(op==='ROUNDUP'?Math.ceil(Math.abs(v)*scale):Math.floor(Math.abs(v)*scale))/scale;}
   if(op==='INDEX'){const index=values[1]-1;if(!Number.isInteger(index)||index<0||index>=values[0].length)throw Error('Índice inválido na planilha.');return values[0][index];}
   if(op==='MATCH'){if(values[2]!==0)throw Error('Busca não exata na planilha.');const norm=v=>typeof v==='string'?v.toUpperCase():v,index=values[1].findIndex(v=>norm(v)===norm(values[0]));if(index<0)throw Error('Valor não encontrado na planilha.');return index+1;}
  }
  throw Error('Fórmula não suportada na planilha.');
 }
 function cell(sheet,ref){
  const key=sheet+'!'+ref;if(cache.has(key))return cache.get(key);if(active.has(key))throw Error('Referência circular na planilha.');active.add(key);
  const value=sheet===0&&Object.hasOwn(overrides,ref)?overrides[ref]:node(BOOK.sheets[sheet]?.[ref]??'');cache.set(key,value);active.delete(key);
  if(typeof value==='number'&&!Number.isFinite(value))throw Error('Resultado numérico inválido na planilha.');return value;
 }
 return {options:o,cell};
}
export function generateNpcNumbers(input={}){
 const book=generatorWorkbook(input),o=book.options,style=GENERATOR_STYLES.indexOf(o.style),col=['C','G','K'][style],stat=['E','I','M'][style],param=['D','H','L'][style],label=['B','F','J'][style],v=ref=>book.cell(0,ref);
 const attributes=Object.fromEntries(['for','des','agi','per','int','vig','esp'].map((k,i)=>[k,v(col+(13+i))]));
 const stats=Object.fromEntries(['cc','cd','esq','lm'].map((k,i)=>[k,v(stat+(13+i))]));stats.initiative=v(param+21);stats.movement=v(param+22);
 const attacks=Array.from({length:6},(_,i)=>{const name=v(label+(27+i));return {name,base:v(param+(27+i)),key:/CC|GIRATÓRIO|AGRESSIVA/.test(name)?'cc':'cd'};}).filter(a=>a.name!==''&&Number.isFinite(a.base));
 return {options:o,attributes,stats,fixedDefense:v(stat+17),defenseKey:o.difficulty.endsWith('PER.')?'lm':'esq',vitality:v(stat+18),chakra:v(stat+19),dc:v(param+23),vigorDc:v(param+23)-2,meleeRange:v(param+24),rangedRange:v(param+25),attacks};
}
