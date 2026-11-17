// Partida de Capturebol: você é o caçador do seu time, voando em vassoura-drone.
// Enigma certo = pacote no aro (10), Bola de Spam acerta = você fica tonto, Flag Dourada = 150 e fim.
import type { CasaId, Exercicio, PassoAula } from '../conteudo/tipos';
import { ANOS } from '../conteudo/index';
import { estado, salvar, CASAS } from '../motor/estado';
import { aplicar } from '../motor/progresso';
import { CASA_INFO } from '../motor/texto';
import * as Som from '../motor/som';
import * as C3 from '../tres/cena3d';
import { J, posicionar } from '../tres/jogador';
import { M } from '../tres/motor3d';
import { montarPartida } from '../tres/capturebol3d';
import { mostrarExercicio } from './exercicio';
import { aviso, botao, h } from './dom';

type Janela = (titulo: string, ...conteudo: Node[]) => { fechar: () => void };

const DURACAO = 180;
const corDe = (c: CasaId) => parseInt(CASA_INFO[c].cor.slice(1), 16);

function jaJogou(): boolean {
  const s = estado();
  return s.flags.includes(`capturebol:${s.pos.ano}:${s.pos.cap}`);
}

/** perguntas de múltipla escolha das aulas que você já fez (ou do seu ano, se ainda não fez nenhuma) */
function perguntas(): Exercicio[] {
  const s = estado();
  const aulas = ANOS.slice(0, s.pos.ano + 1).flatMap((a) => a.capitulos.flatMap((c) => c.passos.filter((p): p is PassoAula => p.tipo === 'aula')));
  const feitas = aulas.filter((a) => s.aulas[a.id] !== undefined);
  const base = (feitas.length >= 2 ? feitas : aulas).flatMap((a) => a.exercicios.filter((e) => e.tipo === 'multipla'));
  return base.sort(() => Math.random() - 0.5);
}

/** a Bia convida para um amistoso no campo */
export function conviteCapturebol(janela: Janela, app: HTMLElement, depois: () => void): void {
  const s = estado();
  const conteudo = h('div', { class: 'vila-loja' });
  const { fechar } = janela('Campo de Capturebol', conteudo);
  if (!s.casa) {
    conteudo.append(h('p', {}, 'Bia: Primeiro o Capacete te escolhe uma casa. Depois a gente te bota numa vassoura.'), botao('Tá bom', fechar, 'secundario'));
    return;
  }
  if (jaJogou()) {
    conteudo.append(h('p', {}, 'Bia: Já jogamos este fim de semana. Vassoura também precisa de recarga, e eu de gelo no ombro.'), botao('Tchau', fechar, 'secundario'));
    return;
  }
  conteudo.append(
    h('p', {}, 'Bia: Amistoso agora! Você vai de caçador: pega a Flag Dourada e acaba o jogo. Quando o time atacar, responde rápido para o pacote passar pelo firewall. E desvia das Bolas de Spam, que elas mordem.'),
    h('p', { class: 'dica' }, 'Computador: WASD voa, mouse mira, Shift acelera. Celular: joystick voa, arrastar mira.'),
    botao('Montar na vassoura', () => {
      fechar();
      void partida(app).then(depois);
    }, 'primario'),
    botao('Hoje não', fechar, 'secundario'),
  );
}

export async function partida(app: HTMLElement): Promise<void> {
  const s = estado();
  const minha = s.casa!;
  const rival = CASAS.filter((c) => c !== minha)[Math.floor(Math.random() * 3)];
  const campo = montarPartida(corDe(minha), corDe(rival));
  // quem passeava a pé sai do gramado durante o jogo (a torcida sentada fica)
  const andando = C3.C.figurantes.filter((f) => !f.sentado);
  andando.forEach((f) => (f.raiz.visible = false));
  Som.trocarClima('festa');
  let nos = 0;
  let eles = 0;
  let resto = DURACAO;
  let tonto = 0;
  let acabou = false;
  let ocupado = false;
  const fila = perguntas();

  // placar e avisos no alto da tela
  const placar = h('div', { class: 'capt-placar' });
  const msg = h('div', { class: 'capt-msg' });
  const painel = h('div', { class: 'capt-painel', hidden: true });
  const hud = h('div', { class: 'capt-hud' }, placar, msg, painel);
  app.append(hud);
  const desenha = () => {
    const m = Math.floor(resto / 60);
    const sg = Math.floor(resto % 60).toString().padStart(2, '0');
    placar.innerHTML = `<span style="color:${CASA_INFO[minha].cor}">${CASA_INFO[minha].nome} ${nos}</span> <b>${m}:${sg}</b> <span style="color:${CASA_INFO[rival].cor}">${eles} ${CASA_INFO[rival].nome}</span>`;
  };
  let msgTempo = 0;
  const diz = (t: string) => {
    msg.textContent = t;
    msg.classList.add('on');
    msgTempo = 3;
  };
  desenha();
  diz('Apito! A Flag Dourada vai aparecer a qualquer momento.');

  // voando: começa no meio do campo, alto
  posicionar(0, 24, 0, 1.2);
  J.pos.y = 6;
  J.voo = 3.2;
  J.livre = true;
  const velhoLimite = J.area?.limites;
  if (J.area) J.area.limites = [-17, 17, -29, 29];

  let proxAtaque = 14;
  let proxRival = 22;
  let proxSpam = 9;
  const flagEm = 55 + Math.random() * 60;

  const ataque = async () => {
    ocupado = true;
    J.livre = false;
    const ex = fila.shift();
    if (!ex) {
      ocupado = false;
      J.livre = true;
      return;
    }
    fila.push(ex);
    painel.hidden = false;
    painel.innerHTML = '';
    painel.append(h('div', { class: 'capt-titulo' }, 'Ataque! Responda para o pacote passar pelo firewall'));
    const alvo = h('div');
    painel.append(alvo);
    const ok = await mostrarExercicio(alvo, ex, { tempo: 20, rotuloContinuar: 'Lançar o pacote' });
    painel.hidden = true;
    J.livre = !acabou;
    ocupado = false;
    await campo.pacote(true, ok);
    if (acabou) return;
    if (ok) {
      nos += 10;
      Som.acerto();
      diz('Pacote dentro do aro! +10');
    } else {
      Som.erro();
      diz('O goleiro deles bloqueou o pacote.');
    }
    desenha();
  };

  await new Promise<void>((fim) => {
    // relógio real: com o jogo lento (celular fraco), a partida não se arrasta
    let antes = performance.now();
    const loop = () => {
      if (acabou) return;
      const agora = performance.now();
      const dt = Math.min(0.25, (agora - antes) / 1000);
      antes = agora;
      if (!ocupado) resto = Math.max(0, resto - dt);
      if (msgTempo > 0 && (msgTempo -= dt) <= 0) msg.classList.remove('on');
      // altura: sobe e desce suave, seguindo a flag quando ela está perto
      const alvoY = campo.flagAtiva && campo.distanciaFlag() < 18 ? campo.flag.position.y - 1.2 : 6 + Math.sin(performance.now() / 1400) * 0.6;
      J.pos.y += (alvoY - J.pos.y) * Math.min(1, dt * 1.6);
      if (tonto > 0) {
        tonto -= dt;
        M.camera.rotation.z = Math.sin(performance.now() / 60) * 0.06;
        if (tonto <= 0) {
          J.livre = !ocupado;
          M.camera.rotation.z = 0;
        }
      }
      if (!ocupado && tonto <= 0) {
        if ((proxAtaque -= dt) <= 0) {
          proxAtaque = 22 + Math.random() * 8;
          void ataque();
        }
        if ((proxRival -= dt) <= 0) {
          proxRival = 24 + Math.random() * 10;
          const entra = Math.random() < 0.55;
          void campo.pacote(false, entra).then(() => {
            if (acabou) return;
            if (entra) {
              eles += 10;
              diz(`${CASA_INFO[rival].nome} marcou. +10 para eles.`);
            } else diz('A Bia defendeu! O firewall segurou o pacote deles.');
            desenha();
          });
        }
        if ((proxSpam -= dt) <= 0) {
          proxSpam = 9 + Math.random() * 6;
          diz('Bola de Spam vindo! Sai da frente!');
          void campo.spam().then((acertou) => {
            if (acabou) return;
            if (acertou) {
              Som.feitico(false);
              tonto = 2;
              J.livre = false;
              diz('A Bola de Spam te acertou. Ninguém abre anexo assim...');
            } else diz('Desviou! Spam direto para a lixeira.');
          });
        }
      }
      if (!campo.flagAtiva && DURACAO - resto > flagEm) {
        campo.mostrarFlag();
        Som.brilho();
        diz('A FLAG DOURADA apareceu! Persegue!');
      }
      if (campo.flagAtiva && campo.distanciaFlag() < 2.4) {
        nos += 150;
        acabar(true);
        return;
      }
      if (resto <= 0) {
        eles += 150;
        acabar(false);
        return;
      }
      desenha();
    };
    const acabar = (pegou: boolean) => {
      acabou = true;
      M.atualizar.delete(loop);
      desenha();
      fim();
      Som.acerto();
      diz(pegou ? 'VOCÊ PEGOU A FLAG DOURADA! +150' : 'O caçador deles pegou a Flag Dourada.');
    };
    M.atualizar.add(loop);
  });

  // fim de jogo: resultado e volta para o chão
  J.livre = false;
  await new Promise((r) => setTimeout(r, 1800));
  const venceu = nos > eles;
  s.flags.push(`capturebol:${s.pos.ano}:${s.pos.cap}`);
  salvar();
  painel.hidden = false;
  painel.innerHTML = '';
  const ganhos = aplicar(venceu ? { xp: 40, pontosCasa: 30, amizade: { bia: 1 } } : { xp: 15, amizade: { bia: 1 } });
  await new Promise<void>((ok) => {
    painel.append(
      h('div', { class: 'resultado' }, h('h2', {}, venceu ? 'Vitória no Capturebol!' : 'Derrota com dignidade'),
        h('p', {}, `${CASA_INFO[minha].nome} ${nos} x ${eles} ${CASA_INFO[rival].nome}`),
        h('p', { class: 'dica' }, venceu ? 'A arquibancada canta o nome da sua casa. A Bia finge que não está emocionada.' : 'A Bia diz que foi culpa do vento. Não foi.')),
      botao('Descer da vassoura', () => ok(), 'primario'),
    );
  });
  aviso(ganhos);
  campo.encerrar();
  andando.forEach((f) => (f.raiz.visible = true));
  hud.remove();
  J.voo = 1;
  J.pos.y = 0;
  if (J.area && velhoLimite) J.area.limites = velhoLimite;
  const a = C3.C.area;
  if (a) {
    posicionar(a.entrada.x, a.entrada.z, a.entrada.yaw);
    Som.trocarClima(Som.somDoLugar(a.modelo).clima);
  }
  J.livre = true;
}
