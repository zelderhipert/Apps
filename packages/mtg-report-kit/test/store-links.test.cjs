const test=require("node:test");const assert=require("node:assert/strict");
const S=require("../store-links.js");
test("Taberna: domínio e ID informados pelo usuário",()=>{
 const item=S.build({store:"Taberna Geek",card:"Hexhaven Invigorator"});
 assert.ok(item?.hostVerified);const url=new URL(item.url);
 assert.equal(url.hostname,"www.tabernageek.com.br");
 assert.equal(url.searchParams.get("view"),"ecom/itens");
 assert.equal(url.searchParams.get("id"),"41369");
 assert.equal(url.searchParams.get("busca"),"Hexhaven Invigorator");
 assert.equal(url.searchParams.get("txt_estoque"),"1");
});
test("busca Unicode e pontuação codificadas",()=>{
 const u=new URL(S.build({store:"Fênix Geek House (Nova Venécia)",card:"Éowyn // Queen & Tide"}).url);
 assert.equal(u.searchParams.get("busca"),"Éowyn // Queen & Tide");
 assert.equal(u.searchParams.get("id"),"45754");
});
test("IDs conhecidos não aceitam sobreposição de loja divergente",()=>{
 assert.equal(S.build({store:"Taberna Geek",card:"Drowned Catacomb",storeId:"49834"}),null);
 assert.equal(S.build({store:"Qualquer loja",card:"Drowned Catacomb"}),null);
});
test("Magos confirmada pelo shopping.json como 621302",()=>{
 const url=new URL(S.build({store:"Magos",card:"Culling the Weak"}).url);
 assert.equal(url.searchParams.get("id"),"621302");
 assert.equal(S.build({store:"Magos",card:"Culling the Weak",storeId:"777777"}),null);
});
test("sem nome ou ID inválido não produz URL",()=>{
 assert.equal(S.build({store:"Taberna Geek",card:""}),null);
 assert.equal(S.build({store:"Magos",card:"X",storeId:"abc"}),null);
});
