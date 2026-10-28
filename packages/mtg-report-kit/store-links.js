/* LigaMagic card pages and storefront search links.
 * Storefront URLs are card-name searches, never exact-print order links.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.MTGStoreLinks=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim().replace(/\s+/g," ");
const STORES={
 "taberna geek":{id:"41369",host:"www.tabernageek.com.br"},
 "magos":{id:"621302",host:"www.magosdacosta.com.br"},
 "magos da costa":{id:"621302",host:"www.magosdacosta.com.br"},
 "vila geek":{id:"49834",host:"www.vilageekgames.com.br"},
 "vila geek vila velha":{id:"49834",host:"www.vilageekgames.com.br"},
 "black game house":{id:"611044",host:"www.blackgamehouse.com.br"},
 "fenix geek house":{id:"45754",host:"www.fenixhousetcg.com.br"},
 "fenix geek house (nova venecia)":{id:"45754",host:"www.fenixhousetcg.com.br"}
 // All five storefront domains were supplied by the user.
};
function safeName(value){const s=String(value||"").trim();return s&&s.length<=250?s:null;}
function build({store,card,storeId}={}){
 const name=safeName(card),record=STORES[norm(store)];
 if(!name||!record)return null;
 if(storeId&&String(storeId).trim()!==record.id)return null;
 const params=new URLSearchParams([
  ["view","ecom/itens"],["page","1"],["id",record.id],["comdesconto",""],
  ["busca",name],["txt_filtro_multiestoque",""],["txt_order","1"],
  ["txt_limit","30"],["txt_estoque","1"],["btFiltrar","Filtrar"]
 ]);
 return {url:"https://"+record.host+"/?"+params.toString(),
  label:"Buscar na loja ↗",hostVerified:true,storeId:record.id};
}
function cardPage(card){
 const name=safeName(card);
 if(!name)return null;
 // For double-faced split names, LigaMagic normally indexes the front face.
 const face=name.split(" // ",1)[0];
 const params=new URLSearchParams([["view","cards/card"],["card",face]]);
 return "https://www.ligamagic.com.br/?"+params.toString();
}
return {build,cardPage,normalizeStore:norm};
});
