export function releaseUrls(config,baseUrl){
 const root=baseUrl??`https://github.com/${config.repository}/releases/download/${config.tag}`;
 return {
  root,
  systemManifest:baseUrl?`${root}/system.json`:`https://github.com/${config.repository}/releases/latest/download/system.json`,
  moduleManifest:baseUrl?`${root}/module.json`:`https://github.com/${config.repository}/releases/latest/download/module.json`,
  systemZip:`${root}/${config.systemId}-${config.version}.zip`,
  moduleZip:`${root}/${config.moduleId}-${config.version}.zip`
 };
}
export function releaseManifests(system,content,config,baseUrl){
 if(!/^[\w-]+\/[\w.-]+$/.test(config.repository)||config.tag!=='v'+config.version)throw Error('Configuração de release inválida.');
 const u=releaseUrls(config,baseUrl),url=`https://github.com/${config.repository}`;
 const shared={version:config.version,compatibility:{minimum:'14',verified:'14.367',maximum:'14'},authors:[{name:'No991-GDEV',url:'https://github.com/No991-GDEV'}],url,readme:url+'/blob/main/README.md',bugs:url+'/issues',changelog:url+'/releases'};
 const s={...system,...shared,title:'Naruto: Shinobi no Sho · Re-Remaster',description:'Sistema comunitário não oficial de Shinobi no Sho. Versão beta para Foundry VTT 14.',socket:true,manifest:u.systemManifest,download:u.systemZip,relationships:{...(system.relationships??{}),requires:[{id:config.moduleId,type:'module',manifest:u.moduleManifest,compatibility:{minimum:config.version,verified:config.version}}]}};
 const m={...content,...shared,title:'Shinobi no Sho · Compêndios',description:'Regras, equipamentos, jutsus e bestiário para o sistema SNS. Livros e homebrews identificados por fonte.',manifest:u.moduleManifest,download:u.moduleZip,relationships:{systems:[{id:config.systemId,type:'system',compatibility:{minimum:config.version,verified:config.version}}]},esmodules:[]};
 return {system:s,content:m,urls:u};
}
