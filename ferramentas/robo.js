// Robô que joga a história pela interface (para teste de ponta a ponta no navegador).
// Uso no console da página: await __robo({ maxPassos: 4000, ate: 'Capítulo concluído' })
// Responde qualquer exercício (não necessariamente certo), clica falas, escolhas e botões.
window.__robo = async function ({ maxPassos = 4000, ate = 'Capítulo concluído', pausa = 120, fotos = null } = {}) {
  const dorme = (ms) => new Promise((r) => setTimeout(r, ms));
  const vis = (el) => el && el.offsetParent !== null && !el.hidden;
  const log = [];
  const lugares = [];
  let ultimoLugar = '';
  let paradoDesde = Date.now();
  let ultimoTexto = '';
  const clicar = (el) => el && el.click();
  for (let i = 0; i < maxPassos; i++) {
    await dorme(pausa);
    const painel = document.querySelector('.painel');
    const caixa = document.querySelector('.caixa');
    const local = document.querySelector('.local')?.textContent ?? '';
    if (local && local !== ultimoLugar) {
      ultimoLugar = local;
      lugares.push(local);
      if (fotos) await fotos(local);
    }
    const textoTela = (painel && !painel.hidden ? painel.innerText : caixa?.innerText ?? '').slice(0, 80);
    if (textoTela !== ultimoTexto) {
      paradoDesde = Date.now();
      ultimoTexto = textoTela;
    }
    if (Date.now() - paradoDesde > 45000) {
      log.push(`TRAVOU em "${textoTela}" (lugar: ${local})`);
      break;
    }
    if (document.body.innerText.includes(ate)) {
      log.push('chegou ao fim: ' + ate);
      const b = [...document.querySelectorAll('.painel .btn')].find((x) => /Voltar ao castelo/.test(x.textContent));
      clicar(b);
      break;
    }
    if (painel && !painel.hidden) {
      const ex = painel.querySelector('.exercicio');
      const cont = painel.querySelector('.btn-continuar');
      if (cont) {
        clicar(cont);
        continue;
      }
      if (ex && !ex.classList.contains('certo') && !ex.classList.contains('errado') && !ex.classList.contains('meio')) {
        if (ex.classList.contains('ex-multipla')) clicar(ex.querySelector('.opcao'));
        else if (ex.classList.contains('ex-terminal')) {
          const mostrar = [...ex.querySelectorAll('.btn')].find((b) => /Mostrar resposta/.test(b.textContent) && !b.hidden);
          if (mostrar) clicar(mostrar);
          else {
            const inp = ex.querySelector('input');
            inp.value = 'xyzzy';
            inp.form.requestSubmit();
          }
        } else if (ex.classList.contains('ex-lacuna')) {
          const inp = ex.querySelector('input');
          inp.value = 'resposta';
          inp.closest('form').requestSubmit();
        } else if (ex.classList.contains('ex-achar')) {
          clicar(ex.querySelector('.linha'));
          clicar([...ex.querySelectorAll('.btn')].find((b) => /Conferir/.test(b.textContent)));
        } else if (ex.classList.contains('ex-ligar')) {
          const [esq, dir] = ex.querySelectorAll('.col');
          const e = esq.querySelectorAll('.par');
          const d = dir.querySelectorAll('.par');
          for (let k = 0; k < e.length; k++) {
            clicar(e[k]);
            clicar(d[k]);
          }
          clicar([...ex.querySelectorAll('.btn')].find((b) => /Conferir/.test(b.textContent)));
        } else if (ex.classList.contains('ex-ordenar')) {
          for (const b of ex.querySelectorAll('.opcao')) if (!b.hidden) clicar(b);
        }
        continue;
      }
      const opcao = [...painel.querySelectorAll('.opcao')].find((b) => vis(b) && !b.disabled);
      if (opcao && !ex) {
        clicar(opcao);
        continue;
      }
      const btn = [...painel.querySelectorAll('.btn')].filter(vis).pop();
      if (btn) clicar(btn);
      continue;
    }
    if (caixa && vis(caixa)) clicar(caixa);
  }
  return { log, lugares };
};
