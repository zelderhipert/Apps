const test = require("node:test");const assert=require("node:assert/strict");
const K=require("../report-kit.js");
test("CSV V3 com vírgula decimal, BOM e ponto-e-vírgula",()=>{
 const rows=K.parseCSV('\uFEFFcarta;preco_loja;diferenca_pct;deck\r\n"Tinybones, Bauble Burglar";6,00;1,87;"Piratas; Dimir"\r\n');
 assert.equal(rows[0].carta,"Tinybones, Bauble Burglar");assert.equal(rows[0].deck,"Piratas; Dimir");
 assert.equal(K.numberBR(rows[0].preco_loja),6);assert.equal(K.numberBR(rows[0].diferenca_pct),1.87);
});
test("aspas e quebras de linha",()=>{const r=K.parseCSV('a;b\n"X""Y";"c\nd"\n');assert.equal(r[0].a,'X"Y');assert.equal(r[0].b,"c\nd");});
test("escapar conteúdo remoto e restringir links",()=>{
 assert.equal(K.escapeHTML('<img src=x onerror="a">'),'&lt;img src=x onerror=&quot;a&quot;&gt;');
 assert.equal(K.safeURL('javascript:alert(1)'),null);
 assert.equal(K.safeURL('https://evil.com/?next=ligamagic.com.br'),null);
 assert.equal(K.safeURL('https://www.ligamagic.com.br/?view=cards/lista'),'https://www.ligamagic.com.br/?view=cards/lista');
});
test("valores ausentes e negativos",()=>{assert.equal(K.numberBR(''),null);assert.equal(K.numberBR('-97,05'),-97.05);assert.equal(K.numberBR('R$ 1.234,56'),1234.56);});
