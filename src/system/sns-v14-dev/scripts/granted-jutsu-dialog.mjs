import {isGrantSource,resolveGrantedJutsu} from './granted-jutsus.mjs';
import {escapeHtml} from './kernel.mjs';
import {fixedJutsuSpec} from './aptitude-jutsus.mjs';
async function configureFixed(actor,source,item,spec){
 const clone=spec.id==='sns:jutsu:kage-bunshin';
 const result=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Configurar '+spec.name},content:'<p>Por <strong>'+escapeHtml(source.name)+'</strong></p><label>Nome do jutsu<input name="name" value="'+escapeHtml(item?.name??spec.name)+'"></label>'+(clone?'<label>Clones por uso<select name="quantity"><option value="1">1 clone · 1 chakra</option><option value="2" '+(item?.system.jutsu.variant==='2'?'selected':'')+'>2 clones · 2 chakra</option></select></label>':'')+'<p>'+escapeHtml(spec.notes)+'</p><small>Básico4.1b · p.'+spec.pages+'</small>',ok:{label:item?'Salvar jutsu':'Criar jutsu',callback:(e,b)=>({name:b.form.elements.name.value.trim(),variant:clone?b.form.elements.quantity.value:'normal'})}});
 if(!result||!actor.isOwner||source.actor!==actor)return;
 const system={category:'techniques',jutsu:{effectId:spec.id,grantSourceId:source.id,usedLevel:1,variant:result.variant,selectionId:'',overrides:[]},details:{powerId:''},source:{id:'F01',edition:'Básico4.1b',pages:spec.pages},description:'<p>'+escapeHtml(spec.notes)+'</p>'};
 const r=resolveGrantedJutsu(actor,{system});if(!result.name||!r.valid)return ui.notifications.warn(r.problems.join(' ')||'Informe um nome.');
 Object.assign(system.details,r.data);delete system.details.test;system.traits=r.traits;
 if(item?.actor===actor)await item.update({name:result.name,'system.jutsu':system.jutsu,'system.details':{...item.system.toObject().details,...system.details}});
 else await actor.createEmbeddedDocuments('Item',[{name:result.name,type:'jutsu',system}]);
}
export async function configureGrantedJutsu(actor,source,item=null){
 if(!actor.isOwner||!isGrantSource(source)||source.actor!==actor)return;
 const fixed=fixedJutsuSpec(source);if(fixed)return configureFixed(actor,source,item,fixed);
 const powers=actor.items.filter(i=>i.system.power?.definitionId==='sns:power:katon');
 const selected=item?.system.details.powerId??(powers.length===1?powers[0].id:'');
 const content='<p>Concedido por <strong>'+escapeHtml(source.name)+'</strong> · Básico p.180–181. Esta técnica não ocupa uma escolha comprada de Katon.</p><label>Nome do jutsu<input name="name" value="'+escapeHtml(item?.name??'Katon: Gōkakyū no Jutsu')+'" required></label><label>Katon possuído<select name="power"><option value="">Sem poder comprado</option>'+powers.map(p=>'<option value="'+p.id+'" '+(p.id===selected?'selected':'')+'>'+escapeHtml(p.name)+' · nível '+p.system.level+'</option>').join('')+'</select></label><label>Nível usado<input name="level" type="number" min="4" step="1" value="'+(item?.system.jutsu.usedLevel??4)+'"></label><p>Sem Katon4: Sopro4, DB = ESP+2, chakra = ⌈ESP/2⌉. A partir de Katon4, usa as regras comuns e evoluções concedidas 7/10, sem ocupar escolhas.</p>';
 const value=await foundry.applications.api.DialogV2.prompt({classes:['sns-editor-dialog'],window:{title:'Jutsu concedido por aptidão'},position:{width:500},content,ok:{label:item?'Salvar técnica concedida':'Criar técnica concedida',callback:(e,b)=>{const f=b.form.elements;return {name:f.name.value.trim(),level:Number(f.level.value),powerId:f.power.value};}}});
 if(!value||!actor.isOwner||source.actor!==actor)return;
 const system={category:'techniques',jutsu:{effectId:'sns:effect:sopro-destrutivo',grantSourceId:source.id,selectionId:'',usedLevel:value.level,variant:'normal',overrides:[]},details:{powerId:value.powerId}};
 const r=resolveGrantedJutsu(actor,{system});if(!value.name||!r.valid)return ui.notifications.warn(r.problems.join(' ')||'Informe um nome.');
 for(const key of ['action','range','target','duration','chakraCost','damage','defenses'])system.details[key]=r.data[key];
 system.traits=r.traits;system.source={id:'F01 · Elemento Natural: Katon',edition:'Básico4.1b',pages:'101; 180–181'};
 system.description='<p>Concedido por '+escapeHtml(source.name)+'. Não ocupa escolhas compradas de Katon. '+escapeHtml(r.effect.notes)+'</p>';
 if(item&&item.actor===actor)await item.update({name:value.name,'system.jutsu':system.jutsu,'system.details':{...item.system.toObject().details,...system.details},'system.traits':system.traits,'system.source':system.source});
 else await actor.createEmbeddedDocuments('Item',[{name:value.name,type:'jutsu',system}]);
}
