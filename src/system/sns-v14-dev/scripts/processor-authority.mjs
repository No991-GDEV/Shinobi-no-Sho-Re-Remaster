// A User is not a client: several tabs can share the designated GM.
// Hold one browser-wide lock for this world, then announce that processor on
// Foundry's system socket. Followers never run document-mutating handlers.
const channel='system.sns-v14-dev', peers=new Map();
let installed=false,local=false,leader='',since=0,lastPulse=0,release,controller,generation=0;
function stop(){generation++;controller?.abort();const unlock=release;controller=undefined;release=undefined;local=false;leader='';unlock?.();}
const key=()=>String(game.socket?.id??'');
const eligible=()=>!!game.user?.isGM&&game.users.activeGM?.id===game.user.id;
const send=kind=>{if(game.socket?.connected)game.socket.emit(channel,{snsProcessor:1,kind,id:key(),user:game.user.id,world:game.world.id,leader});};
export function isProcessor(){
 if(!eligible())return false;
 // Pure document tests have no socket or browser. Production always does.
 if(!game.socket)return true;
 return local&&leader===key()&&game.socket.connected&&Date.now()-lastPulse<4500;
}
function pulse(){
 if(!eligible()||!local||!game.socket.connected){leader='';return;}
 const now=Date.now();
 if(lastPulse&&now-lastPulse>4500){leader='';since=now;}
 lastPulse=now;
 for(const [id,p]of peers)if(now-p.at>6000)peers.delete(id);
 if(leader!==key()&&!peers.has(leader))leader='';
 if(!leader&&now-since>900){leader=[key(),...peers.keys()].sort()[0];if(leader===key())Hooks.callAll('snsProcessorReady');}
 send(leader===key()?'leader':'hello');
}
export function installProcessorAuthority(){
 if(installed)return;installed=true;
 const connect=async()=>{
  stop();peers.clear();since=Date.now();lastPulse=0;
  if(!eligible())return;
  controller=new AbortController();
  const lease=generation;
  const hold=async()=>{if(lease!==generation||!eligible())return;local=true;since=Date.now();pulse();await new Promise(resolve=>{release=resolve;});if(lease===generation)local=false;};
  if(globalThis.navigator?.locks)void navigator.locks.request('sns-processor:'+game.world.id+':'+game.user.id,{signal:controller.signal},hold).catch(e=>{if(e.name!=='AbortError')console.error(e);});
  else void hold();
 };
 Hooks.once('ready',()=>{
  game.socket.on(channel,p=>{
   if(p?.snsProcessor!==1||p.world!==game.world.id||p.user!==game.users.activeGM?.id||p.id===key()||typeof p.id!=='string'||p.id.length>100)return;
   if(p.kind==='bye'){peers.delete(p.id);if(leader===p.id){leader='';since=Date.now();}return;}
   peers.set(p.id,{at:Date.now()});
   if(p.kind==='leader'){
    if(leader===key()&&p.id<key()){leader=p.id;}
    else if(leader!==key())leader=p.id;
   }
   if(local&&p.kind==='hello'&&leader===key())send('leader');
  });
  game.socket.on('disconnect',stop);
  game.socket.on('connect',connect);
  void connect();setInterval(pulse,1000);
  globalThis.addEventListener?.('pagehide',()=>{send('bye');stop();});
 });
 Hooks.on('updateUser',()=>{if(!eligible())stop();else if(!controller)void connect();});
}
