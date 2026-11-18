// Gera o roteiro para o robô jogar um ano inteiro, do primeiro ao último capítulo.
// Uso: node ferramentas/robo_ano.cjs <ano 1..7> <roteiro.json>
//      node ferramentas/cdp.mjs http://localhost:5287/Paranapiacaba/ <roteiro.json> <pasta de fotos>
// O relatório aparece nas linhas "=> FIM": um item por capítulo e os erros do console da página.
const fs = require('fs');
const ano = Number(process.argv[2]) - 1;
const robo = fs.readFileSync(require('path').join(__dirname, 'robo.js'), 'utf8');
const motor = `
window.__capturebolRapido = true;
window.__prog = []; window.__fimAno = null; window.__erros = [];
addEventListener('error', (e) => __erros.push(String(e.message).slice(0, 200)));
addEventListener('unhandledrejection', (e) => __erros.push('rej ' + String(e.reason && e.reason.stack || e.reason).slice(0, 300)));
(async () => {
  const dorme = (ms) => new Promise((r) => setTimeout(r, ms));
  const pos = () => JSON.parse(localStorage.getItem('paranapiacaba.v1')).pos;
  for (let k = 0; k < 14; k++) {
    const antes = pos();
    if (antes.ano !== ${ano}) { window.__fimAno = 'ok'; return; }
    for (let t = 0; t < 8; t++) {
      const b = document.querySelector('.hud-objetivo .btn');
      if (!b) break;
      b.click();
      await dorme(4500);
      if (!document.querySelector('.hud-objetivo .btn')) break;
    }
    const t0 = Date.now();
    const r = await window.__robo({ maxPassos: 9000, pausa: 200 });
    window.__prog.push({ cap: antes.cap + 1, seg: Math.round((Date.now() - t0) / 1000), log: r.log, lugares: r.lugares.slice(0, 12) });
    if (!r.log.some((x) => /chegou/.test(x))) { window.__fimAno = 'parou no capítulo ' + (antes.cap + 1); return; }
    await dorme(5000);
  }
  window.__fimAno = 'limite';
})(); 'motor iniciado'`;
const status = `(()=>{const p=JSON.parse(localStorage.getItem('paranapiacaba.v1')).pos; const c=(document.querySelector('.capt-painel:not([hidden])')?.innerText||document.querySelector('.painel:not([hidden])')?.innerText||document.querySelector('.caixa')?.innerText||'').slice(0,50).split(String.fromCharCode(10)).join(' '); return 'ano '+(p.ano+1)+' cap '+(p.cap+1)+' passo '+p.passo+' | '+(document.querySelector('.local')?.textContent||'-')+' | '+c+' | '+(window.__fimAno||'jogando')+(window.__erros.length?' | ERROS '+window.__erros.length:'')})()`;
const r = [
  { eval: `(() => { const s = __pnp.es.novoEstado('Mariana', 1, {pele:'', cabelo:'', estilo:'curto', oculos:false, modelo:'voce3'}); s.casa='oncarina'; s.pos={ano:${ano},cap:0,passo:0}; s.xp=${ano * 1500}; __pnp.es.salvar(); location.reload(); return 'ok' })()` },
  { espera: 10000 },
  { eval: "document.querySelector('.acoes-col .btn')?.click(), 'ok'" },
  { espera: 8000 },
  { eval: robo + ';\n' + motor },
];
// até ~75 minutos, olhando a cada 20 s e fotografando a cada minuto (a foto também mantém os quadros andando)
for (let i = 1; i <= 225; i++) {
  r.push({ espera: 20000 });
  if (i % 3 === 0) r.push({ foto: `a${ano + 1}_${String(i).padStart(3, '0')}.jpg` });
  r.push({ eval: status, rotulo: `st${i}` });
  r.push({ eval: `window.__fimAno ? 'FIM ' + window.__fimAno + ' ' + JSON.stringify({prog: window.__prog.map(p=>({cap:p.cap,seg:p.seg,log:p.log})), erros: window.__erros.slice(0,5)}) : 'seguindo'`, rotulo: `fim${i}` });
}
fs.writeFileSync(process.argv[3] || `ano${ano + 1}.json`, JSON.stringify(r));
console.log('ok', r.length);
