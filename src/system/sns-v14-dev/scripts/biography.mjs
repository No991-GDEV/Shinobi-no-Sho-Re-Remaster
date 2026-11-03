import {escapeHtml} from './kernel.mjs';

export const BIOGRAPHY_FIELDS=['appearance','history','personality','allies','notes'];
// Old biographies are plain text. Preserve their line breaks and literal angle
// brackets when presenting them in the native rich text editor.
export function biographyMarkup(value=''){
 const text=String(value??'');
 if(!text.trim())return '';
 if(/<(?:p|div|h[1-6]|ul|ol|li|blockquote|figure|img|table|strong|em|b|i|a|br)(?:\s|\/?>)/i.test(text))return text;
 return '<p>'+escapeHtml(text).replace(/\r\n?|\n/g,'<br>')+'</p>';
}

// A sheet submit includes inactive editors too. Merely reading a legacy bio
// must not convert it, or overwrite another user's newer notes.
export function biographyFormChanges(data,baseline={},clean=value=>value){
 for(const key of BIOGRAPHY_FIELDS){
  const path='system.biography.'+key,nested=data.system?.biography;
  const flat=Object.hasOwn(data,path),present=flat||Object.hasOwn(nested??{},key);
  if(!present)continue;
  const value=flat?data[path]:nested[key];
  if(value===baseline[key]){delete data[path];if(nested)delete nested[key];}
  else if(flat)data[path]=clean(String(value??''));
  else nested[key]=clean(String(value??''));
 }
 return data;
}
