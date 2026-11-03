// Native PARTS.scrollable preserves inner panels. The surrounding window content
// also needs its position retained when replacing a part briefly shrinks it.
export function SnsHandlebarsApplicationMixin(Base){
 return class extends foundry.applications.api.HandlebarsApplicationMixin(Base){
  async _replaceHTML(result,content,options){
   const top=content.scrollTop,left=content.scrollLeft;
   try{return await super._replaceHTML(result,content,options);}
   finally{if(content.isConnected){content.scrollTop=top;content.scrollLeft=left;}}
  }
 };
}

// scrollIntoView also scrolls ancestors. Autocomplete should move only its list.
export function revealListOption(list,option){
 if(!list||!option)return;
 const viewport=list.getBoundingClientRect(),row=option.getBoundingClientRect();
 if(row.top<viewport.top)list.scrollTop+=row.top-viewport.top;
 else if(row.bottom>viewport.bottom)list.scrollTop+=row.bottom-viewport.bottom;
}
