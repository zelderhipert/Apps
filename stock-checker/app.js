/* MTGverse Stock Checker: all user data remains inside the browser. */
(function(){
"use strict";
const K=window.MTGReportKit;
if(!K)throw new Error("mtg-report-kit não carregado");
const storeSearch=window.MTGStoreLinks;
const $=id=>document.getElementById(id);
let data=null,activeTab="offers";
let state={search:"",store:"",origin:"",sort:"name"};
const formatInt=n=>new Intl.NumberFormat("pt-BR").format(Number(n)||0);
const signedMoney=n=>Number.isFinite(n)?(n>0?"+":"")+K.formatMoney(n):"—";
const amount=n=>Number.isFinite(n)?K.formatMoney(n):"—";
const pctColor=n=>!Number.isFinite(n)?"flat":n<=0?"good":"bad";
const h=K.escapeHTML;
const safe=n=>String(n??"");
function dateStr(iso){
 try{return new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(iso));}
 catch{return String(iso||"—");}
}
function parseOffer(r){
 const price=K.numberBR(r.preco_loja),reference=K.numberBR(r.menor_preco_liga);
 const delta=K.numberBR(r.diferenca_reais);
 const diff=K.numberBR(r.diferenca_pct);
 return {
   raw:r,name:r.carta||"",store:r.loja||"",storeId:r.loja_id||"",deck:r.deck||"",origin:r.origem||"",
   price,reference,delta:delta??(price!==null&&reference!==null?price-reference:null),
   diff:diff??(price!==null&&reference>0?(price/reference-1)*100:null),
   stock:K.numberBR(r.estoque),edition:r.edicao||"Não informada",
   collector:r.numero_colecao||r.collector_number||r.numero_colecionador||"",
   language:r.idioma||"—",foil:r.foil||"—",condition:r.conservacao||"—",
   link:K.safeURL(r.link_oferta),checked:r.consultado_em||"",
   historicalReference:/referencia historica|referência histórica/i.test(r.base_comparacao||"")
 };
}
function offerKey(o){return [K.norm(o.name),K.norm(o.store),o.price,o.edition,o.language,o.foil,o.condition,o.stock].join("~~");}
function uniqueOffers(rows){return K.uniqueBy(rows,offerKey);}
function uniqueCards(rows){return new Set(rows.map(o=>K.norm(o.name))).size;}
function selected(){
 return data.offers.filter(o=>(!state.store||o.store===state.store)&&
   (!state.origin||o.origin===state.origin)&&
   (!state.search||K.norm(o.name+" "+o.deck+" "+o.store).includes(K.norm(state.search))));
}
function groupsFor(rows){
 const groups=new Map();
 for(const o of rows){
   const key=K.norm(o.name);
   if(!groups.has(key))groups.set(key,[]);
   groups.get(key).push(o);
 }
 const list=[...groups.values()].map(items=>{
   const offers=uniqueOffers(items);
   const cheapest=offers.filter(x=>x.price!==null).sort((a,b)=>a.price-b.price)[0]||offers[0];
   const bestDiff=offers.map(x=>x.diff).filter(x=>Number.isFinite(x)).sort((a,b)=>a-b)[0];
   const maxStock=Math.max(0,...offers.map(x=>x.stock||0));
   return {name:items[0].name,items,offers,cheapest,bestDiff,maxStock};
 });
 const mode=state.sort;
 list.sort((a,b)=>mode==="price"?(a.cheapest?.price??Infinity)-(b.cheapest?.price??Infinity):
 mode==="delta"?(a.bestDiff??Infinity)-(b.bestDiff??Infinity):
 mode==="stock"?b.maxStock-a.maxStock:
 a.name.localeCompare(b.name,"pt-BR"));
 return list;
}
function setOptions(){
 const old=$("storeFilter").value;
 const stores=[...new Set(data.offers.map(o=>o.store).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"pt-BR"));
 $("storeFilter").replaceChildren(new Option("Todas",""),...stores.map(v=>new Option(v,v)));
 if(stores.includes(old))$("storeFilter").value=old;else state.store="";
}
function kpis(){
 const diag=data.diagnostics||{};
 const offers=uniqueOffers(data.offers);
 const cards=uniqueCards(data.offers);
 const covered=new Set(data.offers.filter(o=>o.reference!==null&&o.reference>0).map(o=>K.norm(o.name)));
 const missing=cards-covered.size;
 const restored=new Set(data.offers.filter(o=>o.historicalReference).map(o=>K.norm(o.name))).size;
 const refStatus=$("referenceStatus");
 refStatus.classList.toggle("warn",missing>0||restored>0);
 const provenance=restored?" ATENÇÃO: "+formatInt(restored)+" "+(restored===1?"carta utiliza":"cartas utilizam")+" referências HISTÓRICAS da captura anterior, sem nova verificação na LigaMagic.":"";
 refStatus.textContent=(missing>0?`Atenção: ${formatInt(missing)} de ${formatInt(cards)} cartas com ofertas estão sem menor preço da Liga no CSV importado. Verifique o deck.json e os nomes da captura.`:`Referências da Liga reconhecidas para ${formatInt(covered.size)} de ${formatInt(cards)} cartas com ofertas.`)+provenance;
 const stores=[...new Set(offers.map(o=>o.store))].length;
 const tracked=Number.isFinite(+diag.requested_cards)?+diag.requested_cards:cards+(data.pending.length||0);
 const confirmed=Number.isFinite(+diag.cards_with_offers)?+diag.cards_with_offers:cards;
 const all=[
   [formatInt(tracked),"Cartas monitoradas","Want + Maybeboard"],
   [formatInt(confirmed),"Com oferta verificada",tracked?((confirmed/tracked)*100).toFixed(0)+"% da lista":"—"],
   [formatInt(Number.isFinite(+diag.valid_offers)?+diag.valid_offers:offers.length),"Ofertas distintas","Sem duplicar entre decks"],
   [formatInt(stores),"Lojas com resultados","Desta consulta"]
 ];
 $("kpis").innerHTML=all.map(([v,l,n])=>'<div class="stat"><b>'+h(v)+'</b><span>'+h(l)+'</span><small>'+h(n)+'</small></div>').join("");
 const dates=offers.map(o=>o.checked).filter(Boolean);
 $("reportDate").textContent=dates.length?dateStr(dates.sort().at(-1)):"Sem data";
 $("reportTitle").textContent="Visão geral";
}
function printTags(arr,key){
 return [...new Set(arr.map(x=>x[key]).filter(Boolean))].sort().map(t=>'<span class="badge '+(t==="Want"?"wanted":t==="Maybeboard"?"maybe":"")+'">'+h(t)+'</span>').join(" ");
}
function artButton(name,edition="",collector="",kind="generic"){
 if(!name)return "";
 return '<button type="button" class="cardArt '+(kind==="offer"?"cardArtOffer":kind==="pending"?"cardArtPending":"cardArtSmall")+
 '" data-art-name="'+h(name)+'" data-art-set="'+h(kind==="offer"?edition:"")+
 '" data-art-collector="'+h(kind==="offer"?collector:"")+
 '" aria-label="Ampliar imagem de '+h(name)+'"><span class="artPlaceholder" aria-hidden="true">✦</span></button>';
}
function printOfferRow(o,group){
 const associated=group.filter(item=>offerKey(item)===offerKey(o));
 const origins=printTags(associated,"origin");
 const decks=[...new Set(associated.map(item=>item.deck).filter(Boolean))].sort().join(", ");
 const searched=storeSearch?.build({store:o.store,card:o.name,storeId:o.storeId})||null;
 const cardLink=storeSearch?.cardPage(o.name)||null;
 const target=searched?.url||cardLink;
 const label=searched?.label||(cardLink?"Carta na Liga ↗":"—");
 const title=searched?"Busca por nome no estoque da loja; não seleciona impressão ou condição específica.":
 "Página da carta na LigaMagic, sem abrir a Compra por Lista.";
 return '<tr>'+
 '<td>'+artButton(o.name,o.edition,o.collector,"offer")+'</td>'+
 '<td><b>'+h(o.store)+'</b><div class="cardMeta">'+h(decks)+'</div><div>'+origins+'</div></td>'+
 '<td><span class="money">'+amount(o.price)+'</span><div class="cardMeta">Liga'+(o.historicalReference?' (captura anterior)':'')+': '+amount(o.reference)+'</div></td>'+
 '<td><span class="'+pctColor(o.delta)+' money">'+signedMoney(o.delta)+'</span></td>'+
 '<td><span class="'+pctColor(o.diff)+' money">'+K.formatPct(o.diff)+'</span></td>'+
 '<td>'+h(o.edition)+'<div class="cardMeta">'+h(o.language)+' · '+h(o.foil)+' · '+h(o.condition)+'</div></td>'+
 '<td>'+h(o.stock===null?"—":formatInt(o.stock))+'</td>'+
 '<td>'+(target?'<a href="'+h(target)+'" title="'+h(title)+'" target="_blank" rel="noopener noreferrer" class="offerLink">'+h(label)+'</a>':'—')+
 (searched&&cardLink?'<div class="cardMeta"><a href="'+h(cardLink)+'" title="Página individual da carta na LigaMagic" target="_blank" rel="noopener noreferrer" class="offerLink">Carta na Liga ↗</a></div>':'')+'</td>'+
 '</tr>';
}
function renderOffers(){
 const rows=selected(),groups=groupsFor(rows),allOffers=uniqueOffers(rows);
 $("resultCount").textContent=formatInt(groups.length)+" cartas / "+formatInt(allOffers.length)+" ofertas";
 if(!groups.length){$("offerResults").innerHTML='<p class="empty">'+(data.offers.length?"Nenhuma carta corresponde aos filtros.":"Nenhuma oferta verificada nesta captura. Consulte as abas Pendências e Diagnóstico.")+'</p>';return;}
 $("offerResults").innerHTML=groups.map(g=>{
  const p=g.cheapest||{};
  const shops=new Set(g.offers.map(o=>o.store)).size;
  return '<details class="offerGroup"><summary>'+
   '<div class="cardHeading">'+artButton(g.name)+'<div><span class="cardName">'+h(g.name)+'</span><span class="cardMeta">'+formatInt(g.offers.length)+' ofertas · '+formatInt(shops)+' lojas · '+printTags(g.items,"origin")+'</span></div></div>'+
   '<div><span class="offerLabel">MELHOR OFERTA</span><span class="offerPrice">'+amount(p.price)+'</span></div>'+
   '<div class="summaryDelta"><span class="offerLabel">DIFERENÇA %</span><span class="marker '+pctColor(p.diff)+'">'+(Number.isFinite(p.diff)?K.formatPct(p.diff):"Sem referência") +'</span></div>'+
   '<div class="chevron">›</div></summary>'+
   '<div class="offerDetails"><div class="tableScroll"><table class="offerTable"><thead><tr><th>Arte</th><th>Loja / deck</th><th>Preço</th><th>Dif. R$</th><th>Dif. %</th><th>Versão / idioma / estado</th><th>Estoque</th><th>Estoque da loja</th></tr></thead><tbody>'+
   g.offers.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity)).map(o=>printOfferRow(o,g.items)).join("")+
   '</tbody></table></div></div></details>';
 }).join("");
}
function storeSummary(){
 const rows=data.stores;
 if(rows.length)return rows.map(r=>({
  name:r.loja,
  offers:K.numberBR(r.ofertas_distintas)||0,cards:K.numberBR(r.cartas_unicas)||0,
  want:K.numberBR(r.cartas_want_unicas)||0,maybe:K.numberBR(r.cartas_maybeboard_unicas)||0,
  total:K.numberBR(r.total_indicativo_1_unidade_por_carta)
 }));
 const grouped=new Map();
 for(const offer of uniqueOffers(data.offers)){
  if(!grouped.has(offer.store))grouped.set(offer.store,[]);
  grouped.get(offer.store).push(offer);
 }
 return [...grouped].map(([name,offers])=>{
  const byCard=new Map();
  for(const o of offers){const key=K.norm(o.name);if(!byCard.has(key)||o.price<byCard.get(key))byCard.set(key,o.price);}
  const originRows=data.offers.filter(x=>x.store===name);
  return {name,offers:offers.length,cards:byCard.size,
    want:uniqueCards(originRows.filter(x=>x.origin==="Want")),
    maybe:uniqueCards(originRows.filter(x=>x.origin==="Maybeboard")),
    total:[...byCard.values()].reduce((a,b)=>a+b,0)};
 });
}
function renderStores(){
 const stores=storeSummary().sort((a,b)=>b.cards-a.cards);
 if(!stores.length){$("storeResults").innerHTML='<p class="empty">Sem dados de lojas. Importe oportunidades_es.csv.</p>';return;}
 const max=Math.max(1,...stores.map(x=>x.cards));
 $("storeResults").innerHTML='<div class="storeGrid">'+stores.map(s=>'<article class="storeCard"><h3>'+h(s.name)+'</h3>'+
  '<div class="twostat"><div><b>'+formatInt(s.cards)+'</b><span> cartas únicas</span></div><div><b>'+formatInt(s.offers)+'</b><span> ofertas</span></div></div>'+
  '<div class="barbg"><div style="width:'+Math.round(100*s.cards/max)+'%"></div></div>'+
  '<div class="cardMeta">Want: '+formatInt(s.want)+' · Maybeboard: '+formatInt(s.maybe)+'</div>'+
  '<p class="footnote">Uma unidade da oferta mais barata por carta: <strong>'+amount(s.total)+'</strong> (sem frete)</p></article>').join("")+'</div>';
}
function renderPending(){
 if(!data.pending.length){$("pendingResults").innerHTML='<div class="panel"><p class="empty">Nenhuma pendência no arquivo importado.</p></div>';return;}
 $("pendingResults").innerHTML='<div class="panel">'+data.pending.map(r=>'<div class="pendingItem"><div class="pendingCardHead">'+artButton(r.carta||r.card_name||"","","","pending")+'<b>'+h(r.carta||r.card_name||"—")+'</b></div><span>'+h(r.observacao||r.status||"Não confirmado")+'</span></div>').join("")+'</div>';
}
function renderDiagnostics(){
 const d=data.diagnostics;
 if(!d){$("diagnosticsResults").innerHTML='<p class="empty">diagnostics.json não foi incluído. A visualização de ofertas continua disponível.</p>';return;}
 const labels=[["requested_cards","Cartas solicitadas"],["observed_card_rows","Linhas observadas"],["reference_prices","Preços capturados no deck"],["reference_prices_for_targets","Referências associadas"],["valid_offers","Ofertas verificadas"],["cards_unconfirmed","Cartas não confirmadas"],["shopping_snapshots","Capturas de compra"],["deck_snapshots","Capturas de deck"]];
 $("diagnosticsResults").innerHTML='<div class="panel"><h3>Integridade da execução</h3><div class="diagGrid">'+
 labels.filter(([key])=>d[key]!==undefined).map(([key,label])=>'<div class="diagMetric"><b>'+h(d[key])+'</b>'+h(label)+'</div>').join("")+
 '</div></div><div class="panel"><h3>Avisos</h3>'+(Array.isArray(d.warnings)&&d.warnings.length?'<ul class="warnings">'+d.warnings.map(w=>'<li>'+h(w)+'</li>').join("")+'</ul>':'<p class="empty">Nenhum aviso registrado.</p>')+'</div>'+
 '<p class="subtleNote">'+h(d.interpretation||"A ausência de uma carta na busca não prova falta de estoque.")+'</p>';
}
function render(){if(!data)return;kpis();renderOffers();renderStores();renderPending();renderDiagnostics();}
function setTab(tab){
 activeTab=tab;
 for(const b of document.querySelectorAll(".tab")){const active=b.dataset.tab===tab;b.classList.toggle("active",active);b.setAttribute("aria-selected",String(active));}
 for(const t of ["offers","stores","pending","diagnostics"])$(t+"Tab").hidden=t!==tab;
}
async function importFiles(fileList){
 const status=$("importStatus");status.textContent="Lendo arquivos locais...";
 try{
  const files=await K.readFiles(fileList);
  if(!files["oportunidades_es.csv"])throw new Error("Selecione oportunidades_es.csv; ele é obrigatório.");
  const first=files["oportunidades_es.csv"][0];
  if(first&&!["carta","preco_loja","loja"].every(k=>Object.hasOwn(first,k)))throw new Error("CSV incompatível: faltam as colunas carta, preco_loja ou loja. Confira se escolheu a exportação do Stock Checker.");
  const offers=files["oportunidades_es.csv"].map(parseOffer).filter(x=>x.name&&x.store&&x.price!==null);
  if(!offers.length&&files["oportunidades_es.csv"].length)throw new Error("Nenhuma oferta com carta, loja e preço válido.");
  const diag=files["diagnostics.json"]||null;
  if(diag&&diag.schema!=="mtg-stock-checker/v3")throw new Error("diagnostics.json incompatível com Stock Checker V3.");
  data={raw:files["oportunidades_es.csv"],offers,stores:files["resumo_lojas.csv"]||[],pending:files["pendencias.csv"]||[],diagnostics:diag};
  setOptions();state={search:"",store:"",origin:"",sort:"name"};
  $("searchInput").value="";$("storeFilter").value="";$("originFilter").value="";$("sortFilter").value="name";
  $("dashboard").hidden=false;$("importSection").classList.add("compact");
  status.style.color="";
  status.textContent="Dados carregados localmente: "+offers.length+" linhas, "+Object.keys(files).length+" arquivos reconhecidos. Nenhum upload foi feito.";
  setTab("offers");render();
 }catch(err){status.textContent="Não foi possível abrir: "+err.message;status.style.color="#ff9a9a";}
}
function exportFiltered(){
 if(!data)return;
 const allowed=new Set(selected().map(o=>o.raw));
 const rows=data.raw.filter(x=>allowed.has(x));
 if(!rows.length)return;
 const headers=Object.keys(rows[0]),quote=v=>'"'+String(v??"").replace(/"/g,'""')+'"';
 const csv="\uFEFF"+headers.map(quote).join(";")+"\r\n"+rows.map(r=>headers.map(k=>quote(r[k])).join(";")).join("\r\n");
 const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="mtgverse_stock_filtrado.csv";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$("folderInput").addEventListener("change",ev=>importFiles(ev.target.files));
$("filesInput").addEventListener("change",ev=>importFiles(ev.target.files));
$("replaceBtn").addEventListener("click",()=>$("folderInput").click());
$("searchInput").addEventListener("input",ev=>{state.search=ev.target.value;renderOffers();});
$("storeFilter").addEventListener("change",ev=>{state.store=ev.target.value;renderOffers();});
$("originFilter").addEventListener("change",ev=>{state.origin=ev.target.value;renderOffers();});
$("sortFilter").addEventListener("change",ev=>{state.sort=ev.target.value;renderOffers();});
$("exportBtn").addEventListener("click",exportFiltered);
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>setTab(b.dataset.tab)));
document.addEventListener("dragover",e=>{if(e.dataTransfer?.types.includes("Files"))e.preventDefault();});
document.addEventListener("drop",e=>{if(e.dataTransfer?.files?.length){e.preventDefault();importFiles(e.dataTransfer.files);}});
})();
