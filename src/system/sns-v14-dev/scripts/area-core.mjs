import {POWER_DEFINITIONS} from '../data/power-definitions.mjs';
const norm=s=>String(s??'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
const plain=s=>norm(s).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const positive=n=>Number.isFinite(n)&&n>0?n:null;
const numeric=s=>Number(String(s).replace(',','.'));
export function areaHeaders(html){const out={};for(const m of String(html??'').matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)){const text=m[1].replace(/<[^>]*>/g,' ').replace(/^[\s❖•▪]+/,'').trim(),i=text.indexOf(':');if(i>0&&i<35)out[norm(text.slice(0,i))]??=text.slice(i+1).trim();}return out;}
export const areaRuleId=item=>item.system?.jutsu?.effectId||item.system?.contentId||item.flags?.['sns-v14-dev']?.canonicalTextSource?.id||'';
export function jutsuAreas(item,projection={},context={}){
 const actor=item.actor,system=item.system??{},id=areaRuleId(item),key=id.split(':').at(-1),headers=areaHeaders(system.description),body=plain(system.description),declared=headers['area de efeito']??'',data=projection.data??{},n=context.usedLevel??projection.usedLevel??system.jutsu?.usedLevel??1;
 const power=actor?.items?.get?.(system.details?.powerId),definition=POWER_DEFINITIONS.find(p=>p.id===(power?.system.power?.definitionId||projection.power?.id||('sns:power:'+projection.environment?.element))),esp=actor?.system.attributes?.esp,int=actor?.system.attributes?.int;
 let common=positive(context.commonSize)??(definition&&Number.isFinite(esp)?Math.ceil(definition.sizeFactor*esp):null),range=positive(context.commonRange)??(definition&&Number.isFinite(esp)?definition.rangeBase+definition.rangeFactor*esp:null);
 const stage=projection.environment?.stage??Math.max(1,...(power?.system.power?.choices??[]).filter(c=>c.effectId===id&&c.stage<=n).map(c=>c.stage)),variant=system.jutsu?.variant??'normal';
 // A projectile's physical size is not an area of effect. The selected variant
 // must remain a projectile even when its book entry also describes an area.
 if(key==='descarga'&&variant==='projectile')return null;
 if(!declared&&!data.area&&!['mina-explosiva','cortina-de-poeira','chakra-no-souin'].includes(key))return null;
 const text=plain(declared||data.area),choices=[];
 const add=(shape,label,dimensions={},extra={})=>{const c={id:String(choices.length),shape,label,...dimensions,count:1,origin:'point',...extra};c.missing=[];if(!['circle','cone','line','rectangle'].includes(shape))c.missing.push('shape');for(const field of shape==='circle'?['diameter']:shape==='cone'||shape==='line'||shape==='rectangle'?['length','width']:['length'])if(!positive(c[field]))c.missing.push(field);choices.push(c);return c;};
 const circle=(label,diameter,extra={})=>add('circle',label,{diameter:positive(diameter)},extra),cone=(length,label='Cone')=>add('cone',label,{length:positive(length),width:positive(length)},{origin:'caster'}),line=(length,width=1,label='Linha')=>add('line',label,{length:positive(length),width:positive(width)},{origin:'caster'});
 common??=positive(data.size);range??=positive(Number.parseFloat(data.range));
 let measured=common;
 // Explicit formulas override common parameters. Never treat unknown sizes as
 // a 1 m default; the placement dialog asks for the absent measurement.
 const fixed=text.match(/(?:diametro|raio)\s*(?:de\s*)?(\d+(?:[.,]\d+)?)\s*m/)??text.match(/(\d+(?:[.,]\d+)?)\s*m\s*de diametro/),perInt=text.match(/(\d+(?:[.,]\d+)?)\s*m\s*por\s*(?:nivel\s*(?:de|do atributo)?\s*)?inteligencia/),perEsp=text.match(/(\d+(?:[.,]\d+)?)\s*m\s*(?:de diametro\s*)?por\s*(?:nivel\s*(?:de|do atributo)?\s*)?espirito/),perLevel=text.match(/(\d+(?:[.,]\d+)?)\s*m\s*(?:de diametro\s*)?por\s*nivel\s*(?:usado\s*)?do poder/);
 if(fixed&&!/por\s*nivel|por\s*espirito|por\s*inteligencia/.test(text))measured=numeric(fixed[1]);
 if(perInt)measured=Number.isFinite(int)?numeric(perInt[1])*int:null;
 if(perEsp)measured=Number.isFinite(esp)?numeric(perEsp[1])*esp:null;
 if(perLevel)measured=numeric(perLevel[1])*n;
 if(/dobro/.test(text)&&measured!==null)measured*=2;
 if(/triplo|3x comum/.test(text)&&measured!==null)measured*=3;
 if(/raio comum/.test(text))measured=common===null?null:2*common;
 if(key==='chakra-no-souin')circle('Selo de chakra · superfície imóvel',Number.isFinite(int)?int:null,{note:'Diâmetro de 1 m × INT. Exclui a mesma assinatura de chakra; a drenagem por turno é conferida na ficha.'});
 else if(key==='mina-explosiva')circle('Explosão da mina',5);
 else if(key==='onda-explosiva'){
  if(projection.valid){circle(variant.startsWith('circle')?'Círculo':'Meia-esfera',positive(data.size)??(common===null?null:common*(variant.startsWith('circle')?2:1)),{origin:'caster'});}
  else{circle('Meia-esfera',common,{origin:'caster'});circle('Círculo · dobro do diâmetro',common===null?null:common*2,{origin:'caster'});}
 }
 else if(key==='tremor')circle('Tremor',positive(data.size)??(stage>=4?common:2));
 else if(['nevoa','kumo-soukei','hb-f05-nevoa-abissal'].includes(key))circle('Névoa',Number.isFinite(esp)?30+3*esp:null,{origin:'caster',height:common});
 else if(key==='interferencia'){const skill=actor?.system.skillLevels?.lidar_com_animais??actor?.system.skillLevels?.lidarComAnimais??actor?.system.skillLevels?.['lidar-com-animais']??actor?.system.skills?.lidarComAnimais?.bought;circle('Interferência',Number.isFinite(skill)?30+3*skill:null,{origin:'caster',height:common});}
 else if(key==='rasengan-elemental')circle('Explosão após o acerto',20,{origin:'target',note:'Raio de 10 m; o alvo direto tem resolução própria.'});
 else if(key==='kajousatsu')circle('Esfera de vapor',0.5,{count:stage>=6?Math.max(1,Math.floor(n/2)):1,note:'Representação espacial; não aplica dano por entrada automaticamente.'});
 else if(key==='cortina-de-poeira')circle('Cortina de poeira',common);
 else if(key==='gensou-no-in')add('', 'Volume da ilusão',{length:Number.isFinite(int)?int:null},{note:'A forma da ilusão é livre. Escolha a projeção que representa o objeto criado.'});
 else if(key==='akumu-no-kyuin'){if(Number.isFinite(esp))cone(10+esp,'Cone · Espírito');if(Number.isFinite(int))cone(10+int,'Cone · Inteligência');if(!choices.length)cone(null);}
 else if(/parede/.test(text))line(Number.isFinite(int)?int*0.5:null,null,'Parede · informar espessura');
 else if(/onda/.test(text))line(measured,measured,'Onda');
 else if(/cone/.test(text))cone(measured);
 else if(/circulo|esfera|cilindro|diametro/.test(text)){
  const count=/seis|\b6\s*(?:esferas|circulos)/.test(text)?6:1;
  circle(/cilindro/.test(text)?'Cilindro':/meia.esfera/.test(text)?'Meia-esfera':/esfera/.test(text)?'Esfera':'Círculo',measured,{count,...(/cilindro/.test(text)?{height:common}:{}),...(/pessoal/.test(plain(headers.alcance))?{origin:'caster'}:{})});
 }
 else if(/linha/.test(text))line(measured);
 else add('', 'Área · escolher formato',{length:/comum|padrao/.test(text)?positive(projection.environment?.size)??measured:null},{note:'O livro não fixa o formato; escolha a representação no mapa.'});
 if(key==='nuvem'&&projection.environment?.size)choices[0].diameter=projection.environment.size;
 if(key==='desastre')for(const c of choices)c.note='Tamanho triplo do poder. Formato e limites conferidos na cena; não usa nível como parâmetro de tamanho.';
 // Recompute missing fields after precise executor dimensions were applied.
 for(const c of choices)c.missing=[...(!['circle','cone','line','rectangle'].includes(c.shape)?['shape']:[]),...(c.shape==='circle'?['diameter']:c.shape?['length','width']:['length']).filter(k=>!positive(c[k]))];
 return {version:1,name:item.name,actorUuid:actor?.uuid??'',itemUuid:item.uuid??'',usedLevel:n,source:system.source??{},rule:declared||data.area,range,choices};
}
export function transformationAreas(actor,plan){
 const {id}=plan.grant,n=plan.usedLevel,variant=plan.variant;
 let choice;if(id==='wave')choice={shape:'circle',label:'Onda de Chakra',diameter:2*n,origin:'caster'};
 if(id==='shot')choice={shape:'circle',label:'Explosão do Disparo',diameter:2*n,origin:'target'};
 if(id==='bomb')choice=variant==='cylinder'?{shape:'line',label:'Disparo em cilindro',length:15+6*n,width:5,origin:'caster'}:{shape:'circle',label:'Bijuudama em esfera',diameter:6*n,origin:'target'};
 if(id==='boil')choice={shape:'circle',label:'Ebulição',diameter:2,origin:'caster'};
 return choice?{version:1,name:plan.grant.name,actorUuid:actor.uuid,itemUuid:plan.profile.source.uuid,usedLevel:n,source:{id:plan.grant.sourcePages},choices:[{id:'0',count:1,missing:[],...choice}]}:null;
}
export function regionShape(choice,{pixelsPerUnit=1,units='m',x=0,y=0,direction=0}={}){
 const factor=/^(?:ft|feet|foot|pes|pés)$/i.test(units)?3.280839895:1,k=pixelsPerUnit*factor;
 const checked=fields=>{for(const f of fields)if(!positive(choice[f]))throw Error('Informe '+f+' da área.');};
 if(choice.shape==='circle'){checked(['diameter']);return {type:'circle',x,y,radius:choice.diameter*k/2,gridBased:false};}
 if(choice.shape==='cone'){checked(['length','width']);return {type:'cone',x,y,radius:choice.length*k,angle:2*Math.atan(choice.width/(2*choice.length))*180/Math.PI,rotation:direction,curvature:'flat',gridBased:false};}
 if(choice.shape==='line'){checked(['length','width']);return {type:'line',x,y,length:choice.length*k,width:choice.width*k,rotation:direction,gridBased:false};}
 if(choice.shape==='rectangle'){checked(['length','width']);return {type:'rectangle',x,y,width:choice.length*k,height:choice.width*k,anchorX:0,anchorY:0.5,rotation:direction,gridBased:false};}
 throw Error('Escolha o formato da área.');
}
