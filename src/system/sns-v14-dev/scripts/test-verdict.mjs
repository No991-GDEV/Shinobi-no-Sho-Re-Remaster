// Presentation of the outcome already resolved by SNS; never changes mechanics or damage.
export function testVerdict(result,natural,{critical=true,criticalAt=15}={}){
 if(!['passed','failed'].includes(result))return null;
 const success=result==='passed',special=critical&&Number.isInteger(natural)&&(success?natural>=criticalAt&&natural<=16:natural>=2&&natural<=3);
 return {key:success?(special?'critical-success':'success'):(special?'critical-failure':'failure'),label:success?(special?'Sucesso crítico':'Sucesso'):(special?'Falha crítica':'Falha')};
}
export function messageVerdict(message){
 const f=message.flags?.['sns-v14-dev']??{},die=message.rolls?.[0]?.dice?.[0];
 const natural=die?.faces===8&&die.results?.filter(r=>r.active!==false).length===2?die.results.filter(r=>r.active!==false).reduce((sum,r)=>sum+r.result,0):null;
 const direct=f.testOutcome??f.advancedTest??f.environmentTest;
 if(direct)return testVerdict(direct.result,natural,{critical:direct.critical!==false});
 const defense=f.defenseOutcome;if(defense)return testVerdict(defense.result??(defense.hit==='miss'?'passed':defense.hit==='hit'?'failed':'pending'),defense.natural??natural,{critical:defense.critical!==false});
 const attack=f.damageUse?.attack,targets=f.damageUse?.targets,results=f.defenseResults;
 if(attack&&targets?.length===1){const outcome=results?.[targets[0].uuid.replaceAll('.','~')];return testVerdict(outcome?.hit==='hit'?'passed':outcome?.hit==='miss'?'failed':'pending',attack.natural,{criticalAt:f.damageUse.profile?.criticalAt??15});}
 return null;
}
export function decorateTestVerdict(message,element){
 const verdict=messageVerdict(message),dice=element.querySelector('.dice-roll');if(!verdict||!dice)return;
 element.classList.add('sns-chat-message');element.querySelectorAll('.sns-save-verdict,.sns-test-verdict').forEach(e=>e.remove());
 const label=document.createElement('p');label.className='sns-test-verdict '+verdict.key;label.textContent=verdict.label;label.setAttribute('role','status');dice.before(label);
}
