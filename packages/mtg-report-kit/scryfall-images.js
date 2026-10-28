/* MTGverse card imagery: lookups only (name, set, collector number); never uploads stock data. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.MTGCardImages=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const prefix="mtgverse-art-v1:",day=86400000;
const norm=s=>String(s||"").normalize("NFKC").trim().toLowerCase();
// LigaMagic uses historical short edition codes that differ from Scryfall.
const ligaAliases={mi:"mrd",lw:"lrw",ex:"exo",sh:"sth",mt:"mor",wbmb2:"mb2",jpsoa:"sta"};
const setCode=s=>{
 const raw=String(s||"").trim().toLowerCase();
 return /^[a-z0-9]{2,8}$/.test(raw)?(ligaAliases[raw]||raw):"";
};
const collectorCode=s=>/^[a-z0-9*\-★]{1,24}$/i.test(String(s||"").trim())?String(s).trim():"";
function validImage(raw){try{const u=new URL(raw);return u.protocol==="https:"&&(u.hostname==="scryfall.io"||u.hostname.endsWith(".scryfall.io"))?u.href:null;}catch{return null;}}
function imageFaces(card){
 const pick=f=>f?.image_uris?{small:validImage(f.image_uris.small),normal:validImage(f.image_uris.normal),large:validImage(f.image_uris.large)}:null;
 const faces=(Array.isArray(card.card_faces)?card.card_faces:[]).map(pick).filter(x=>x?.normal||x?.small);
 const one=pick(card);
 return faces.length?faces:(one?[one]:[]);
}
function normalizeCard(card,kind){
 if(!card||card.object!=="card")return null;
 const faces=imageFaces(card);if(!faces.length)return null;
 return {kind,faces,image:faces[0].normal||faces[0].small,set:String(card.set||"").toLowerCase(),
 collector_number:String(card.collector_number||""),name:String(card.name||""),
 artist:String(card.artist||card.card_faces?.[0]?.artist||""),
 page:/^https:\/\/scryfall\.com\//.test(card.scryfall_uri||"")?card.scryfall_uri:null};
}
function createResolver(options={}){
 const fetcher=options.fetcher||((...a)=>fetch(...a));
 const storage=options.storage===undefined?(()=>{try{return localStorage;}catch{return null;}})():options.storage;
 const now=options.now||(()=>Date.now()),gap=Math.max(0,options.intervalMs??350);
 const memory=new Map();let serial=Promise.resolve(),last=0,blockedUntil=0;
 const key=(name,set,num)=>prefix+JSON.stringify([norm(name),setCode(set),collectorCode(num)]);
 function fromStorage(k){
  try{const v=storage?.getItem(k);if(!v)return undefined;const saved=JSON.parse(v);if(saved.expires<=now()){storage.removeItem(k);return undefined;}return saved.value;}catch{return undefined;}
 }
 function toStorage(k,value){
  try{if(!storage)return;let keys=[];for(let i=0;i<storage.length;i++){const x=storage.key(i);if(x?.startsWith(prefix))keys.push(x);}
   if(keys.length>=400&&!storage.getItem(k))storage.removeItem(keys[0]);
   storage.setItem(k,JSON.stringify({expires:now()+(value?7*day:day),value}));
  }catch{}
 }
 async function request(path){
  const op=serial.then(async()=>{
   if(now()<blockedUntil)return {blocked:true};
   const wait=Math.max(0,last+gap-now());if(wait)await new Promise(r=>setTimeout(r,wait));
   if(now()<blockedUntil)return {blocked:true};last=now();
   try{
    const r=await fetcher("https://api.scryfall.com"+path,{headers:{Accept:"application/json"},credentials:"omit",mode:"cors"});
    if(r.status===429){blockedUntil=now()+30000;return {blocked:true};}
    if(r.status===404||r.status===422)return {missing:true};
    if(!r.ok)return {blocked:true};
    return {card:await r.json()};
   }catch{return {blocked:true};}
  });serial=op.then(()=>{},()=>{});return op;
 }
 function cached(k,call){
  const hit=fromStorage(k);if(hit!==undefined)return Promise.resolve(hit);
  if(memory.has(k))return memory.get(k);
  const p=call().then(x=>{if(x===undefined){memory.delete(k);return x;}
   toStorage(k,x);if(memory.size>400)memory.delete(memory.keys().next().value);return x;
  }).catch(err=>{memory.delete(k);throw err;});
  memory.set(k,p);return p;
 }
 async function named(name,set){
  const q=new URLSearchParams({exact:name});if(set)q.set("set",set);
  const response=await request("/cards/named?"+q.toString());
  if(response.blocked)return undefined;return response.card||null;
 }
 async function generic(name){
  if(!String(name||"").trim())return null;
  return cached(key(name,"",""),async()=>{const c=await named(name,"");return c===undefined?undefined:normalizeCard(c,"illustrative");});
 }
 async function edition(name,set){
  const code=setCode(set);if(!code)return null;
  return cached(key(name,code,""),async()=>{const c=await named(name,code);if(c===undefined)return undefined;
   return c&&norm(c.set)===code?normalizeCard(c,"edition"):null;});
 }
 async function exact(name,set,num){
  const code=setCode(set),n=collectorCode(num);if(!code||!n)return null;
  return cached(key(name,code,n),async()=>{
   const r=await request("/cards/"+encodeURIComponent(code)+"/"+encodeURIComponent(n));
   if(r.blocked)return undefined;const c=r.card;if(!c)return null;
   if(norm(c.set)!==code||norm(c.collector_number)!==norm(n)||
      (norm(c.name)!==norm(name)&&norm(c.printed_name)!==norm(name)))return null;
   return normalizeCard(c,"exact");
  });
 }
 async function resolve({name,set="",collector=""}={}){
  if(!String(name||"").trim())return null;
  if(setCode(set)&&collectorCode(collector)){const x=await exact(name,set,collector);if(x)return x;}
  if(setCode(set)){const x=await edition(name,set);if(x)return x;}
  return generic(name);
 }
 return {resolve,generic,edition,exact};
}
return {createResolver,validImage,imageFaces,setCode,collectorCode};
});
