// Read-only display of the accepted defense; no second roll or damage decision.
export function attackDefenseRows(packet,results={}){
 if(!packet?.targets?.length)return [];
 return packet.targets.map(target=>{const r=results[target.uuid.replaceAll('.','~')];if(!r)return {name:target.name,pending:true,verdict:'Aguardando defesa',test:'',choice:''};const defense=r.roll??r.defense??r.fixed;return {name:target.name,pending:r.hit==='pending',hit:r.hit==='hit',verdict:r.stopped?'Não atingido':r.hit==='hit'?'Acertou':r.hit==='miss'?'Defendeu':'Desempate',choice:r.choice??'',test:defense?Number.isInteger(defense.natural)?'2d8 ('+defense.natural+') '+(defense.precision>=0?'+ ':'− ')+Math.abs(defense.precision)+' = '+defense.total:'Defesa '+defense.total:''};});
}
