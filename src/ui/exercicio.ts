// Mostra qualquer exercício do contrato e resolve com true (acertou) ou false.
import type { Exercicio } from '../conteudo/tipos';
import { fmt } from '../motor/texto';
import { estado } from '../motor/estado';
import { h, botao, embaralha } from './dom';

export const normaliza = (s: string) => s.trim().replace(/\s+/g, ' ');
export const casaComando = (aceitos: string[], cmd: string) =>
  aceitos.some((r) => {
    try {
      return new RegExp(`^(?:${r})$`, 'i').test(normaliza(cmd));
    } catch {
      return false;
    }
  });

interface Opcoes {
  tempo?: number; // segundos; acabou o tempo, conta como erro
  rotuloContinuar?: string;
}

export function mostrarExercicio(alvo: HTMLElement, ex: Exercicio, op: Opcoes = {}): Promise<boolean> {
  return new Promise((resolver) => {
    alvo.innerHTML = '';
    const caixa = h('div', { class: `exercicio ex-${ex.tipo}` });
    const feedback = h('div', { class: 'feedback', 'aria-live': 'polite' });
    let terminou = false;
    let relogio: number | undefined;

    const fim = (ok: boolean, extra = '') => {
      if (terminou) return;
      terminou = true;
      if (relogio) clearInterval(relogio);
      caixa.classList.add(ok ? 'certo' : 'errado');
      caixa.querySelectorAll('button:not(.btn-continuar), input').forEach((b) => ((b as HTMLButtonElement).disabled = true));
      feedback.innerHTML = `<div class="veredito">${ok ? '✔ Acertou!' : '✘ Não foi dessa vez.'}</div>${extra}<p>${fmt(ex.explicacao)}</p>`;
      feedback.append(botao(op.rotuloContinuar ?? 'Continuar', () => resolver(ok), 'btn-continuar primario'));
      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    if (op.tempo) {
      const barra = h('div', { class: 'tempo' }, h('div', { class: 'tempo-fill' }));
      caixa.append(barra);
      const ini = Date.now();
      const fill = barra.firstChild as HTMLElement;
      relogio = window.setInterval(() => {
        const r = 1 - (Date.now() - ini) / (op.tempo! * 1000);
        fill.style.width = `${Math.max(0, r) * 100}%`;
        if (r <= 0) fim(false, '<p class="dica">O tempo acabou. O oponente não espera você achar o Ctrl.</p>');
      }, 200);
    }

    switch (ex.tipo) {
      case 'multipla': {
        caixa.append(h('p', { class: 'pergunta', html: fmt(ex.pergunta) }));
        const ordem = embaralha(ex.opcoes.map((_, i) => i));
        const lista = h('div', { class: 'opcoes' });
        for (const i of ordem) {
          const b = h('button', { class: 'opcao', type: 'button', html: fmt(ex.opcoes[i]) });
          b.addEventListener('click', () => {
            if (terminou) return;
            b.classList.add(i === ex.correta ? 'marcada-certa' : 'marcada-errada');
            lista.querySelectorAll('.opcao')[ordem.indexOf(ex.correta)].classList.add('marcada-certa');
            fim(i === ex.correta);
          });
          lista.append(b);
        }
        caixa.append(lista);
        break;
      }
      case 'terminal': {
        caixa.append(h('p', { class: 'pergunta', html: fmt(ex.enunciado) }));
        const prompt = ex.prompt ?? `${estado().nome.toLowerCase().replace(/[^a-z0-9]/g, '') || 'aluno'}@paranapiacaba:~$`;
        const tela = h('div', { class: 'term' });
        if (ex.contexto) tela.append(h('pre', {}, ex.contexto));
        const linha = h('form', { class: 'term-linha' });
        const inp = h('input', { type: 'text', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', 'aria-label': 'comando', enterkeyhint: 'go' }) as HTMLInputElement;
        linha.append(h('span', { class: 'term-prompt' }, prompt + ' '), inp);
        tela.append(linha);
        caixa.append(tela);
        let erros = 0;
        const acoes = h('div', { class: 'acoes' });
        const dica = botao('Pedir dica', () => {
          tela.insertBefore(h('pre', { class: 'term-dica' }, `# dica: ${ex.dica}`), linha);
        }, 'secundario');
        const desisto = botao('Mostrar resposta', () => {
          tela.insertBefore(h('pre', { class: 'term-dica' }, `# resposta: ${ex.exemplo}`), linha);
          fim(false);
        }, 'secundario');
        desisto.hidden = true;
        acoes.append(dica, desisto);
        caixa.append(acoes);
        linha.addEventListener('submit', (ev) => {
          ev.preventDefault();
          if (terminou) return;
          const cmd = inp.value;
          if (!cmd.trim()) return;
          tela.insertBefore(h('pre', {}, `${prompt} ${cmd}`), linha);
          inp.value = '';
          if (casaComando(ex.aceitos, cmd)) {
            tela.insertBefore(h('pre', { class: 'term-saida' }, ex.saida), linha);
            fim(erros === 0, erros ? '<p class="dica">Acertou depois de tentar. Conta como meia vitória: o professor viu.</p>' : '');
            if (erros) caixa.classList.replace('errado', 'meio');
          } else {
            erros++;
            const zoeira = ['comando não reconhecido. O Bitu passou por aqui?', 'nada aconteceu. Igual reunião sem pauta.', 'erro: tente de novo, o terminal acredita em você.'];
            tela.insertBefore(h('pre', { class: 'term-erro' }, zoeira[(erros - 1) % zoeira.length]), linha);
            if (erros >= 2) desisto.hidden = false;
          }
          tela.scrollTop = tela.scrollHeight;
        });
        setTimeout(() => inp.focus({ preventScroll: true }), 50);
        break;
      }
      case 'lacuna': {
        const [antes, depois] = ex.enunciado.split('___');
        const inp = h('input', { type: 'text', class: 'lacuna', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'resposta' }) as HTMLInputElement;
        const p = h('p', { class: 'pergunta' });
        p.innerHTML = fmt(antes);
        p.append(inp);
        p.insertAdjacentHTML('beforeend', fmt(depois));
        const form = h('form', {}, p, h('button', { class: 'btn primario', type: 'submit' }, 'Conferir'));
        form.addEventListener('submit', (ev) => {
          ev.preventDefault();
          if (terminou || !inp.value.trim()) return;
          const v = inp.value.trim().toLowerCase();
          const ok = ex.aceitos.some((a) => a.trim().toLowerCase() === v);
          fim(ok, ok ? '' : `<p class="dica">Resposta esperada: <code>${ex.aceitos[0]}</code></p>`);
        });
        caixa.append(form);
        break;
      }
      case 'achar': {
        caixa.append(h('p', { class: 'pergunta', html: fmt(ex.enunciado) }), h('p', { class: 'instrucao' }, 'Toque nas linhas para marcar.'));
        const marcadas = new Set<number>();
        const lista = h('div', { class: 'linhas' });
        ex.linhas.forEach((l, i) => {
          const b = h('button', { class: 'linha', type: 'button' }, l);
          b.addEventListener('click', () => {
            if (terminou) return;
            if (marcadas.has(i)) marcadas.delete(i);
            else marcadas.add(i);
            b.classList.toggle('sel');
          });
          lista.append(b);
        });
        caixa.append(lista, botao('Conferir', () => {
          if (terminou) return;
          const certas = new Set(ex.corretas);
          const ok = marcadas.size === certas.size && [...marcadas].every((i) => certas.has(i));
          lista.querySelectorAll('.linha').forEach((b, i) => {
            if (certas.has(i)) b.classList.add('deveria');
            else if (marcadas.has(i)) b.classList.add('nao');
          });
          fim(ok);
        }, 'primario'));
        break;
      }
      case 'ligar': {
        caixa.append(h('p', { class: 'pergunta', html: fmt(ex.enunciado) }), h('p', { class: 'instrucao' }, 'Toque num item da esquerda e depois no par dele à direita.'));
        const dir = embaralha(ex.pares.map((_, i) => i));
        const par = new Map<number, number>(); // esquerda -> direita
        let selE: number | null = null;
        const colE = h('div', { class: 'col' });
        const colD = h('div', { class: 'col' });
        const cores = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5'];
        const redesenha = () => {
          colE.querySelectorAll('.par').forEach((b, i) => {
            b.className = 'par' + (par.has(i) ? ` ${cores[i]}` : '') + (selE === i ? ' sel' : '');
          });
          colD.querySelectorAll('.par').forEach((b, k) => {
            const di = dir[k];
            const e = [...par.entries()].find(([, d]) => d === di);
            b.className = 'par' + (e ? ` ${cores[e[0]]}` : '');
          });
        };
        ex.pares.forEach(([e], i) => {
          const b = h('button', { class: 'par', type: 'button', html: fmt(e) });
          b.addEventListener('click', () => {
            if (terminou) return;
            selE = selE === i ? null : i;
            redesenha();
          });
          colE.append(b);
        });
        dir.forEach((di) => {
          const b = h('button', { class: 'par', type: 'button', html: fmt(ex.pares[di][1]) });
          b.addEventListener('click', () => {
            if (terminou || selE === null) return;
            for (const [k, v] of par) if (v === di) par.delete(k);
            par.set(selE, di);
            selE = null;
            redesenha();
          });
          colD.append(b);
        });
        caixa.append(h('div', { class: 'ligar' }, colE, colD), botao('Conferir', () => {
          if (terminou) return;
          if (par.size < ex.pares.length) {
            feedback.innerHTML = '<p class="dica">Ainda falta ligar algum par.</p>';
            return;
          }
          const ok = [...par.entries()].every(([e, d]) => e === d);
          const gab = ex.pares.map(([a, b]) => `<li>${fmt(a)} ↔ ${fmt(b)}</li>`).join('');
          fim(ok, ok ? '' : `<ul class="gabarito">${gab}</ul>`);
        }, 'primario'));
        break;
      }
      case 'ordenar': {
        caixa.append(h('p', { class: 'pergunta', html: fmt(ex.enunciado) }), h('p', { class: 'instrucao' }, 'Toque nos itens na ordem certa.'));
        const ordem = embaralha(ex.itens.map((_, i) => i));
        const escolhidos: number[] = [];
        const resultado = h('ol', { class: 'ordem-feita' });
        const banco = h('div', { class: 'opcoes' });
        const redesenha = () => {
          resultado.innerHTML = escolhidos.map((i) => `<li>${fmt(ex.itens[i])}</li>`).join('');
          banco.querySelectorAll('.opcao').forEach((b, k) => ((b as HTMLButtonElement).hidden = escolhidos.includes(ordem[k])));
        };
        for (const i of ordem) {
          const b = h('button', { class: 'opcao', type: 'button', html: fmt(ex.itens[i]) });
          b.addEventListener('click', () => {
            if (terminou) return;
            escolhidos.push(i);
            redesenha();
            if (escolhidos.length === ex.itens.length) {
              const ok = escolhidos.every((x, k) => x === k);
              const gab = ex.itens.map((t) => `<li>${fmt(t)}</li>`).join('');
              fim(ok, ok ? '' : `<p class="dica">Ordem certa:</p><ol class="gabarito">${gab}</ol>`);
            }
          });
          banco.append(b);
        }
        caixa.append(resultado, banco, botao('Desfazer', () => {
          if (terminou) return;
          escolhidos.pop();
          redesenha();
        }, 'secundario'));
        break;
      }
    }
    caixa.append(feedback);
    alvo.append(caixa);
  });
}
