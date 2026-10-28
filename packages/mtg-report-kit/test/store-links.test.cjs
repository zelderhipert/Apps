const test=require("node:test");
const assert=require("node:assert/strict");
const S=require("../store-links.js");
const domains=[
 ["Taberna Geek","www.tabernageek.com.br","41369"],
 ["Magos","www.magosdacosta.com.br","621302"],
 ["Vila Geek Vila Velha","www.vilageekgames.com.br","49834"],
 ["Black Game House","www.blackgamehouse.com.br","611044"],
 ["Fênix Geek House (Nova Venécia)","www.fenixhousetcg.com.br","45754"]
];
for(const [name,domain,id] of domains){
 test("Busca por carta no domínio correto da loja: "+name,()=>{
  const link=S.build({store:name,card:"Hexhaven Invigorator",storeId:id});
  assert.ok(link);
  const u=new URL(link.url);
  assert.equal(u.hostname,domain);
  assert.equal(u.searchParams.get("view"),"ecom/itens");
  assert.equal(u.searchParams.get("id"),id);
  assert.equal(u.searchParams.get("busca"),"Hexhaven Invigorator");
  assert.equal(u.searchParams.get("txt_estoque"),"1");
 });
}
test("Nomes Unicode e pontuação preservados em parâmetros",()=>{
 const url=new URL(S.build({store:"Fenix Geek House",card:"Éowyn, Shieldmaiden & Tide"}).url);
 assert.equal(url.searchParams.get("busca"),"Éowyn, Shieldmaiden & Tide");
});
test("Magos usa domínio próprio e ID 621302",()=>{
 const u=new URL(S.build({store:"Magos",card:"Culling the Weak",storeId:"621302"}).url);
 assert.equal(u.hostname,"www.magosdacosta.com.br");
 assert.equal(u.searchParams.get("id"),"621302");
 assert.equal(u.searchParams.get("busca"),"Culling the Weak");
});
test("ID incompatível e loja desconhecida não geram destino",()=>{
 assert.equal(S.build({store:"Taberna Geek",card:"Talisman of Dominance",storeId:"49834"}),null);
 assert.equal(S.build({store:"Outros",card:"Talisman of Dominance",storeId:"41369"}),null);
 assert.equal(S.build({store:"Vila Geek",card:""}),null);
});
test("Página de carta da LigaMagic não é Compra por Lista",()=>{
 const u=new URL(S.cardPage("Culling the Weak"));
 assert.equal(u.hostname,"www.ligamagic.com.br");
 assert.equal(u.searchParams.get("view"),"cards/card");
 assert.equal(u.searchParams.get("card"),"Culling the Weak");
 assert.equal(u.searchParams.has("deck"),false);
});
test("Carta dupla gera busca na face da frente",()=>{
 const u=new URL(S.cardPage("Silundi Vision // Silundi Isle"));
 assert.equal(u.searchParams.get("card"),"Silundi Vision");
});
test("Nome inválido não gera URL",()=>{
 assert.equal(S.cardPage(""),null);
 assert.equal(S.build({store:"Taberna Geek",card:""}),null);
});
