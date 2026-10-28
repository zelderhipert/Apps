const test=require("node:test");
const assert=require("node:assert/strict");
const Images=require("../scryfall-images.js");
function card(name,set,number,faces=false){
 const image={small:"https://cards.scryfall.io/small/front/card.jpg",normal:"https://cards.scryfall.io/normal/front/card.jpg",large:"https://cards.scryfall.io/large/front/card.jpg"};
 return {object:"card",name,set,collector_number:number,scryfall_uri:"https://scryfall.com/card/"+set+"/"+number,artist:"Test Artist",image_uris:faces?undefined:image,
 card_faces:faces?[{image_uris:image},{image_uris:{normal:"https://cards.scryfall.io/normal/back/card.jpg"}}]:undefined};
}
const ok=c=>({ok:true,status:200,json:async()=>c});
test("print exata exige edição e número de colecionador",async()=>{
 const calls=[];const r=Images.createResolver({storage:null,intervalMs:0,fetcher:async url=>{calls.push(url);return ok(card("Drowned Catacomb","xl n".replace(" ",""),"42"));}});
 const x=await r.resolve({name:"Drowned Catacomb",set:"XLN",collector:"42"});
 assert.equal(x.kind,"exact");assert.equal(calls.length,1);
});
test("edição da LigaMagic mapeada para a sigla Scryfall, sem afirmar variante exata",async()=>{
 const urls=[];const r=Images.createResolver({storage:null,intervalMs:0,fetcher:async url=>{urls.push(url);return ok(card("Talisman of Dominance","mrd","209"));}});
 const x=await r.resolve({name:"Talisman of Dominance",set:"MI"});
 assert.equal(x.kind,"edition");assert.match(urls[0],/set=mrd/);
});
test("edição não reconhecida recua para imagem ilustrativa",async()=>{
 const urls=[];const r=Images.createResolver({storage:null,intervalMs:0,fetcher:async url=>{urls.push(url);return url.includes("set=")?{ok:false,status:404}:ok(card("Drowned Catacomb","m10","99"));}});
 const x=await r.resolve({name:"Drowned Catacomb",set:"UNKNOWN"});
 assert.equal(x.kind,"illustrative");assert.equal(urls.length,2);
});
test("cache evita consultas repetidas inclusive sem localStorage",async()=>{
 let requests=0;const r=Images.createResolver({storage:null,intervalMs:0,fetcher:async()=>{requests++;return ok(card("Culling the Weak","exo","1"));}});
 await r.resolve({name:"Culling the Weak"});await r.resolve({name:"Culling the Weak"});
 assert.equal(requests,1);
});
test("imagens de duas faces e bloqueio de host de imagem externo",()=>{
 assert.equal(Images.imageFaces(card("Test","abc","1",true)).length,2);
 assert.equal(Images.validImage("https://other.example/card.jpg"),null);
 assert.equal(Images.validImage("javascript:alert(1)"),null);
});
