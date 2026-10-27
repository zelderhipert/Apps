(function(root,factory){
  const api=factory();
  if(typeof module==="object" && module.exports) module.exports=api;
  root.MTGReportKit=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const escapeHTML=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function detectDelimiter(header){
  let quoted=false,counts={";":0,",":0,"\t":0};
  for(let i=0;i<header.length;i++){const c=header[i];if(c==='"'){if(quoted&&header[i+1]==='"'){i++;continue;}quoted=!quoted;}else if(!quoted&&c in counts)counts[c]++;}
  return Object.keys(counts).sort((a,b)=>counts[b]-counts[a])[0]||";";
}
function parseCSV(text,delimiter){
  text=String(text||"").replace(/^\uFEFF/,"");
  const firstLine=text.split(/\r?\n/,1)[0];
  const sep=delimiter||detectDelimiter(firstLine);
  let rows=[],row=[],field="",quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}
    else if(!quoted&&c===sep){row.push(field);field="";}
    else if(!quoted&&(c==="\n"||c==="\r")){if(c==="\r"&&text[i+1]==="\n")i++;row.push(field);if(row.some(x=>x!==""))rows.push(row);row=[];field="";}
    else field+=c;
  }
  if(quoted)throw new Error("CSV possui aspas não fechadas.");
  row.push(field);if(row.some(x=>x!==""))rows.push(row);
  if(!rows.length)return [];
  const keys=rows.shift().map((x,i)=>i===0?x.replace(/^\uFEFF/,"").trim():x.trim());
  return rows.map(r=>Object.fromEntries(keys.map((k,i)=>[k,(r[i]??"").trim()])));
}
function numberBR(value){
  let raw=String(value??"").replace(/R\$/gi,"").replace(/[%\s\u00a0]/g,"").trim();
  if(!raw)return null;
  if(raw.includes(","))raw=raw.replace(/\./g,"").replace(",",".");
  const n=Number(raw);
  return Number.isFinite(n)?n:null;
}
const formatMoney=(n)=>Number.isFinite(n)?new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n):"—";
const formatPct=(n)=>Number.isFinite(n)?new Intl.NumberFormat("pt-BR",{minimumFractionDigits:1,maximumFractionDigits:2,signDisplay:"always"}).format(n)+"%":"—";
const norm=(s)=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase();
function uniqueBy(rows,keyFn){const keys=new Set();return rows.filter(r=>{const k=keyFn(r);if(keys.has(k))return false;keys.add(k);return true;});}
function readFiles(files){
  const out={};
  const selected=Array.from(files||[]).filter(f=>!f.name.startsWith("."));
  return Promise.all(selected.map(async f=>{
    const name=f.name.toLowerCase();
    if(!["oportunidades_es.csv","resumo_lojas.csv","pendencias.csv","diagnostics.json"].includes(name))return;
    if(f.size>10*1024*1024)throw new Error("Arquivo acima de 10 MB: "+f.name);
    const txt=await f.text();
    out[name]=name.endsWith(".json")?JSON.parse(txt):parseCSV(txt);
  })).then(()=>out);
}
function safeURL(value){
  try{const u=new URL(String(value||""));return u.protocol==="https:"&&/(^|\.)ligamagic\.com\.br$/i.test(u.hostname)?u.href:null;}catch{return null;}
}
return {parseCSV,numberBR,formatMoney,formatPct,escapeHTML,norm,uniqueBy,readFiles,safeURL};
});
