/* MTGverse card-art presentation, reusable and independent of stock-check data. */
(function(){
"use strict";
const library=window.MTGCardImages, resolver=library?.createResolver();
if(!resolver)return;
const byId=id=>document.getElementById(id);
let observer=null,lastArt=null,faceIndex=0;
function hydrate(el){
 if(el._artRequest)return el._artRequest;
 const {artName:name,artSet:set,artCollector:collector}=el.dataset;
 el.setAttribute("aria-busy","true");
 el._artRequest=resolver.resolve({name,set,collector}).then(card=>{
  if(!el.isConnected)return card;
  el.setAttribute("aria-busy","false");
  el._cardArt=card;
  if(!card?.image){el.title="Imagem indisponível — Scryfall";el.classList.add("artMissing");return null;}
  const img=document.createElement("img");
  img.src=card.faces[0].small||card.image;img.alt="Carta "+name;
  img.loading="lazy";img.decoding="async";
  img.addEventListener("error",()=>{img.remove();el.title="Falha ao carregar imagem";});
  el.replaceChildren(img);
  el.title=card.kind==="exact"?"Impressão identificada":
    card.kind==="edition"?"Arte da edição (variante não verificada)":"Imagem ilustrativa";
  return card;
 }).catch(()=>{el.setAttribute("aria-busy","false");el.title="Não foi possível consultar o Scryfall";return null;});
 return el._artRequest;
}
function watch(){
 const nodes=document.querySelectorAll(".cardArt:not([data-art-watched])");
 if(!observer&&typeof IntersectionObserver!=="undefined")
  observer=new IntersectionObserver(entries=>{
   for(const e of entries)if(e.isIntersecting){observer.unobserve(e.target);hydrate(e.target);}
  },{rootMargin:"180px"});
 for(const el of nodes){
  el.dataset.artWatched="1";
  if(observer)observer.observe(el);else hydrate(el);
 }
}
function face(){
 if(!lastArt)return;
 const f=lastArt.faces[faceIndex]||lastArt.faces[0];
 const img=byId("artLarge");
 img.src=f.large||f.normal||f.small||lastArt.image;
 img.alt=lastArt.name+" — face "+(faceIndex+1);
 byId("artFaceLabel").textContent=lastArt.faces.length>1?"Face "+(faceIndex+1)+" de "+lastArt.faces.length:"";
 byId("artPrev").hidden=lastArt.faces.length<2;
 byId("artNext").hidden=lastArt.faces.length<2;
}
function modal(card,name){
 if(!card?.image)return;
 lastArt=card;faceIndex=0;
 byId("artTitle").textContent=name||card.name;
 byId("artQuality").textContent=card.kind==="exact"?"Impressão identificada (edição + número de colecionador)":
  card.kind==="edition"?"Arte da edição; variante, idioma e acabamento não confirmados":
  "Imagem ilustrativa; a impressão mostrada pode ser diferente";
 byId("artMeta").textContent=[card.set?.toUpperCase(),card.collector_number,card.artist?"Arte: "+card.artist:""].filter(Boolean).join(" · ");
 const source=byId("artSource");source.hidden=!card.page;if(card.page)source.href=card.page;
 face();
 const dlg=byId("artDialog");if(typeof dlg.showModal==="function"&&!dlg.open)dlg.showModal();else dlg.hidden=false;
}
document.addEventListener("click",async event=>{
 const node=event.target?.closest?.(".cardArt");if(!node)return;
 event.preventDefault();event.stopPropagation();
 const card=await hydrate(node);
 if(card)modal(card,node.dataset.artName);
});
byId("artClose").addEventListener("click",()=>{
 const dlg=byId("artDialog");if(typeof dlg.close==="function")dlg.close();else dlg.hidden=true;
});
byId("artPrev").addEventListener("click",()=>{if(lastArt){faceIndex=(faceIndex+lastArt.faces.length-1)%lastArt.faces.length;face();}});
byId("artNext").addEventListener("click",()=>{if(lastArt){faceIndex=(faceIndex+1)%lastArt.faces.length;face();}});
if(typeof MutationObserver!=="undefined"){
 const changes=new MutationObserver(watch);
 changes.observe(byId("dashboard"),{childList:true,subtree:true});
}
watch();
})();
