// Orquestra o mundo 3D: troca de lugar, quem fala, aula, duelo e interação.
import * as THREE from 'three';
import type { CasaId, PassoAula } from '../conteudo/tipos';
import { LUGARES } from '../conteudo/index';
import { estado, salvar, temPartida } from '../motor/estado';
import { CASA_INFO, personaliza } from '../motor/texto';
import { aplicarAmbiente, construir, modeloDoLugar, type Area } from './areas';
import { Humano, preCarregar } from './humanos';
import { M } from './motor3d';
import { J, OLHO, posicionar } from './jogador';
import { lousa as texLousa } from './texturas';

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

/** casa de cada aluno, para pintar a capa e o cachecol */
export function tintaDe(id: string): number | undefined {
  if (!temPartida()) return undefined;
  const minha = estado().casa ?? 'capivarias';
  if (id === 'voce') return estado().casa ? corCasa(minha) : 0xd9a520;
  if (AMIGOS.includes(id)) return corCasa(minha);
  if (id === 'enzo') return corCasa(minha === 'jararacas' ? 'oncarina' : 'jararacas');
  const m = /^aluno(\d)$/.exec(id);
  if (m) return corCasa(CASAS[Number(m[1]) % 4]);
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

function marcadorPorta(x: number, z: number, rotulo: string) {
  const g = new THREE.Group();
  const arco = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.04, 8, 32, Math.PI), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xf2c45a, emissiveIntensity: 2.2 }));
  arco.position.y = 1.6;
  g.add(arco);
  const alvo = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 0.3), new THREE.MeshBasicMaterial({ visible: false }));
  alvo.position.y = 1.1;
  g.add(alvo);
  g.position.set(x, 0, z);
  g.userData.porta = rotulo;
  alvo.userData.porta = rotulo;
  return g;
}

export async function irPara(lugarId: string, ambiente = false): Promise<void> {
  if (C.lugarId === lugarId && C.area) return;
  await fade(true);
  if (C.area) descartar(C.area.grupo);
  for (const h of [...C.npcs.values(), ...C.figurantes]) h.raiz.removeFromParent();
  C.npcs.clear();
  C.figurantes = [];
  C.portas = [];
  const l = LUGARES.get(lugarId);
  const a = construir(modeloDoLugar(l));
  M.cena.add(a.grupo);
  aplicarAmbiente(a);
  for (const p of a.portas) {
    const m = marcadorPorta(p.x, p.z, p.rotulo);
    a.grupo.add(m);
    C.portas.push(m);
  }
  C.area = a;
  C.lugarId = lugarId;
  J.area = a;
  posicionar(a.entrada.x, a.entrada.z, a.entrada.yaw);
  if (temPartida()) {
    const s = estado();
    s.onde = lugarId;
    if (l && !s.lugares.includes(lugarId)) s.lugares.push(lugarId);
    salvar();
  }
  if (ambiente) povoar(a);
  await fade(false);
}

/** alunos andando pelo lugar quando não tem cena acontecendo */
function povoar(a: Area) {
  if (!['patio', 'salao', 'biblioteca', 'aula', 'campo', 'cidade'].includes(a.modelo)) return;
  const ids = ['aluno1', 'aluno2', 'aluno3', 'aluno4'];
  const [x0, x1, z0, z1] = a.limites;
  const livre = (x: number, z: number) => !a.obstaculos.some(([ax0, ax1, az0, az1]) => x > ax0 - 0.6 && x < ax1 + 0.6 && z > az0 - 0.6 && z < az1 + 0.6);
  const ponto = () => {
    for (let i = 0; i < 20; i++) {
      const x = x0 + 0.8 + Math.random() * (x1 - x0 - 1.6);
      const z = z0 + 0.8 + Math.random() * (z1 - z0 - 1.6);
      if (livre(x, z)) return { x, z };
    }
    return { x: 0, z: 0 };
  };
  for (const id of ids) {
    const h = new Humano(id, tintaDe(id));
    const p = ponto();
    h.raiz.position.set(p.x, 0, p.z);
    a.grupo.add(h.raiz);
    C.figurantes.push(h);
    const passear = async () => {
      while (h.raiz.parent) {
        await h.irPara([ponto()], 0.9 + Math.random() * 0.4);
        h.tocar(Math.random() > 0.5 ? 'falando' : 'parado');
        await new Promise((r) => setTimeout(r, 2000 + Math.random() * 5000));
      }
    };
    h.pronto.then(passear);
  }
}

let slot = 0;
/** garante a pessoa em cena, num dos lugares do palco, virada para você */
export async function falante(id: string): Promise<Humano | null> {
  if (id === 'voce' || id === 'narrador' || !C.area) return null;
  let h = C.npcs.get(id);
  if (!h) {
    h = new Humano(id, tintaDe(id));
    const p = C.area.palco[slot++ % C.area.palco.length];
    h.raiz.position.set(p.x, 0, p.z);
    h.olharPara(J.pos.x, J.pos.z, true);
    C.area.grupo.add(h.raiz);
    C.npcs.set(id, h);
    await Promise.race([h.pronto, new Promise((r) => setTimeout(r, 8000))]);
  }
  return h;
}

export async function foco(id: string) {
  const h = await falante(id);
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
  if (a.assento) {
    posicionar(a.assento.x, a.assento.z, a.assento.yaw, 1.32);
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
  posicionar(a.entrada.x, a.entrada.z, a.entrada.yaw, OLHO);
  if (h) {
    h.raiz.position.set(a.entrada.x, 0, a.entrada.z - 4.2);
    h.raiz.userData.travado = true;
    h.olharPara(J.pos.x, J.pos.z, true);
    h.tocar('feitico');
    J.alvoOlhar = h.cabeca();
  }
  return h;
}

export function fimDuelo(oponente: string) {
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
  const [a, b] = ida ? [de, ate] : [ate, M.camera.position.clone().add(new THREE.Vector3(0, -0.1, 0))];
  const cor = ida ? 0x7df9ff : 0xff3d5a;
  const bola = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), new THREE.MeshBasicMaterial({ color: cor }));
  const luz = new THREE.PointLight(cor, 6, 5);
  bola.add(luz);
  const rastro: THREE.Mesh[] = [];
  M.cena.add(bola);
  let t = 0;
  return new Promise((fim) => {
    const f = (dt: number) => {
      t += dt / 0.45;
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
export type Alvo = { tipo: 'npc'; h: Humano } | { tipo: 'porta'; rotulo: string } | null;

export function alvoNaMira(): Alvo {
  if (!C.area) return null;
  ray.setFromCamera(centro, M.camera);
  ray.far = 3.2;
  const cand: THREE.Object3D[] = [...C.portas, ...[...C.npcs.values(), ...C.figurantes].map((h) => h.raiz)];
  const hit = ray.intersectObjects(cand, true)[0];
  if (!hit) return null;
  let o: THREE.Object3D | null = hit.object;
  while (o) {
    if (o.userData.porta) return { tipo: 'porta', rotulo: o.userData.porta };
    if (o.userData.humano) return { tipo: 'npc', h: o.userData.humano as Humano };
    o = o.parent;
  }
  return null;
}

export function preCarregarElenco() {
  preCarregar(['tati', 'caua', 'bia', 'jonas', 'enzo', 'vo_cida', 'baltazar', 'iolanda', 'otavio', 'aluno1', 'aluno2', 'aluno3', 'aluno4']);
}
