// Humanos realistas (MakeHuman/MPFB, assets CC0) animados com a Universal Animation Library
// (Quaternius, CC0) convertida para o esqueleto do MPFB. Bichos (gato, capacete, pombo) são procedurais.
import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { PERSONAGENS } from '../conteudo/index';

const BASE = import.meta.env.BASE_URL;
export const MODELOS = ['tati', 'caua', 'bia', 'jonas', 'enzo', 'aluno1', 'aluno2', 'aluno3', 'aluno4', 'iolanda', 'otavio', 'ruth', 'heitor', 'nanda', 'baltazar', 'zuleica', 'seu_ze', 'vo_cida', 'deputado', 'marlene', 'nulo', 'adulto1', 'adulta1', 'adulta2', 'voce1', 'voce2', 'voce3', 'voce4', 'voce5', 'voce6', 'voce7', 'voce8'];

const DEDO = /^(index|middle|ring|pinky|thumb)_0([1-3])_([lr])\./;
const DEDO_OSSO = /^(index|middle|ring|pinky|thumb)_0([1-3])_([lr])$/;
// sinal da curva dos dedos (ajustado olhando as fotos)
export const CURVA = { sinal: 1, eixo: 'z' as 'x' | 'y' | 'z' };
const V1 = new THREE.Vector3(), V2 = new THREE.Vector3(), V3 = new THREE.Vector3(), V4 = new THREE.Vector3();
const V5 = new THREE.Vector3(), V6 = new THREE.Vector3(), V7 = new THREE.Vector3(), V8 = new THREE.Vector3();
const QD = new THREE.Quaternion(), QW = new THREE.Quaternion(), QP = new THREE.Quaternion(), QI = new THREE.Quaternion();
const carregados = new Map<string, Promise<THREE.Object3D | null>>();
const clipes: Record<string, THREE.AnimationClip> = {};
let loader: GLTFLoader | null = null;
let animacoes: Promise<void> | null = null;

export function L(): GLTFLoader {
  if (loader) return loader;
  const draco = new DRACOLoader();
  draco.setDecoderPath(`${BASE}draco/`);
  loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  return loader;
}

export function carregarAnimacoes(): Promise<void> {
  animacoes ??= L()
    .loadAsync(`${BASE}modelos/gente/animacoes.glb`)
    .then((g: GLTF) => {
      for (const a of g.animations) {
        // dedos ficam fora das animações: a curva do arquivo dobra os dedos para trás
        a.tracks = a.tracks.filter((t) => !/^Root\.position/.test(t.name) && !DEDO.test(t.name));
        clipes[a.name] = a;
      }
    })
    .catch(() => undefined);
  return animacoes;
}

function carregarModelo(id: string): Promise<THREE.Object3D | null> {
  let p = carregados.get(id);
  if (!p) {
    p = L()
      .loadAsync(`${BASE}modelos/gente/${id}.glb`)
      .then((g) => g.scene)
      .catch(() => null);
    carregados.set(id, p);
  }
  return p;
}

export function preCarregar(ids: string[]) {
  carregarAnimacoes();
  for (const id of ids) carregarModelo(modeloDe(id) ?? id);
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** qual modelo representa um personagem (null = bicho procedural) */
export function modeloDe(id: string): string | null {
  if (MODELOS.includes(id)) return id;
  if (id === 'bitu' || id === 'chapeu') return null;
  const p = PERSONAGENS.get(id);
  if (!p) return 'adulto1';
  if (p.estilo === 'bicho' || /pomba|pombo|gato|siri|robô|bot\b/i.test(p.nome)) return null;
  const txt = `${p.nome} ${p.papel}`.toLowerCase();
  const nome = p.nome.replace(/^(prof\.?|profa\.?|dona|seu|sr\.?|sra\.?|dr\.?|dra\.?|técnico|técnica)\s+/i, '').split(' ')[0].toLowerCase();
  const fem = /^(profa|dona|sra|dra)/i.test(p.nome) || /[aeiy]$/.test(nome);
  const jovem = /alun|estudante|colega|calour|time de|capitã|capitão|goleir|monitor/.test(txt) && !/professor|técnic|diretor/.test(txt);
  const h = hash(id);
  if (jovem) return fem ? ['aluno2', 'aluno4'][h % 2] : ['aluno1', 'aluno3'][h % 2];
  return fem ? ['adulta1', 'adulta2'][h % 2] : 'adulto1';
}

const CLIPE: Record<string, string> = {
  parado: 'Idle_Loop', falando: 'Idle_Talking_Loop', andando: 'Walk_Loop', correndo: 'Jog_Fwd_Loop', feitico: 'Spell_Simple_Idle_Loop',
  apanhando: 'Hit_Head', mexendo: 'Interact', comemorando: 'Dance_Loop', formal: 'Walk_Formal_Loop',
};

// ---------------------------------------------------------------- bichos procedurais

function bicho(id: string): THREE.Group {
  const g = new THREE.Group();
  const mat = (c: number, o: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, ...o });
  const add = (geo: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number) => {
    const me = new THREE.Mesh(geo, m);
    me.position.set(x, y, z);
    me.castShadow = true;
    g.add(me);
    return me;
  };
  if (id === 'bitu') {
    const pelo = mat(0x111111, { roughness: 0.6 });
    const corpo = add(new THREE.SphereGeometry(0.16, 16, 12), pelo, 0, 0.2, 0);
    corpo.scale.set(1, 0.9, 1.6);
    add(new THREE.SphereGeometry(0.11, 16, 12), pelo, 0, 0.34, 0.2);
    for (const x of [-0.06, 0.06]) {
      add(new THREE.ConeGeometry(0.035, 0.08, 4), pelo, x, 0.45, 0.2);
      add(new THREE.SphereGeometry(0.018, 8, 8), mat(0xe8d44d, { emissive: 0xe8d44d, emissiveIntensity: 0.6 }), x * 0.75, 0.36, 0.3);
    }
    for (const [x, z] of [[-0.07, 0.15], [0.07, 0.15], [-0.07, -0.15], [0.07, -0.15]]) add(new THREE.CylinderGeometry(0.025, 0.025, 0.14, 6), pelo, x, 0.07, z);
    const rabo = add(new THREE.CylinderGeometry(0.018, 0.012, 0.32, 6), pelo, 0, 0.36, -0.28);
    rabo.rotation.x = -0.5;
  } else if (id === 'chapeu') {
    add(new THREE.CylinderGeometry(0.22, 0.25, 0.75, 16), mat(0x5a3a20), 0, 0, 0).position.y = 0.375;
    const casco = add(new THREE.SphereGeometry(0.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xf4d35e, { roughness: 0.4 }), 0, 0.78, 0);
    casco.scale.set(1, 0.9, 1.1);
    add(new THREE.CylinderGeometry(0.27, 0.27, 0.025, 24), mat(0xe0b92e, { roughness: 0.4 }), 0, 0.78, 0.02);
    for (const x of [-0.07, 0.07]) add(new THREE.SphereGeometry(0.022, 8, 8), mat(0x000000, { emissive: 0x7df9ff, emissiveIntensity: 3 }), x, 0.84, 0.19);
  } else if (/edite|pomb/i.test(id + (PERSONAGENS.get(id)?.nome ?? ''))) {
    const pena = mat(0x8a8f99);
    const corpo = add(new THREE.SphereGeometry(0.12, 16, 12), pena, 0, 1.1, 0);
    corpo.scale.set(1, 0.9, 1.4);
    add(new THREE.SphereGeometry(0.07, 12, 10), mat(0x6a7280), 0, 1.22, 0.12);
    add(new THREE.ConeGeometry(0.02, 0.06, 6), mat(0xd9a040), 0, 1.22, 0.2).rotation.x = Math.PI / 2;
    add(new THREE.CylinderGeometry(0.01, 0.01, 1, 4), mat(0x3a2a1a), 0, 0.5, 0);
  } else {
    const p = PERSONAGENS.get(id);
    const cor = new THREE.Color(p?.roupa ?? '#7a5cff');
    const corpo = add(new THREE.SphereGeometry(0.35, 24, 16), mat(cor.getHex(), { emissive: cor.getHex(), emissiveIntensity: 0.25, roughness: 0.4 }), 0, 0.8, 0);
    corpo.scale.set(1, 1.2, 1);
    for (const x of [-0.12, 0.12]) add(new THREE.SphereGeometry(0.06, 12, 10), mat(0xffffff), x, 0.95, 0.3);
  }
  return g;
}

// ---------------------------------------------------------------- humano

export class Humano {
  raiz = new THREE.Group();
  mixer: THREE.AnimationMixer | null = null;
  private acoes: Record<string, THREE.AnimationAction> = {};
  private atual: THREE.AnimationAction | null = null;
  private estado = 'parado';
  private rumo: number | undefined;
  private caminho: THREE.Vector2[] = [];
  private fimCaminho: (() => void) | null = null;
  vel = 1.2;
  altura = 1.6;
  private dedos: { osso: THREE.Object3D; repouso: THREE.Quaternion; ang: number }[] = [];
  private pesoRelax = 1;
  pronto: Promise<void>;

  constructor(public id: string, tinta?: number) {
    this.raiz.userData.humano = this;
    this.raiz.name = `npc:${id}`;
    const m = modeloDe(id);
    if (!m) {
      const b = bicho(id);
      this.raiz.add(b);
      this.altura = id === 'bitu' ? 0.45 : id === 'chapeu' ? 0.85 : 1.25;
      this.pronto = Promise.resolve();
      return;
    }
    this.pronto = Promise.all([carregarModelo(m), carregarAnimacoes()]).then(([fonte]) => {
      if (!fonte) {
        this.raiz.add(bicho(id));
        return;
      }
      const modelo = SkeletonUtils.clone(fonte);
      modelo.traverse((x) => {
        const me = x as THREE.Mesh;
        if (!me.isMesh) return;
        me.castShadow = true;
        me.receiveShadow = true;
        me.frustumCulled = false;
        const mats = Array.isArray(me.material) ? me.material : [me.material];
        const novos = mats.map((mm) => {
          const mt = mm as THREE.MeshStandardMaterial;
          const fio = /eyelash|eyebrow|short|long|bob|braid|afro|ponytail/i.test(mt.name);
          mt.transparent = false;
          mt.depthWrite = true;
          mt.alphaTest = fio ? 0.45 : /low-poly/i.test(mt.name) ? 0.5 : 0;
          if (!fio) mt.side = THREE.FrontSide;
          if (/^(roupa_|capa)/.test(me.name)) {
            // a camisa fica por cima da calça na cintura; sem isso as duas brigam pelo mesmo pixel
            const prio = /^roupa_(camisa|terno)/.test(me.name) ? -12 : -2;
            mt.polygonOffset = true;
            mt.polygonOffsetFactor = prio;
            mt.polygonOffsetUnits = prio;
          }
          // gravata do uniforme: tecido liso na cor da casa (ou da escola, para visitantes)
          if (tinta !== undefined && /^gravata/.test(mt.name)) {
            const c = mt.clone();
            c.map = null;
            c.color = new THREE.Color(tinta);
            c.roughness = 0.55;
            c.metalness = 0;
            return c;
          }
          return mt;
        });
        me.material = Array.isArray(me.material) ? novos : novos[0];
      });
      this.raiz.add(modelo);
      const caixa = new THREE.Box3().setFromObject(modelo);
      this.altura = caixa.max.y - caixa.min.y;
      modelo.traverse((o) => {
        const m = DEDO_OSSO.exec(o.name);
        if (!m) return;
        const seg = Number(m[2]);
        const ang = m[1] === 'thumb' ? [0, 0.1, 0.15, 0.1][seg] : [0, 0.14, 0.24, 0.16][seg];
        this.dedos.push({ osso: o, repouso: o.quaternion.clone(), ang });
      });
      this.curvarDedos();
      this.mixer = new THREE.AnimationMixer(modelo);
      this.tocar('parado', 0);
      this.mixer.update(Math.random() * 3);
    });
  }

  /** gira o osso (em espaço de mundo) para o filho apontar na direção pedida */
  private alinhar(osso: THREE.Object3D, filho: THREE.Object3D, alvo: THREE.Vector3, peso: number) {
    const a = osso.getWorldPosition(V1);
    const b = filho.getWorldPosition(V2);
    const atual = b.sub(a).normalize();
    QD.setFromUnitVectors(atual, alvo);
    if (peso < 1) QD.slerp(QI, 1 - peso);
    osso.getWorldQuaternion(QW);
    QW.premultiply(QD);
    osso.parent!.getWorldQuaternion(QP).invert();
    osso.quaternion.copy(QP.multiply(QW));
    osso.updateMatrixWorld(true);
  }

  /** em pé e parado: braços soltos ao lado do corpo, cotovelo pouco dobrado (a animação parada da biblioteca tem postura de luta) */
  private bracosRelaxados(peso: number) {
    const r = this.raiz;
    r.updateMatrixWorld(true);
    const frente = V3.set(Math.sin(r.rotation.y), 0, Math.cos(r.rotation.y));
    for (const lado of ['l', 'r']) {
      const ombro = r.getObjectByName('upperarm_' + lado);
      const cot = r.getObjectByName('lowerarm_' + lado);
      const mao = r.getObjectByName('hand_' + lado);
      const dedo = r.getObjectByName('middle_01_' + lado);
      if (!ombro || !cot || !mao) continue;
      const peito = r.getObjectByName('spine_03');
      const fora = ombro.getWorldPosition(V4).sub(peito ? peito.getWorldPosition(V5) : r.position);
      fora.y = 0;
      fora.normalize();
      const braco = V6.set(0, -1, 0).multiplyScalar(0.985).addScaledVector(fora, 0.13).addScaledVector(frente, 0.06).normalize();
      this.alinhar(ombro, cot, braco, peso);
      const ante = V7.copy(braco).multiplyScalar(0.96).addScaledVector(frente, 0.26).normalize();
      this.alinhar(cot, mao, ante, peso);
      if (dedo) this.alinhar(mao, dedo, V8.copy(ante).addScaledVector(fora, -0.15).normalize(), peso);
    }
  }

  /** mão relaxada: dedos levemente dobrados para dentro */
  curvarDedos() {
    const eixo = new THREE.Vector3(CURVA.eixo === 'x' ? 1 : 0, CURVA.eixo === 'y' ? 1 : 0, CURVA.eixo === 'z' ? 1 : 0);
    const q = new THREE.Quaternion();
    for (const d of this.dedos) {
      q.setFromAxisAngle(eixo, d.ang * CURVA.sinal);
      d.osso.quaternion.copy(d.repouso).multiply(q);
    }
  }

  tocar(estado: string, fade = 0.3) {
    this.estado = estado;
    if (!this.mixer) return;
    const clipe = clipes[CLIPE[estado] ?? CLIPE.parado];
    if (!clipe) return;
    let a = this.acoes[clipe.name];
    if (!a) {
      a = this.mixer.clipAction(clipe);
      this.acoes[clipe.name] = a;
    }
    if (this.atual === a) return;
    a.reset().setEffectiveWeight(1).play();
    if (estado === 'apanhando') {
      a.setLoop(THREE.LoopOnce, 1);
      a.clampWhenFinished = false;
    }
    if (this.atual && fade > 0) this.atual.crossFadeTo(a, fade, false);
    else this.atual?.stop();
    this.atual = a;
  }

  olharPara(x: number, z: number, imediato = false) {
    this.rumo = Math.atan2(x - this.raiz.position.x, z - this.raiz.position.z);
    if (imediato) this.raiz.rotation.y = this.rumo;
  }

  irPara(pontos: { x: number; z: number }[], vel = 1.2): Promise<void> {
    this.caminho = pontos.map((p) => new THREE.Vector2(p.x, p.z));
    this.vel = vel;
    return new Promise((r) => (this.fimCaminho = r));
  }

  /** ponto do rosto em coordenadas do mundo, para a câmera mirar (pelo osso da cabeça) */
  cabeca(alvo = new THREE.Vector3()) {
    const osso = this.raiz.getObjectByName('head');
    if (osso) {
      osso.getWorldPosition(alvo);
      alvo.y += 0.06;
      return alvo;
    }
    return this.raiz.getWorldPosition(alvo).setY(this.raiz.position.y + this.altura * 0.92);
  }

  update(dt: number) {
    const r = this.raiz;
    if (this.caminho.length) {
      const a = this.caminho[0];
      const dx = a.x - r.position.x;
      const dz = a.y - r.position.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.08) {
        this.caminho.shift();
        if (!this.caminho.length && this.fimCaminho) {
          const f = this.fimCaminho;
          this.fimCaminho = null;
          f();
        }
      } else {
        const passo = Math.min(d, this.vel * dt);
        r.position.x += (dx / d) * passo;
        r.position.z += (dz / d) * passo;
        this.rumo = Math.atan2(dx, dz);
      }
    }
    if (this.rumo !== undefined) {
      let dif = this.rumo - r.rotation.y;
      dif = Math.atan2(Math.sin(dif), Math.cos(dif));
      r.rotation.y += dif * Math.min(1, dt * 6);
    }
    if (this.mixer) {
      const andando = this.caminho.length > 0;
      const est = andando ? (this.vel > 2 ? 'correndo' : 'andando') : this.estado;
      if (andando || ['parado', 'falando', 'feitico', 'apanhando', 'mexendo', 'comemorando'].includes(est)) this.tocarSemMudarEstado(est);
      this.mixer.update(dt);
      // parado: braços soltos; falando: só suaviza o gesto
      const alvo = est === 'parado' ? 1 : est === 'falando' ? 0.45 : 0;
      this.pesoRelax += (alvo - this.pesoRelax) * Math.min(1, dt * 4);
      if (this.pesoRelax > 0.01) this.bracosRelaxados(this.pesoRelax);
    } else if (this.id === 'bitu') {
      r.children[0].position.y = Math.abs(Math.sin(performance.now() / 600)) * 0.01;
    }
  }

  private tocarSemMudarEstado(est: string) {
    const guardado = this.estado;
    this.tocar(est);
    this.estado = guardado;
  }
}
