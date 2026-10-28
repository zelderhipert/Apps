/* Search links for the specific card in a LigaMagic-powered store catalogue.
   Storefront URLs are search results, NOT a verified individual printing/listing. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.MTGStoreLinks=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim().replace(/\s+/g," ");
const STORES={
 "taberna geek":{id:"41369",host:"www.tabernageek.com.br",verifiedHost:true},
 "magos":{id:"621302",host:"www.ligamagic.com.br",verifiedHost:false},
 "magos da costa":{id:"621302",host:"www.ligamagic.com.br",verifiedHost:false},
 "vila geek":{id:"49834",host:"www.ligamagic.com.br",verifiedHost:false},
 "vila geek vila velha":{id:"49834",host:"www.ligamagic.com.br",verifiedHost:false},
 "black game house":{id:"611044",host:"www.ligamagic.com.br",verifiedHost:false},
 "fenix geek house":{id:"45754",host:"www.ligamagic.com.br",verifiedHost:false},
 "fenix geek house (nova venecia)":{id:"45754",host:"www.ligamagic.com.br",verifiedHost:false}
};
function build({store,card,storeId}={}){
 const name=String(card||"").trim();
 if(!name||name.length>250)return null;
 const record=STORES[norm(store)];
 // Magos is unverified; only use an actual ID observed in the authorized shopping snapshot.
 const id=record?.id||(/magos/.test(norm(store))&&/^\d{2,10}$/.test(String(storeId||""))?String(storeId):null);
 if(!id)return null;
 if(record&&storeId&&String(storeId).trim()!==id)return null;
 const host=record?.host||"www.ligamagic.com.br";
 const params=new URLSearchParams([
  ["view","ecom/itens"],["page","1"],["id",id],["comdesconto",""],
  ["busca",name],["txt_filtro_multiestoque",""],["txt_order","1"],
  ["txt_limit","30"],["txt_estoque","1"],["btFiltrar","Filtrar"]
 ]);
 return {url:"https://"+host+"/?"+params.toString(),
  label:record?.verifiedHost?"Buscar na loja ↗":"Buscar na loja (LigaMagic) ↗",
  hostVerified:Boolean(record?.verifiedHost),storeId:id};
}
return {build,normalizeStore:norm};
});
