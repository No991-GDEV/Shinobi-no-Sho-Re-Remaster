import {legadoState} from './legado-core.mjs';
export function fortuneFor(actor,spec,kind='test'){
 const row=legadoState(actor).active?.['bishamonten-fortune'];if(!row||spec.die!=='2d8')return null;
 return row.mode==='espiral'||row.mode==='ataque'&&kind==='attack'||row.mode==='defesa'&&kind==='defense'?row:null;
}
// Roll.fromData is Foundry's public reconstruction API. All three values are
// original dice; the player chooses which two are active, including low dice.
export function chooseFortuneData(data,selected){
 const copy=structuredClone(data),dice=copy.terms.find(t=>t.faces===8&&t.results?.length===3);
 if(!dice||!Array.isArray(selected)||selected.length!==2||new Set(selected).size!==2||selected.some(n=>!Number.isInteger(n)||n<0||n>2)||dice.results.some(r=>!Number.isInteger(r.result)||r.result<1||r.result>8))throw Error('Escolha dois dos três dados originais.');
 const before=dice.results.filter(r=>r.active!==false).reduce((n,r)=>n+r.result,0),after=selected.reduce((n,k)=>n+dice.results[k].result,0);
 dice.results=dice.results.map((r,k)=>({...r,active:selected.includes(k),discarded:!selected.includes(k)}));dice.modifiers=[];copy.total=data.total-before+after;copy.formula=copy.formula.replace('3d8kh2','3d8');return copy;
}
export async function rollWithLegado(actor,spec,{kind='test'}={}){
 const row=fortuneFor(actor,spec,kind);if(!row)return new foundry.dice.Roll(spec.formula).evaluate();
 const roll=await new foundry.dice.Roll(spec.formula.replace(/^2d8/,'3d8kh2')).evaluate(),values=roll.dice.find(d=>d.faces===8)?.results??[];
 const pairs=[[0,1],[0,2],[1,2]],best=pairs.toSorted((a,b)=>b.reduce((n,k)=>n+values[k].result,0)-a.reduce((n,k)=>n+values[k].result,0))[0];
 const selected=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Bishamonten · escolha dois dados'},content:'<p>'+values.map(r=>r.result).join(' · ')+'</p><label>Dados usados<select name="pair">'+pairs.map(p=>'<option value="'+p.join(',')+'" '+(p.join(',')===best.join(',')?'selected':'')+'>'+p.map(k=>values[k].result).join(' + ')+' = '+p.reduce((n,k)=>n+values[k].result,0)+'</option>').join('')+'</select></label>',ok:{label:'Usar estes dados',callback:(e,b)=>b.form.elements.pair.value.split(',').map(Number)}});
 const data=chooseFortuneData(roll.toJSON(),selected??best);data.options={...data.options,legadoFortune:{actorUuid:actor.uuid,mode:row.mode,kind,castUuid:row.castUuid}};return foundry.dice.Roll.fromData(data);
}
