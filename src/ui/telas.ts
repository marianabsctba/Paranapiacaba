// Telas fora da história: início, criação, castelo (hub), mapa, coleções, boletim, ajustes.
import type { Lugar, PassoAula } from '../conteudo/tipos';
import * as Som from '../motor/som';
import { ANOS, CRIATURAS, FEITICOS, FIGURINHAS, ITENS, LUGARES, PERSONAGENS } from '../conteudo/index';
import { ATRIBUTOS, apagar, carregar, estado, exportar, importar, novoEstado, salvar } from '../motor/estado';
import { lugaresVisiveis, nivel, nivelAmizade, NIVEIS_AMIZADE, ranking, titulo, xpDoNivel } from '../motor/progresso';
import { CASA_INFO, esc, fmt, personaliza } from '../motor/texto';
import { brasao } from '../arte/brasao';
import { aviso, botao, h } from './dom';
import { aoSair, jogarCapitulo, revisarAula } from './historia';
import { abrirMundo, pararMundo } from './mundo';
import * as C3 from '../tres/cena3d';
import { M } from '../tres/motor3d';
import { imgFoto } from '../tres/foto';

function mundo() {
  // save antigo, de antes da matrícula 3D: escolhe a aparência antes de entrar
  if (!estado().aparencia.modelo) return void trocarAparencia(true);
  abrirMundo(app, { menu: () => castelo(), historia: () => historia() });
}

/** escolher (ou trocar) a aparência 3D depois da matrícula */
async function trocarAparencia(obrigatorio = false) {
  const s = estado();
  let modelo = s.aparencia.modelo ?? APARENCIAS[0];
  const tinta = C3.tintaDe('voce');
  const opcoes = h('div', { class: 'aparencias' });
  APARENCIAS.forEach((id, i) => {
    const b = h('button', { class: 'aparencia' + (id === modelo ? ' sel' : ''), type: 'button', 'aria-label': `Aparência ${i + 1}` }, h('img', { class: 'foto', src: `${import.meta.env.BASE_URL}fotos/${id}.webp`, alt: '' }));
    b.addEventListener('click', () => {
      modelo = id;
      opcoes.querySelectorAll('.aparencia').forEach((x) => x.classList.remove('sel'));
      b.classList.add('sel');
      C3.vitrine(id, tinta);
    });
    opcoes.append(b);
  });
  // a ficha aparece na hora; o dormitório e a pessoa em pé carregam por trás
  void C3.irPara('dormitorio').then(() => {
    if (document.querySelector('.ficha')) C3.vitrine(modelo, OURO);
  });
  tela('criacao',
    h('div', { class: 'ficha' },
      h('h1', {}, obrigatorio ? 'Escolha sua aparência' : 'Mudar aparência'),
      h('p', { class: 'dica' }, obrigatorio ? 'Sua matrícula é de antes do espelho chegar no dormitório. Escolha como você quer aparecer.' : 'O espelho do dormitório aceita trocas ilimitadas. Diferente do RH.'),
      opcoes,
      h('div', { class: 'acoes-col' },
        botao('Pronto', () => {
          C3.vitrine(null);
          s.aparencia.modelo = modelo;
          salvar();
          mundo();
        }, 'primario'),
        obrigatorio ? null : botao('Voltar', () => {
          C3.vitrine(null);
          ajustes();
        }, 'secundario'))),
  );
  C3.vitrine(modelo, tinta);
}
function historia() {
  pararMundo();
  jogarCapitulo(app);
}

let app: HTMLElement;

export function iniciar(raiz: HTMLElement) {
  app = raiz;
  aoSair(() => mundo());
  if (carregar()) mundo();
  else inicio();
}

function tela(classe: string, ...filhos: (Node | string | null)[]) {
  pararMundo();
  app.innerHTML = '';
  const em3d = classe === 'inicio' || classe === 'criacao';
  app.className = em3d ? `modo-tela transparente ${classe}` : 'modo-tela';
  M.ativo = em3d;
  window.scrollTo(0, 0);
  const el = h('main', { class: `tela ${classe}` }, ...filhos);
  app.append(el);
  return el;
}

function cabecalho(tituloTela: string) {
  return h('header', { class: 'cabecalho' }, botao('← Menu', () => castelo(), 'mini'), h('h1', {}, tituloTela));
}

// ---------------------------------------------------------------- início

function inicio() {
  const tem = carregar();
  C3.irPara('patio', true);
  tela('inicio',
    h('div', { class: 'capa' }),
    h('div', { class: 'logo' }, h('h1', {}, 'Paranapiacaba'), h('p', {}, 'Escola de Bruxaria Cibernética')),
    h('p', { class: 'chamada' }, 'Sete anos letivos para sair do zero e virar root. Na neblina da serra, com aula de terminal, criatura-malware no viveiro e duelo de feitiço que é comando de verdade.'),
    h('div', { class: 'acoes-col' },
      tem ? botao('Continuar', () => mundo(), 'primario') : null,
      botao(tem ? 'Começar outra partida' : 'Abrir o convite', () => {
        if (tem && !confirm('Começar de novo apaga a partida salva neste navegador. Exporte o código antes se quiser guardar. Continuar?')) return;
        criacao();
      }, tem ? 'secundario' : 'primario'),
      botao('Tenho um código de save', () => {
        const c = prompt('Cole o código de save:');
        if (c && importar(c)) mundo();
        else if (c) alert('Código inválido. Confere se colou inteiro, igual chave Pix.');
      }, 'secundario')),
    h('p', { class: 'rodape' }, 'Grátis, sem anúncio, sem cadastro. Seu progresso fica só no seu navegador.'),
    h('p', { class: 'assinatura' }, 'Powered by Mariana BS'),
  );
}

// ---------------------------------------------------------------- criação

const APARENCIAS = ['voce1', 'voce2', 'voce3', 'voce4', 'voce5', 'voce6', 'voce7', 'voce8'];
const OURO = 0xd9a520;

async function criacao() {
  let modelo = APARENCIAS[0];
  let pronome: 0 | 1 | 2 = 1;
  let nome = '';
  const grupo = <T,>(ops: [T, string][], atual: T, f: (v: T) => void) => {
    const box = h('div', { class: 'grupo' });
    for (const [v, t] of ops) {
      const b = h('button', { class: 'chip' + (v === atual ? ' sel' : ''), type: 'button' }, t);
      b.addEventListener('click', () => {
        box.querySelectorAll('.chip').forEach((x) => x.classList.remove('sel'));
        b.classList.add('sel');
        f(v);
      });
      box.append(b);
    }
    return box;
  };
  const opcoes = h('div', { class: 'aparencias' });
  APARENCIAS.forEach((id, i) => {
    const b = h('button', { class: 'aparencia' + (id === modelo ? ' sel' : ''), type: 'button', 'aria-label': `Aparência ${i + 1}` }, h('img', { class: 'foto', src: `${import.meta.env.BASE_URL}fotos/${id}.webp`, alt: '', loading: 'eager' }));
    b.addEventListener('click', () => {
      modelo = id;
      opcoes.querySelectorAll('.aparencia').forEach((x) => x.classList.remove('sel'));
      b.classList.add('sel');
      C3.vitrine(id, OURO);
    });
    opcoes.append(b);
  });
  const inp = h('input', { type: 'text', maxlength: '20', placeholder: 'Seu nome', 'aria-label': 'nome', autocomplete: 'off' }) as HTMLInputElement;
  inp.addEventListener('input', () => (nome = inp.value.trim()));
  await C3.irPara('dormitorio');
  tela('criacao',
    h('div', { class: 'ficha' },
      h('h1', {}, 'Ficha de matrícula'),
      h('p', { class: 'dica' }, 'A Secretaria pediu em três vias. A gente aceita uma.'),
      h('label', {}, 'Nome', inp),
      h('label', {}, 'Como devemos falar de você?', grupo<0 | 1 | 2>([[0, 'Ele'], [1, 'Ela'], [2, 'Elu']], pronome, (v) => (pronome = v))),
      h('label', {}, 'Sua aparência', opcoes),
      h('p', { class: 'dica' }, 'A capa ganha a cor da sua casa depois da seleção.'),
      h('div', { class: 'acoes-col' }, botao('Matricular', () => {
        if (!nome) {
          aviso('Escreve seu nome. Até a Vó Cida tem nome de usuário.');
          inp.focus();
          return;
        }
        C3.vitrine(null);
        novoEstado(nome, pronome, { pele: '', cabelo: '', estilo: 'curto', oculos: false, modelo });
        historia();
      }, 'primario'), botao('Voltar', () => {
        C3.vitrine(null);
        inicio();
      }, 'secundario'))),
  );
}

// ---------------------------------------------------------------- castelo (hub)

function castelo() {
  const s = estado();
  const ano = ANOS[s.pos.ano];
  const cap = ano?.capitulos[s.pos.cap];
  const n = nivel(s.xp);
  const pct = ((s.xp - xpDoNivel(n)) / (xpDoNivel(n + 1) - xpDoNivel(n))) * 100;
  const casa = s.casa ? CASA_INFO[s.casa] : null;

  let continuar: Node;
  if (s.formatura) {
    continuar = h('div', { class: 'cartao-hist fim' }, h('h2', {}, '🎓 Formatura concluída'), h('p', {}, personaliza('Você é root, {nome}. Pode refazer aulas no Boletim para caçar as três estrelas e explorar o castelo atrás dos segredos que faltam.')));
  } else if (!cap) {
    continuar = h('div', { class: 'cartao-hist' }, h('h2', {}, `${s.pos.ano + 1}º ano em breve`), h('p', {}, 'O roteiro deste ano ainda está em revisão na Secretaria. Enquanto isso, explore o castelo, revise aulas e procure segredos.'));
  } else {
    continuar = h('button', { class: 'cartao-hist', type: 'button', onclick: () => historia() },
      h('div', { class: 'materia' }, `${ano.numero}º ano · ${cap.mes} · capítulo ${s.pos.cap + 1} de ${ano.capitulos.length}`),
      h('h2', {}, personaliza(cap.titulo)),
      h('span', { class: 'btn primario' }, s.pos.passo > 0 ? 'Continuar a história ▶' : 'Começar capítulo ▶'));
  }

  const rk = s.casa ? ranking() : [];
  const menu: [string, string, () => void][] = [
    ['🗺️', 'Mapa do castelo', mapa],
    ['📜', 'Grimório', grimorio],
    ['🐛', 'Bestiário', bestiario],
    ['🃏', 'Álbum', album],
    ['🧳', 'Malão e dormitório', malao],
    ['💬', 'Amizades', amizades],
    ['📊', 'Boletim', boletim],
    ['⚙️', 'Ajustes', ajustes],
  ];
  tela('castelo',
    h('div', { class: 'acoes-linha' }, botao('← Voltar ao castelo', () => mundo(), 'primario')),
    h('section', { class: 'perfil', style: casa ? `--casa:${casa.cor};--casa2:${casa.cor2}` : '' },
      h('div', { class: 'perfil-ret' }, imgFoto(s.aparencia.modelo ?? 'voce1', 'foto', C3.tintaDe('voce'))),
      h('div', { class: 'perfil-info' },
        h('h1', {}, s.nome),
        h('div', { class: 'titulo' }, personaliza(titulo(s.xp))),
        h('div', { class: 'linha-info' }, s.casa ? h('span', { html: brasao(s.casa, 22) }) : null, h('span', {}, `${casa ? casa.nome + ' · ' : ''}${Math.min(s.pos.ano + 1, 7)}º ano`)),
        h('div', { class: 'nivel' }, h('span', {}, `Nível ${n}`), h('div', { class: 'barra' }, h('div', { style: `width:${pct.toFixed(1)}%` })), h('span', { class: 'xp' }, `${s.xp} XP`)),
        h('div', { class: 'energia', title: 'Energia infinita' }, '⚡ Energia: ∞ (a Diretora vetou o paywall)'))),
    continuar,
    rk.length ? h('section', { class: 'placar' }, h('h3', {}, 'Taça das Casas'),
      ...rk.map(([c, v]) => h('div', { class: `placar-mini ${c === s.casa ? 'minha' : ''}` }, h('span', { html: brasao(c, 18) }), h('span', {}, CASA_INFO[c].nome), h('b', {}, String(v))))) : null,
    h('nav', { class: 'menu' }, ...menu.map(([ic, t, f]) => h('button', { class: 'menu-item', type: 'button', onclick: () => f() }, h('span', { class: 'ic' }, ic), h('span', {}, t)))),
  );
}

// ---------------------------------------------------------------- mapa e salas

const ICONE: Record<Lugar['cena'], string> = { castelo: '🏰', sala: '🚪', masmorra: '🕯️', floresta: '🌲', cidade: '🏘️', casa: '🏠', trem: '🚂', campo: '🏟️', torre: '📡', lago: '🌊', banco: '🏛️', ministerio: '🏢' };

function mapa() {
  const s = estado();
  const ls = lugaresVisiveis();
  tela('lista', cabecalho('Mapa do castelo'),
    h('p', { class: 'dica' }, 'Entre numa sala e use a varinha (o terminal). Feitiços que você já aprendeu revelam segredos.'),
    h('div', { class: 'grade' }, ...ls.map((l) => {
      const tot = l.segredos?.length ?? 0;
      const ach = (l.segredos ?? []).filter((_, i) => s.segredos.includes(`${l.id}#${i}`)).length;
      return h('button', { class: 'card', type: 'button', onclick: () => { estado().onde = l.id; salvar(); mundo(); } }, h('div', { class: 'ic grande' }, ICONE[l.cena]), h('b', {}, l.nome), tot ? h('small', {}, `segredos ${ach}/${tot}`) : h('small', {}, ' '));
    })));
}

// ---------------------------------------------------------------- coleções

function grimorio() {
  const s = estado();
  const todos = [...FEITICOS.values()];
  tela('lista', cabecalho('Grimório'), h('p', { class: 'dica' }, `${s.feiticos.length} de ${todos.length} feitiços. Cada feitiço é um comando de verdade.`),
    ...todos.map((f) => (s.feiticos.includes(f.id)
      ? h('div', { class: 'item' }, h('b', {}, f.nome), h('code', {}, f.comando), h('p', { html: fmt(f.descricao) }))
      : h('div', { class: 'item bloqueado' }, h('b', {}, '???'), h('p', {}, 'Feitiço ainda não aprendido.')))));
}

function bestiario() {
  const s = estado();
  const todos = [...CRIATURAS.values()];
  tela('lista', cabecalho('Bestiário'), h('p', { class: 'dica' }, `${s.criaturas.length} de ${todos.length} criaturas catalogadas pelo Baltazar.`),
    ...todos.map((c) => (s.criaturas.includes(c.id)
      ? h('div', { class: 'item' }, h('b', {}, c.nome), h('div', { class: 'perigo' }, `Perigo ${'☠'.repeat(c.perigo)}${'·'.repeat(5 - c.perigo)}`), h('p', { class: 'real' }, 'No mundo real: ' + c.real), h('p', { html: fmt(c.descricao) }), h('p', { class: 'defesa', html: '🛡️ ' + fmt(c.defesa) }))
      : h('div', { class: 'item bloqueado' }, h('b', {}, '???'), h('p', {}, 'Criatura ainda não encontrada.')))));
}

function album() {
  const s = estado();
  const todos = [...FIGURINHAS.values()];
  tela('lista', cabecalho('Álbum de figurinhas'), h('p', { class: 'dica' }, `${s.figurinhas.length} de ${todos.length}. Pessoas e marcos reais da computação. Sem figurinha repetida para trocar no recreio, sinto muito.`),
    h('div', { class: 'grade' }, ...todos.map((f) => (s.figurinhas.includes(f.id)
      ? h('div', { class: 'figurinha' }, h('div', { class: 'ano-fig' }, f.ano), h('b', {}, f.nome), h('p', { html: fmt(f.texto) }))
      : h('div', { class: 'figurinha bloqueado' }, h('div', { class: 'ano-fig' }, '?'), h('b', {}, 'Figurinha faltando'))))));
}

function malao() {
  const s = estado();
  const dorm = h('div', { class: 'dormitorio' });
  const desenhaDorm = () => {
    dorm.innerHTML = '';
    dorm.append(h('div', { class: 'cama' }, '🛏️'), ...s.enfeites.map((id) => h('span', { class: 'enfeite' }, ITENS.get(id)?.nome ?? id)));
    if (!s.enfeites.length) dorm.append(h('p', { class: 'dica' }, 'Dormitório pelado. Pendure alguma coisa do malão.'));
  };
  desenhaDorm();
  const itens = s.itens.map((id) => ITENS.get(id)).filter((x) => x);
  tela('lista', cabecalho('Malão e dormitório'), h('h3', {}, 'Seu canto no dormitório'), dorm, h('h3', {}, 'Malão'),
    itens.length ? null : h('p', { class: 'dica' }, 'Malão vazio. Só tem uma meia e um cabo USB que não serve em nada.'),
    ...itens.map((it) => {
      const b = botao(s.enfeites.includes(it!.id) ? 'Tirar do dormitório' : 'Enfeitar o dormitório', () => {
        const i = s.enfeites.indexOf(it!.id);
        if (i >= 0) s.enfeites.splice(i, 1);
        else s.enfeites.push(it!.id);
        salvar();
        malao();
      }, 'mini');
      return h('div', { class: 'item' }, h('b', {}, it!.nome), h('p', { html: fmt(it!.descricao) }), b);
    }));
}

function amizades() {
  const s = estado();
  const conhecidos = [...PERSONAGENS.values()].filter((p) => p.id in s.amizade);
  tela('lista', cabecalho('Amizades'), h('p', { class: 'dica' }, 'Suas escolhas mudam o quanto a galera confia em você. Ninguém aqui aceita convite para "mentoria paga".'),
    conhecidos.length ? null : h('p', {}, 'Ainda ninguém. Vai falar com alguém, nem que seja sobre o Wi-Fi.'),
    ...conhecidos.map((p) => {
      const v = s.amizade[p.id];
      const nv = nivelAmizade(v);
      return h('div', { class: 'item amigo' }, h('div', { class: 'mini-ret' }, imgFoto(p.id, 'foto', C3.tintaDe(p.id))),
        h('div', {}, h('b', { style: `color:${p.cor}` }, personaliza(p.nome)), h('div', { class: 'coracoes' }, '♥'.repeat(nv) + '♡'.repeat(4 - nv) + ' ' + personaliza(NIVEIS_AMIZADE[nv])), h('p', {}, personaliza(p.papel))));
    }));
}

function boletim() {
  const s = estado();
  const maxAt = Math.max(10, ...ATRIBUTOS.map((a) => s.atributos[a]));
  const NOMES: Record<string, string> = { sistemas: 'Sistemas', redes: 'Redes', cripto: 'Criptografia', web: 'Web', defesa: 'Defesa', forense: 'Forense', ofensiva: 'Ofensiva ética', social: 'Engenharia social' };
  const anos = ANOS.map((a, ai) => {
    const aulas = a.capitulos.flatMap((c) => c.passos.filter((p): p is PassoAula => p.tipo === 'aula'));
    const feitas = aulas.filter((x) => x.id in s.aulas);
    if (!feitas.length) return null;
    const taca = s.tacas[ai];
    return h('section', {}, h('h3', {}, `${a.numero}º ano: ${a.titulo}${taca ? ` · Taça: ${CASA_INFO[taca].nome}` : ''}`),
      ...feitas.map((x) => h('button', { class: 'linha-aula', type: 'button', onclick: () => revisarAula(app, x, a.numero) },
        h('span', {}, `${x.materia}: ${personaliza(x.titulo)}`), h('span', { class: 'estrelas' }, '★'.repeat(s.aulas[x.id]) + '☆'.repeat(3 - s.aulas[x.id])))));
  });
  tela('lista', cabecalho('Boletim'),
    h('section', {}, h('h3', {}, 'Atributos'), ...ATRIBUTOS.map((a) => h('div', { class: 'atributo' }, h('span', {}, NOMES[a]), h('div', { class: 'barra' }, h('div', { style: `width:${(s.atributos[a] / maxAt) * 100}%` })), h('b', {}, String(s.atributos[a]))))),
    h('p', { class: 'dica' }, 'Toque numa aula para refazer e tentar as três estrelas. Refazer não tem custo de energia, porque energia aqui é infinita.'),
    ...anos);
}

/** volume da música e dos efeitos, e o botão de silêncio */
function secaoSom() {
  const p = Som.preferencias();
  const barra = (rotulo: string, valor: number, muda: (v: number) => void) => {
    const inp = h('input', { type: 'range', min: '0', max: '100', value: String(Math.round(valor * 100)), 'aria-label': rotulo }) as HTMLInputElement;
    inp.addEventListener('input', () => muda(Number(inp.value) / 100));
    return h('label', { class: 'barra-som' }, rotulo, inp);
  };
  const mudo = botao(p.mudo ? 'Ligar o som' : 'Silenciar tudo', () => {
    const agora = !Som.preferencias().mudo;
    Som.ajustar({ mudo: agora });
    mudo.textContent = agora ? 'Ligar o som' : 'Silenciar tudo';
  }, 'secundario');
  return h('section', {}, h('h3', {}, 'Som'),
    barra('Música', p.musica, (v) => Som.ajustar({ musica: v })),
    barra('Efeitos e ambiente', p.efeitos, (v) => Som.ajustar({ efeitos: v })),
    mudo);
}

function ajustes() {
  const s = estado();
  const area = h('textarea', { readonly: true, rows: '4', 'aria-label': 'código de save' }) as HTMLTextAreaElement;
  area.value = exportar();
  const tamanhos: [string, string][] = [['16px', 'Normal'], ['18px', 'Grande'], ['20px', 'Enorme']];
  tela('lista', cabecalho('Ajustes'),
    h('section', {}, h('h3', {}, 'Tamanho do texto'), h('div', { class: 'grupo' }, ...tamanhos.map(([v, t]) => botao(t, () => {
      document.documentElement.style.fontSize = v;
      try {
        localStorage.setItem('paranapiacaba.fonte', v);
      } catch {
        /* nada */
      }
    }, 'chip')))),
    h('section', {}, h('h3', {}, 'Código de save'), h('p', { class: 'dica' }, 'Copie e guarde para continuar em outro aparelho. É o seu progresso inteiro, não compartilhe no grupo da família.'), area,
      botao('Copiar código', () => {
        navigator.clipboard?.writeText(area.value).then(() => aviso('Copiado.'), () => {
          area.select();
          aviso('Selecionei o código, copie com o menu do aparelho.');
        });
      }, 'secundario'),
      botao('Carregar outro código', () => {
        const c = prompt('Cole o código de save:');
        if (c && importar(c)) mundo();
        else if (c) alert('Código inválido.');
      }, 'secundario')),
    secaoSom(),
    h('section', {}, h('h3', {}, 'Aparência'), botao('Mudar aparência', () => trocarAparencia(), 'secundario')),
    h('section', {}, h('h3', {}, 'Partida'), h('p', {}, `${esc(s.nome)}, criada em ${new Date(s.criadoEm).toLocaleDateString('pt-BR')}.`),
      botao('Tela inicial', () => inicio(), 'secundario'),
      botao('Apagar partida', () => {
        if (confirm('Apagar a partida deste navegador? Sem o código de save, não tem volta. Nem com backup, porque o backup era você.')) {
          apagar();
          inicio();
        }
      }, 'perigo')),
    h('section', {}, h('h3', {}, 'Sobre'), h('p', {}, 'Paranapiacaba é um jogo livre e gratuito que ensina segurança cibernética do zero. Personagens e enredo são originais. Toda técnica ofensiva aparece só em laboratório autorizado, sempre junto da defesa.')),
  );
}

export { LUGARES };
