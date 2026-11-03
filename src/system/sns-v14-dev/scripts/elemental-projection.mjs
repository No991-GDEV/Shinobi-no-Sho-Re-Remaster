const binding=(id,conditionId,extra={})=>({id:'book_'+id,conditionId,trigger:'hit',recipient:'targets',scope:'all',degree:1,resistance:'',dcMode:'jutsu',dc:0,duration:'Até ser encerrado conforme a regra',note:'',source:'',...extra});
const turns=n=>({mode:'turns',turns:n,phase:'end',anchor:'recipient'});
// Source rules are evaluated against acquired evolution AND level actually used.
export function elementalProjection({effect:e,power:p,choices,usedLevel:n,variant='normal',data,formulas}){
 const id=e.id.split(':').at(-1),stages=choices.filter(c=>c.effectId===e.id&&c.stage<=n).map(c=>c.stage),stage=Math.max(e.min,...stages),bindings=[],problems=[];
 const dc=data.difficulty,source=e.source.id+' · '+e.source.pages;
 if(e.maxStage&&stage>e.maxStage)problems.push(e.name+' estágio '+stage+': a execução desta evolução ainda precisa de um teste anterior à defesa. Use um nível inferior ou resolução manual.');
 const profile={attackKind:e.attackKind,source,formula:formulas.damage};
 if(id==='coluna'&&stage>=10)profile.preDefense={key:'skill:prontidao',dc,condition:'debilitado'};
 if(id==='missil'){profile.maxTargets=1;profile.followups=stage>=10?4:stage>=8?2:1;}
 if(id==='ricochete'){profile.maxTargets=1+Math.floor(n/2);profile.ricochet=true;profile.ricochetBonus=stage>=9;data.target='Até'+profile.maxTargets+' criaturas distintas · ordem de marcação';}
 if(id==='descarga'){
  data.damage=String(Math.ceil(Number(data.damage)/2));formulas.damage='⌈('+formulas.damage+')/2⌉';
  data.area=variant==='projectile'?'':variant==='circle'?'Círculo':'Meia-esfera';data.target=variant==='projectile'?'Uma criatura':'Criaturas na área escolhida';
  if(variant==='projectile'){profile.attackKind='techniqueProjectile';profile.maxTargets=1;}
  bindings.push(binding('shock','sns:condition:atordoado',{trigger:'hitFailedResistance',resistance:'attribute:vig',dcMode:'fixed',dc:dc-(variant==='projectile'?2:3),requiresDamage:true,untilNextTurnEnd:true,duration:'Até o final do próximo turno do afetado',source,note:'Testar Vigor somente após perda de Vitalidade ou Vitalidade temporária. Absorção integral não aciona (decisão da mesa D127).'}));
 }
 if(id==='coluna'){data.target='Criaturas na área escolhida';data.area=stage>=7?'Mini-colunas de1m dentro de um cilindro':'Cilindro';}
 if(id==='onda-explosiva'){data.range='Pessoal · centro no usuário';data.area=variant.startsWith('circle')?'Círculo':'Meia-esfera';if(variant.startsWith('circle')){data.size*=2;formulas.size='Dobro do tamanho comum';}data.action=variant.endsWith('movimento')?'Padrão + Movimento':'Padrão';}
 if(id==='lanca'){profile.splitTargets=true;profile.ignoreHardness=stage>=6?2:1;profile.ignoreProneCover=stage>=6;profile.ignoreCover=stage>=6;if(stage>=9){profile.ignoreAllHardness=true;profile.preDefense={key:'skill:prontidao',dc,condition:'desprevenido'};}data.target='Uma ou mais criaturas · dividir DB';}
 if(['correnteza','onda-explosiva','projetar'].includes(id)){
  data.target=id==='projetar'?'Uma criatura':'Criaturas na área escolhida';
  if(id==='projetar'){data.range=String(Math.ceil(Number.parseFloat(data.range)/2))+' m';formulas.range='Metade do alcance comum';profile.maxTargets=1;if(stage>=7)profile.allowedDefenses=['dodge','anticipate'];}
  const note=id==='projetar'?(stage>=7?'Deslocar metade do tamanho comum do poder em linha reta, na direção escolhida.':'Deslocar em linha reta uma quantidade de metros até o GD causado, na direção escolhida.'):id==='correnteza'?'Empurre até o fim da distância; considere obstáculos e colisões.':'Empurre até o limite da área, respeitando a direção e os obstáculos.';
  const resistance={trigger:'hitFailedResistance',resistance:'attribute:vig',dcMode:'fixed',dc:dc-2,source,note};
  bindings.push(binding('push','sns:state:deslocamento-forcado',resistance));
  if(id==='onda-explosiva'&&stage>=8)bindings.push(binding('fall','sns:condition:caido',{...resistance,note:'Onda Explosiva8: Caído após falhar no Vigor.'}));
  if(id==='projetar'&&stage>=7)bindings.push(binding('fall','sns:condition:caido',{...resistance,criticalOnly:true,note:'Projetar7: Caído somente na falha crítica de Vigor.'}));
 }
 if(id==='tremor'){
  data.damage='Nenhum';data.target='Criaturas na área escolhida';data.size=stage>=4?data.size:2;data.area='Círculo · '+data.size+' m de diâmetro';
  profile.noDamage=true;
  bindings.push(binding('fall','sns:condition:caido',{trigger:'hitFailedResistance',resistance:'skill:acrobacia',dcMode:'fixed',dc,optionalResistance:true,source,note:'Acrobacia opcional exige ação de movimento. Sem gasto de movimento, fica Caído.'}));
 }
 if(id==='algemar'){
  data.damage='Nenhum';profile.noDamage=true;profile.maxTargets=stage>=10?3:1;data.target=stage>=10?'Até3 criaturas, a5m entre si':'Uma criatura';data.duration=stage>=8?'Sustentada':'Concentração';
  bindings.push(binding('restrain','sns:condition:impedido',{source,duration:data.duration,note:'Algemas · Dureza '+(data.difficulty-9)+' · FOR/Escapar Dif '+dc+'. Destruir ou se libertar: ação padrão.',...(stage>=10?{upgradeIfRepeated:'sns:condition:indefeso-ou-paralisado'}:{})}));
 }
 if(id==='cegante'){
  data.range=String(Math.ceil(Number.parseFloat(data.range)/2))+' m';formulas.range='Metade do alcance comum';profile.maxTargets=1;
  bindings.push(binding('vision',stage>=8?'sns:state:camuflagem-visual-total':'sns:state:camuflagem-visual-parcial',{source,duration:stage>=8?'5 turnos ou até limpar o rosto':'3 turnos ou até limpar o rosto',durationRule:turns(stage>=8?5:3),note:'Limpar: ação padrão sem teste ou movimento + FOR/DES Dif '+dc+'. Encerrar o efeito quando limpar.'}));
 }
 for(const b of bindings){b.source||=source;}
 return {problems,bindings,profile,stage,notes:e.notes};
}
