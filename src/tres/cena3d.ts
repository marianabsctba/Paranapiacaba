// Orquestra o mundo 3D: troca de lugar, quem fala, aula, duelo e interação.
import * as THREE from 'three';
import type { CasaId, PassoAula } from '../conteudo/tipos';
import { LUGARES, PERSONAGENS } from '../conteudo/index';
import { estado, salvar, temPartida } from '../motor/estado';
import { CASA_INFO, personaliza } from '../motor/texto';
import { aplicarAmbiente, construir, modeloDoLugar, type Area } from './areas';
import { Humano, preCarregar } from './humanos';
import * as Som from '../motor/som';
import { montarEnfeites } from './enfeites';
import { M } from './motor3d';
import { J, OLHO, posicionar } from './jogador';
import { lousa as texLousa } from './texturas';
import { repetir } from './moveis';

export const C = {
  area: null as Area | null,
  lugarId: '',
  npcs: new Map<string, Humano>(),
  figurantes: [] as Humano[],
  portas: [] as THREE.Object3D[],
};

const AMIGOS = ['tati', 'caua', 'bia', 'jonas'];
const CASAS: CasaId[] = ['oncarina', 'tucanal', 'capivarias', 'jararacas'];

function corCasa(c: CasaId) {
  return new THREE.Color(CASA_INFO[c].cor).getHex();
}

// escolas visitantes do torneio (ano 4): gravata na cor da escola
export const ESCOLAS: Record<'pampa' | 'sertao', { nome: string; cor: number }> = {
  pampa: { nome: 'Pampa Digital', cor: 0x7cc5db },
  sertao: { nome: 'Academia do Sertão', cor: 0xe0b45a },
};
function escolaDe(id: string): 'pampa' | 'sertao' | null {
  const papel = PERSONAGENS.get(id)?.papel ?? '';
  return /pampa/i.test(papel) ? 'pampa' : /sert[aã]o/i.test(papel) ? 'sertao' : null;
}

/** cor da gravata de cada aluno: a casa, ou a escola de quem vem de fora */
export function tintaDe(id: string): number | undefined {
  if (!temPartida()) return undefined;
  const minha = estado().casa ?? 'capivarias';
  if (id === 'voce') return estado().casa ? corCasa(minha) : 0xd9a520;
  if (AMIGOS.includes(id)) return corCasa(minha);
  if (id === 'enzo') return corCasa(minha === 'jararacas' ? 'oncarina' : 'jararacas');
  const m = /^aluno(\d)$/.exec(id);
  if (m) return corCasa(CASAS[Number(m[1]) % 4]);
  const esc = escolaDe(id);
  if (esc) return ESCOLAS[esc].cor;
  return undefined;
}

function fade(ligar: boolean) {
  const f = document.getElementById('fade');
  if (f) f.classList.toggle('on', ligar);
  return new Promise((r) => setTimeout(r, ligar ? 280 : 10));
}

function descartar(o: THREE.Object3D) {
  o.traverse((x) => {
    const me = x as THREE.Mesh;
    if (me.isMesh && !me.userData.compartilhado) me.geometry?.dispose();
  });
  o.removeFromParent();
}

function marcadorPorta(x: number, z: number, rotulo: string, destino?: string) {
  const g = new THREE.Group();
  const acao = destino?.startsWith('acao:');
  if (acao) {
    // ação dentro do lugar (malão, balcão): só um brilho pequeno, não um arco de porta
    const brilho = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xf2c45a, emissiveIntensity: 2.5 }));
    brilho.position.y = 0.95;
    g.add(brilho);
  } else {
    const arco = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.04, 8, 32, Math.PI), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xf2c45a, emissiveIntensity: 2.2 }));
    arco.position.y = 1.6;
    g.add(arco);
  }
  const alvo = new THREE.Mesh(acao ? new THREE.BoxGeometry(0.7, 1.2, 0.7) : new THREE.BoxGeometry(1.4, 2.2, 0.3), new THREE.MeshBasicMaterial({ visible: false }));
  alvo.position.y = acao ? 0.6 : 1.1;
  g.add(alvo);
  g.position.set(x, 0, z);
  g.userData.porta = rotulo;
  alvo.userData.porta = rotulo;
  g.userData.destino = destino;
  alvo.userData.destino = destino;
  return g;
}

/** o malão mudou: refaz os enfeites do dormitório se você estiver nele */
export function atualizarEnfeites() {
  if (C.area?.modelo === 'dormitorio') montarEnfeites(C.area.grupo, tintaDe('voce') ?? 0xd9a520);
}

/** depois de uma cena da história, o lugar é remontado no modo normal (sem a montagem da cena) */
export function remontar() {
  C.lugarId = '';
}

export async function irPara(lugarId: string, ambiente = false): Promise<void> {
  if (C.lugarId === lugarId && C.area) return;
  if (C.area) Som.porta();
  await fade(true);
  if (C.area) descartar(C.area.grupo);
  for (const h of [...C.npcs.values(), ...C.figurantes]) h.raiz.removeFromParent();
  C.npcs.clear();
  C.figurantes = [];
  C.portas = [];
  const l = LUGARES.get(lugarId);
  const a = construir(modeloDoLugar(l));
  // cada luz pontual encarece todas as superfícies: no máximo 4 (2 no modo leve); as outras lâmpadas só brilham
  const pontos: THREE.PointLight[] = [];
  a.grupo.traverse((o) => {
    if ((o as THREE.PointLight).isPointLight) pontos.push(o as THREE.PointLight);
  });
  pontos.sort((p, q) => q.intensity - p.intensity).slice(M.qualidade === 'alta' ? 4 : 2).forEach((p) => p.removeFromParent());
  M.cena.add(a.grupo);
  M.atualizarSombra = true;
  aplicarAmbiente(a);
  for (const p of a.portas) {
    const m = marcadorPorta(p.x, p.z, p.rotulo, p.destino);
    a.grupo.add(m);
    C.portas.push(m);
  }
  // quem já está no lugar (atendente, dono da loja)
  for (const p of a.gente ?? []) {
    const h = new Humano(p.id, tintaDe(p.id));
    h.raiz.position.set(p.x, 0, p.z);
    h.olharPara(p.x + Math.sin(p.ry), p.z + Math.cos(p.ry), true);
    h.raiz.userData.travado = true;
    a.grupo.add(h.raiz);
    C.npcs.set(p.id, h);
  }
  C.area = a;
  C.lugarId = lugarId;
  if (a.modelo === 'dormitorio') montarEnfeites(a.grupo, tintaDe('voce') ?? 0xd9a520);
  const som = Som.somDoLugar(a.modelo);
  Som.trocarClima(som.clima);
  Som.trocarAmbiente(som.ambiente);
  Som.chao(som.chao);
  J.area = a;
  posicionar(a.entrada.x, a.entrada.z, a.entrada.yaw);
  if (temPartida()) {
    const s = estado();
    s.onde = lugarId;
    if (l && !s.lugares.includes(lugarId)) s.lugares.push(lugarId);
    salvar();
  }
  encenado = '';
  feitos.clear();
  if (ambiente) {
    povoar(a);
    await encenar(momentoDoLugar());
  }
  await fade(false);
}

/** alunos andando pelo lugar quando não tem cena acontecendo */
function povoar(a: Area) {
  if (!['patio', 'salao', 'biblioteca', 'aula', 'campo', 'cidade', 'vila'].includes(a.modelo)) return;
  const ids = ['aluno1', 'aluno2', 'aluno3', 'aluno4'];
  const [x0, x1, z0, z1] = a.limites;
  const livre = (x: number, z: number) => !a.obstaculos.some(([ax0, ax1, az0, az1]) => x > ax0 - 0.6 && x < ax1 + 0.6 && z > az0 - 0.6 && z < az1 + 0.6);
  // o caminho inteiro precisa estar livre, não só o destino (senão atravessam as mesas)
  // ninguém passa por dentro de você: o caminho mantém distância da sua posição
  const longeDeVoce = (x: number, z: number) => Math.hypot(x - J.pos.x, z - J.pos.z) > 1.1;
  const caminhoLivre = (ax: number, az: number, bx: number, bz: number) => {
    const n = Math.ceil(Math.hypot(bx - ax, bz - az) / 0.25);
    for (let i = 0; i <= n; i++) {
      const x = ax + ((bx - ax) * i) / n;
      const z = az + ((bz - az) * i) / n;
      if (!livre(x, z) || (i > 0 && !longeDeVoce(x, z))) return false;
    }
    return true;
  };
  const ponto = (de?: { x: number; z: number }) => {
    for (let i = 0; i < 60; i++) {
      const x = x0 + 0.8 + Math.random() * (x1 - x0 - 1.6);
      const z = z0 + 0.8 + Math.random() * (z1 - z0 - 1.6);
      if (livre(x, z) && longeDeVoce(x, z) && (!de || caminhoLivre(de.x, de.z, x, z))) return { x, z };
    }
    return de ?? { x: 0, z: 0 };
  };
  for (const id of ids) {
    const h = new Humano(id, tintaDe(id));
    const p = ponto();
    h.raiz.position.set(p.x, 0, p.z);
    a.grupo.add(h.raiz);
    C.figurantes.push(h);
    const passear = async () => {
      while (h.raiz.parent) {
        await h.irPara([ponto({ x: h.raiz.position.x, z: h.raiz.position.z })], 0.9 + Math.random() * 0.4);
        h.tocar(Math.random() > 0.5 ? 'falando' : 'parado');
        await new Promise((r) => setTimeout(r, 2000 + Math.random() * 5000));
      }
    };
    h.pronto.then(passear);
  }
}

const ultimaFala = new Map<string, number>();

/** acha um lugar livre num arco à sua frente: longe das outras pessoas, dos móveis e das paredes */
function lugarLivre(a: Area): { x: number; z: number } | null {
  const ocupados = [...C.npcs.values(), ...C.figurantes].map((h) => h.raiz.position);
  const [x0, x1, z0, z1] = a.limitesNpc ?? a.limites;
  const obst = [...a.obstaculos, ...(a.obstaculosNpc ?? [])];
  const fx = -Math.sin(a.entrada.yaw);
  const fz = -Math.cos(a.entrada.yaw);
  const ok = (x: number, z: number) =>
    x > x0 + 0.2 && x < x1 - 0.2 && z > z0 + 0.2 && z < z1 - 0.2 &&
    !obst.some(([ax0, ax1, az0, az1]) => x > ax0 - 0.35 && x < ax1 + 0.35 && z > az0 - 0.35 && z < az1 + 0.35) &&
    ocupados.every((p) => Math.hypot(p.x - x, p.z - z) > 0.8) &&
    Math.hypot(x - J.pos.x, z - J.pos.z) > 1.2;
  for (const r of [2.0, 2.6, 1.6, 3.2, 3.9, 4.6])
    for (const ang of [0, 0.32, -0.32, 0.62, -0.62, 0.92, -0.92, 1.2, -1.2]) {
      const c = Math.cos(ang);
      const s = Math.sin(ang);
      const x = J.pos.x + (fx * c - fz * s) * r;
      const z = J.pos.z + (fx * s + fz * c) * r;
      if (ok(x, z)) return { x, z };
    }
  return null;
}

/** garante a pessoa em cena, num lugar livre à sua frente, virada para você */
export async function falante(id: string): Promise<Humano | null> {
  if (id === 'voce' || id === 'narrador' || !C.area) return null;
  ultimaFala.set(id, performance.now());
  let h = C.npcs.get(id);
  if (!h) {
    h = new Humano(id, tintaDe(id));
    let p = lugarLivre(C.area);
    while (!p && C.npcs.size) {
      // sem espaço: quem está calado há mais tempo sai de cena
      const sai = [...C.npcs.entries()].filter(([, n]) => !n.raiz.userData.travado).sort((a, b) => (ultimaFala.get(a[0]) ?? 0) - (ultimaFala.get(b[0]) ?? 0))[0];
      if (!sai) break;
      sai[1].raiz.removeFromParent();
      C.npcs.delete(sai[0]);
      p = lugarLivre(C.area);
    }
    p ??= C.area.palco[C.npcs.size % C.area.palco.length];
    h.raiz.position.set(p.x, 0, p.z);
    h.olharPara(J.pos.x, J.pos.z, true);
    C.area.grupo.add(h.raiz);
    C.npcs.set(id, h);
    await Promise.race([h.pronto, new Promise((r) => setTimeout(r, 8000))]);
  }
  return h;
}

/** cara que combina com a fala: riso, espanto, tristeza ou irritação; o resto fala com um sorriso leve */
const VILOES = ['nulo', 'a1_dalva', 'deputado'];
export function emocaoDaFala(id: string, texto: string): ['sorriso' | 'surpresa' | 'bravo' | 'triste' | 'neutro', number] {
  const t = texto.toLowerCase();
  if (/k{3,}|haha|hehe|\brs\b|😂|🤣/.test(t)) return ['sorriso', 1];
  if (/desculp|sinto muito|perdi|saudade|chor|triste|morreu|sozinh/.test(t)) return ['triste', 0.75];
  if (/droga|chega!|cala a boca|idiota|absurdo|inaceitável|como ousa|não acredito/.test(t)) return ['bravo', 0.7];
  if (/!/.test(t) && /\?|!!|o quê|como assim|sério|meu deus|nossa/.test(t)) return ['surpresa', 0.7];
  if (VILOES.includes(id)) return ['bravo', 0.3];
  return ['sorriso', /!/.test(t) ? 0.55 : 0.3];
}

export async function foco(id: string, texto = '') {
  const h = await falante(id);
  if (h && texto) h.expressao(...emocaoDaFala(id, texto));
  for (const n of C.npcs.values()) {
    if (n.raiz.userData.travado) continue;
    n.tocar(n === h ? 'falando' : 'parado');
    n.olharPara(h && n !== h ? h.raiz.position.x : J.pos.x, h && n !== h ? h.raiz.position.z : J.pos.z);
  }
  if (h) {
    h.olharPara(J.pos.x, J.pos.z);
    J.alvoOlhar = h.cabeca();
  }
}

/** quem não fala mais no capítulo sai de cena quando muda o lugar; aqui só para de falar */
export function silencio() {
  for (const n of C.npcs.values()) if (!n.raiz.userData.travado) n.tocar('parado');
}

function textoLimpo(s: string) {
  return personaliza(s).replace(/\*\*/g, '').replace(/`/g, '');
}

export async function modoAula(p: PassoAula) {
  const a = C.area;
  if (!a) return;
  const prof = await falante(p.professor);
  if (prof && a.professor) {
    prof.raiz.position.set(a.professor.x, 0, a.professor.z);
    prof.raiz.userData.travado = true;
  }
  if (a.lousa) {
    const frases = p.explicacao.slice(0, 3).map((t) => textoLimpo(t).split(/(?<=[.!?])\s/)[0]);
    const mat = a.lousa.material as THREE.MeshStandardMaterial;
    mat.map?.dispose();
    mat.map = texLousa(textoLimpo(p.titulo), frases);
    mat.needsUpdate = true;
  }
  await encenar('aula');
  if (a.assento) {
    posicionar(a.assento.x, a.assento.z, a.assento.yaw, 1.08);
    J.alvoOlhar = a.lousa ? a.lousa.getWorldPosition(new THREE.Vector3()).setY(1.9) : prof?.cabeca() ?? null;
  } else if (prof) J.alvoOlhar = prof.cabeca();
  prof?.olharPara(J.pos.x, J.pos.z);
  prof?.tocar('falando');
}

export function fimAula() {
  const a = C.area;
  if (!a) return;
  for (const n of C.npcs.values()) n.raiz.userData.travado = false;
  posicionar(a.entrada.x, a.entrada.z, a.entrada.yaw);
}

export async function modoDuelo(oponente: string): Promise<Humano | null> {
  const a = C.area;
  if (!a) return null;
  const h = await falante(oponente);
  Som.trocarClima('duelo');
  const y = a.duelo?.y ?? 0;
  const eu = a.duelo?.voce ?? a.entrada;
  posicionar(eu.x, eu.z, eu.yaw, OLHO + y);
  const fx = -Math.sin(eu.yaw);
  const fz = -Math.cos(eu.yaw);
  const [x0, x1, z0, z1] = a.limitesNpc ?? a.limites;
  const obst = [...a.obstaculos, ...(a.obstaculosNpc ?? [])];
  const livre = (x: number, z: number) =>
    x > x0 + 0.3 && x < x1 - 0.3 && z > z0 + 0.3 && z < z1 - 0.3 &&
    !obst.some(([ax0, ax1, az0, az1]) => x > ax0 - 0.4 && x < ax1 + 0.4 && z > az0 - 0.4 && z < az1 + 0.4);
  // o oponente fica de frente, na maior distância livre até 4,2 m
  let op = a.duelo?.oponente;
  if (!op) {
    const d = [4.2, 3.6, 3, 2.4].find((r) => livre(eu.x + fx * r, eu.z + fz * r)) ?? 2.4;
    op = { x: eu.x + fx * d, z: eu.z + fz * d };
  }
  // quem estiver no caminho do feitiço vai para a lateral, assistindo
  const mx = (eu.x + op.x) / 2;
  const mz = (eu.z + op.z) / 2;
  let lado = 1;
  for (const n of C.npcs.values()) {
    if (n === h) continue;
    const p = n.raiz.position;
    const t = Math.max(0, Math.min(1, ((p.x - eu.x) * (op.x - eu.x) + (p.z - eu.z) * (op.z - eu.z)) / ((op.x - eu.x) ** 2 + (op.z - eu.z) ** 2 || 1)));
    const perto = Math.hypot(p.x - (eu.x + (op.x - eu.x) * t), p.z - (eu.z + (op.z - eu.z) * t));
    if (perto > 1.3) continue;
    const nx = Math.min(x1 - 0.3, Math.max(x0 + 0.3, mx - fz * 2 * lado));
    const nz = Math.min(z1 - 0.3, Math.max(z0 + 0.3, mz + fx * 2 * lado));
    p.set(nx, 0, nz);
    n.olharPara(mx, mz, true);
    lado = -lado;
  }
  if (h) {
    h.expressao('bravo', 0.6);
    h.raiz.position.set(op.x, y, op.z);
    h.raiz.userData.travado = true;
    h.olharPara(J.pos.x, J.pos.z, true);
    h.tocar('feitico');
    // no computador o painel do duelo fica à direita: a câmera mira ao lado para o oponente aparecer à esquerda
    const alvo = h.cabeca();
    if (innerWidth > innerHeight * 1.2) {
      const d = Math.hypot(alvo.x - eu.x, alvo.z - eu.z);
      alvo.x += Math.cos(eu.yaw) * d * 0.42;
      alvo.z += -Math.sin(eu.yaw) * d * 0.42;
    }
    J.alvoOlhar = alvo;
  }
  return h;
}

export function fimDuelo(oponente: string) {
  if (C.area) Som.trocarClima(Som.somDoLugar(C.area.modelo).clima);
  const h = C.npcs.get(oponente);
  if (h) {
    h.raiz.userData.travado = false;
    h.tocar('parado');
  }
}

/** raio de feitiço: ida (você acerta) ou volta (você leva) */
export function raio(ida: boolean, oponente: string): Promise<void> {
  const h = C.npcs.get(oponente);
  if (!h) return Promise.resolve();
  const de = new THREE.Vector3(0.28, -0.25, -0.6).applyQuaternion(M.camera.quaternion).add(M.camera.position);
  const ate = h.cabeca().setY(h.raiz.position.y + h.altura * 0.6);
  // o feitiço do oponente para um palmo antes do seu rosto (senão a bola enche a tela)
  const naCara = new THREE.Vector3(0, -0.12, -0.7).applyQuaternion(M.camera.quaternion).add(M.camera.position);
  const [a, b] = ida ? [de, ate] : [ate, naCara];
  const cor = ida ? 0x7df9ff : 0xff3d5a;
  Som.feitico(ida);
  const bola = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), new THREE.MeshBasicMaterial({ color: cor }));
  const rastro: THREE.Mesh[] = [];
  M.cena.add(bola);
  // pelo relógio, não por quadro: com o jogo lento o feitiço não se arrasta
  const inicio = performance.now();
  return new Promise((fim) => {
    const f = () => {
      const t = (performance.now() - inicio) / 450;
      const p = a.clone().lerp(b, Math.min(1, t));
      p.y += Math.sin(Math.min(1, t) * Math.PI) * 0.25;
      bola.position.copy(p);
      if (rastro.length < 14) {
        const r = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0.6 }));
        r.position.copy(p);
        M.cena.add(r);
        rastro.push(r);
      }
      rastro.forEach((r) => ((r.material as THREE.MeshBasicMaterial).opacity *= 0.9));
      if (t >= 1) {
        M.atualizar.delete(f);
        bola.removeFromParent();
        rastro.forEach((r) => r.removeFromParent());
        if (ida) {
          h.tocar('apanhando', 0.1);
          setTimeout(() => h.tocar('feitico'), 900);
        } else {
          const fl = document.getElementById('fade');
          fl?.classList.add('dano');
          setTimeout(() => fl?.classList.remove('dano'), 300);
        }
        fim();
      }
    };
    M.atualizar.add(f);
  });
}

// vitrine da matrícula: a aparência escolhida em pé na sua frente
let vitrineH: Humano | null = null;
export async function vitrine(id: string | null, tinta?: number) {
  vitrineH?.raiz.removeFromParent();
  vitrineH = null;
  const a = C.area;
  if (!id || !a) return;
  const h = new Humano(id, tinta);
  const x = a.entrada.x;
  const z = a.entrada.z - 1.9;
  h.raiz.position.set(x, 0, z);
  a.grupo.add(h.raiz);
  vitrineH = h;
  await Promise.race([h.pronto, new Promise((ok) => setTimeout(ok, 10000))]);
  if (vitrineH !== h) return;
  const estreito = innerWidth < innerHeight;
  // no computador a ficha fica à esquerda, então a câmera mira um pouco ao lado para a pessoa aparecer à direita
  J.alvoOlhar = new THREE.Vector3(estreito ? x : x - 0.55, h.altura * (estreito ? 0.3 : 0.6), z);
}

M.atualizar.add((dt, t) => {
  if (vitrineH) {
    vitrineH.update(dt);
    vitrineH.raiz.rotation.y = Math.sin(t * 0.45) * 0.55;
  }
  for (const h of C.npcs.values()) h.update(dt);
  for (const h of C.figurantes) h.update(dt);
  C.area?.atualizar?.(dt, M.relogio.elapsedTime);
});

// ---------------------------------------------------------------- interação (modo livre)

const ray = new THREE.Raycaster();
const centro = new THREE.Vector2(0, 0);
export type Alvo = { tipo: 'npc'; h: Humano } | { tipo: 'porta'; rotulo: string; destino?: string } | null;

export function alvoNaMira(): Alvo {
  if (!C.area) return null;
  ray.setFromCamera(centro, M.camera);
  ray.far = 3.2;
  const cand: THREE.Object3D[] = [...C.portas, ...[...C.npcs.values(), ...C.figurantes].map((h) => h.raiz)];
  const hit = ray.intersectObjects(cand, true)[0];
  let o: THREE.Object3D | null = hit?.object ?? null;
  while (o) {
    if (o.userData.porta) return { tipo: 'porta', rotulo: o.userData.porta, destino: o.userData.destino };
    if (o.userData.humano) return { tipo: 'npc', h: o.userData.humano as Humano };
    o = o.parent;
  }
  // o raio às vezes atravessa a malha animada; vale quem estiver perto e bem na frente (ajuda no celular)
  const cam = M.camera.position;
  const frente = M.camera.getWorldDirection(VMIRA);
  let melhor: Humano | null = null;
  let melhorAng = 0.3;
  for (const h of [...C.npcs.values(), ...C.figurantes]) {
    const alvo = h.cabeca().sub(cam);
    alvo.y -= 0.3;
    const d = alvo.length();
    if (d > 3.2 || d < 0.3) continue;
    const ang = alvo.normalize().angleTo(frente);
    if (ang < melhorAng) {
      melhorAng = ang;
      melhor = h;
    }
  }
  return melhor ? { tipo: 'npc', h: melhor } : null;
}
const VMIRA = new THREE.Vector3();

export function preCarregarElenco() {
  preCarregar(['tati', 'caua', 'bia', 'jonas', 'enzo', 'vo_cida', 'baltazar', 'iolanda', 'otavio', 'aluno1', 'aluno2', 'aluno3', 'aluno4']);
}

// ---------------------------------------------------------------- encenação (lugar cheio de gente)

export type Momento = 'aula' | 'banquete' | 'selecao' | 'trem' | 'plateia';
let encenado = '';
const feitos = new Set<Momento>();
const ROSTOS = ['aluno1', 'aluno2', 'aluno3', 'aluno4', 'voce1', 'voce2', 'voce3', 'voce4', 'voce5', 'voce6', 'voce7', 'voce8'];

function sentar(id: string, p: { x: number; z: number; ry: number; y?: number }, tinta?: number) {
  const a = C.area!;
  const h = new Humano(id, tinta);
  h.sentado = true;
  h.raiz.position.set(p.x, p.y ?? 0, p.z);
  h.raiz.rotation.y = p.ry;
  h.raiz.userData.travado = true;
  a.grupo.add(h.raiz);
  C.figurantes.push(h);
  h.pronto.then(() => {
    h.tocar('parado', 0);
    h.update(Math.random() * 3);
  });
  return h;
}

/** enche o lugar de gente conforme o momento da história (idempotente por lugar e momento) */
export async function encenar(momento: Momento | null) {
  const a = C.area;
  if (!a || !momento || !temPartida()) return;
  const chave = `${C.lugarId}:${momento}`;
  if (encenado === chave) return;
  encenado = chave;
  const jaTemBanquete = feitos.has('banquete');
  feitos.add(momento);
  const s = estado();
  const meu = s.aparencia.modelo;
  const rostos = ROSTOS.filter((r) => r !== meu);
  const leve = M.qualidade === 'baixa';
  let k = 0;
  const proximo = () => rostos[k++ % rostos.length];
  if (momento === 'aula' && a.assentos) {
    const amigos = ['tati', 'caua', 'bia', 'jonas'];
    a.assentos.slice(0, leve ? 5 : 9).forEach((p, i) => sentar(i < amigos.length ? amigos[i] : proximo(), p, tintaDe(i < amigos.length ? amigos[i] : 'aluno1')));
  }
  if ((momento === 'banquete' || (momento === 'selecao' && !jaTemBanquete)) && a.assentos) {
    // espalha alunos pelas quatro mesas, cada mesa com a gravata da sua casa
    const porMesa = leve ? 2 : 5;
    for (let casa = 0; casa < 4; casa++) {
      const lugares = a.assentos.filter((p) => p.casa === casa);
      for (let i = 0; i < porMesa; i++) sentar(proximo(), lugares[(i * 3 + casa) % lugares.length], corCasa(CASAS[casa]));
    }
  }
  if (momento === 'selecao') {
    // mesa alta dos professores no fundo, o Capacete no banquinho e os calouros na frente
    const profs = ['iolanda', 'otavio', 'ruth', 'heitor', 'nanda'];
    profs.forEach((id, i) => {
      const h = new Humano(id);
      h.raiz.position.set(-3 + i * 1.5, 0, -14.6);
      h.olharPara(0, 0, true);
      h.raiz.userData.travado = true;
      a.grupo.add(h.raiz);
      C.npcs.set(id, h);
    });
    repetir(a.grupo, 'dining_table', [-2.2, 0, 2.2].map((x) => ({ x, z: -13.9 })), { alt: 0.78 });
    const cap = new Humano('chapeu');
    cap.raiz.position.set(0, 0, -10.4);
    cap.olharPara(0, 0, true);
    cap.raiz.userData.travado = true;
    a.grupo.add(cap.raiz);
    C.npcs.set('chapeu', cap);
    const calouros = ['tati', 'caua', 'bia', 'jonas', 'enzo'];
    calouros.forEach((id, i) => {
      const h = new Humano(id, tintaDe(id));
      // meia-lua ao seu lado, todo mundo olhando para o Capacete
      const lugar = [[-1.3, -7.3], [-2.2, -6.7], [1.3, -7.3], [2.2, -6.7], [2.9, -6.0]][i];
      h.raiz.position.set(lugar[0], 0, lugar[1]);
      h.olharPara(0, -10.4, true);
      a.grupo.add(h.raiz);
      C.npcs.set(id, h);
    });
    posicionar(0, -6.6, 0);
    J.alvoOlhar = new THREE.Vector3(0, 0.95, -10.4);
  }
  if (momento === 'plateia' && a.assentos) {
    // arquibancada do Clube de Duelos: gente das quatro casas torcendo
    // na Arena das Bandeiras a torcida mistura as quatro casas com as duas escolas visitantes
    const cores = a.modelo === 'arena' ? [...CASAS.map(corCasa), ESCOLAS.pampa.cor, ESCOLAS.sertao.cor] : CASAS.map(corCasa);
    a.assentos.filter((_, i) => i % 2 === 0 || !leve).slice(0, leve ? 5 : 12).forEach((p, i) => sentar(proximo(), p, cores[i % cores.length]));
  }
  if (momento === 'trem' && a.assentos) {
    a.assentos.filter((_, i) => i % 3 !== 1).slice(0, leve ? 4 : 8).forEach((p) => sentar(proximo(), p, tintaDe('aluno' + (1 + (k % 4)))));
  }
}

/** momento que combina com o lugar quando não há indicação da história */
export function momentoDoLugar(): Momento | null {
  const m = C.area?.modelo;
  return m === 'salao' ? 'banquete' : m === 'trem' ? 'trem' : m === 'clube' || m === 'vagao' || m === 'arena' || m === 'campo' ? 'plateia' : null;
}
