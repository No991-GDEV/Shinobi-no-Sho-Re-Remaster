// Stored IDs remain compatible with existing text fields; unknown historical values are retained.
export const FIELD_CHOICES={featureRule:['Transplante de doujutsu · regra da mesa'],eyeStage:['Sharingan','Nidan Sharingan','Sandan Sharingan','Mangekyou Sharingan'],resourceRule:['Chakra bijū','Pontos de visão · Mangekyou original'],grantRule:['Elemento Natural: Katon'],weaponClass:['Leve','Mediana','Longa'],ccAttribute:['Padrão (Força)','Acuidade (Destreza)'],attackMode:['Corpo a corpo','À distância','Corpo a corpo e à distância'],action:['Padrão','Parcial','Movimento','Livre','Reação','Completa','Rodadas'],duration:['Instantânea','Concentração','Sustentada','Contínua','Permanente']};
export const GUIDED_FIELDS=['action','duration','range','target','chakraCost','damage','defenses','effect','powerId'];
export function editorField(field,value,guided){
 const values=FIELD_CHOICES[field.key];
 return {...field,value,readonly:guided&&GUIDED_FIELDS.includes(field.key),select:!!values,options:values?[{value:'',label:'Não informado',selected:!value},...values.map(v=>({value:v,label:v,selected:v===value})),...(value&&!values.includes(value)?[{value,label:value+' · registro legado',selected:true}]:[])]:[]};
}
