// Humanos realistas (MakeHuman/MPFB, assets CC0) animados com a Universal Animation Library
// (Quaternius, CC0) convertida para o esqueleto do MPFB. Bichos (gato, capacete, pombo) são procedurais.
import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { PERSONAGENS } from '../conteudo/index';
import { criarBicho, type Bicho } from './bichos';

const BASE = import.meta.env.BASE_URL;
export const MODELOS = ['tati', 'caua', 'bia', 'jonas', 'enzo', 'aluno1', 'aluno2', 'aluno3', 'aluno4', 'iolanda', 'otavio', 'ruth', 'heitor', 'nanda', 'baltazar', 'zuleica', 'seu_ze', 'vo_cida', 'deputado', 'marlene', 'nulo', 'adulto1', 'adulta1', 'adulta2', 'voce1', 'voce2', 'voce3', 'voce4', 'voce5', 'voce6', 'voce7', 'voce8'];

const DEDO = /^(index|middle|ring|pinky|thumb)_0([1-3])_([lr])\./;
const DEDO_OSSO = /^(index|middle|ring|pinky|thumb)_0([1-3])_([lr])$/;
// sinal da curva dos dedos (ajustado olhando as fotos)
export const CURVA = { sinal: 1, eixo: 'z' as 'x' | 'y' | 'z' };
const V1 = new THREE.Vector3(), V2 = new THREE.Vector3(), V3 = new THREE.Vector3(), V4 = new THREE.Vector3();
const V5 = new THREE.Vector3(), V6 = new THREE.Vector3(), V7 = new THREE.Vector3(), V8 = new THREE.Vector3();
const QD = new THREE.Quaternion(), QW = new THREE.Quaternion(), QP = new THREE.Quaternion(), QI = new THREE.Quaternion();
const repintadas = new Map<string, THREE.Texture>();
/** troca os pixels laranja (a gravata original) pela cor da casa, mantendo o claro e o escuro do tecido */
function repintarLaranja(mapa: THREE.Texture, tinta: number): THREE.Texture {
  const chave = mapa.uuid + tinta;
  const pronta = repintadas.get(chave);
  if (pronta) return pronta;
  const img = mapa.image as HTMLImageElement | ImageBitmap;
  const cv = document.createElement('canvas');
  cv.width = img.width;
  cv.height = img.height;
  const g = cv.getContext('2d')!;
  g.drawImage(img as CanvasImageSource, 0, 0);
  const d = g.getImageData(0, 0, cv.width, cv.height);
  const alvo = new THREE.Color(tinta);
  const [tr, tg, tb] = [alvo.r * 255, alvo.g * 255, alvo.b * 255];
  for (let i = 0; i < d.data.length; i += 4) {
    const r = d.data[i], gg = d.data[i + 1], b = d.data[i + 2];
    const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
    if (r === mx && mx > 60 && (mx - mn) / mx > 0.35) {
      const luz = (0.3 * r + 0.59 * gg + 0.11 * b) / 170;
      d.data[i] = Math.min(255, tr * luz);
      d.data[i + 1] = Math.min(255, tg * luz);
      d.data[i + 2] = Math.min(255, tb * luz);
    }
  }
  g.putImageData(d, 0, 0);
  const nova = new THREE.CanvasTexture(cv);
  nova.colorSpace = mapa.colorSpace;
  nova.flipY = mapa.flipY;
  nova.wrapS = mapa.wrapS;
  nova.wrapT = mapa.wrapT;
  repintadas.set(chave, nova);
  return nova;
}

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
    .loadAsync(`${BASE}modelos/gente/animacoes.glb?v=${__VERSAO__}`)
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
      .loadAsync(`${BASE}modelos/gente/${id}.glb?v=${__VERSAO__}`)
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
  sentado: 'Sitting_Idle_Loop', sentado_falando: 'Sitting_Talking_Loop',
};

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
  private bicho: Bicho | null = null;
  private semente = Math.random() * 10;
  pronto: Promise<void>;

  constructor(public id: string, tinta?: number) {
    this.raiz.userData.humano = this;
    this.raiz.name = `npc:${id}`;
    const m = modeloDe(id);
    if (!m) {
      this.bicho = criarBicho(id);
      this.raiz.add(this.bicho.grupo);
      this.altura = this.bicho.altura;
      this.pronto = Promise.resolve();
      return;
    }
    this.pronto = Promise.all([carregarModelo(m), carregarAnimacoes()]).then(([fonte]) => {
      if (!fonte) {
        this.bicho = criarBicho(id);
        this.raiz.add(this.bicho.grupo);
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
          // roupa é tudo que não é corpo, olho, cabelo, sobrancelha ou cílio (o nome da malha varia com o asset)
          const roupa = !fio && !/body|low-poly|eye/i.test(mt.name) && !/^corpo/.test(me.name);
          if (roupa) {
            // a camisa fica por cima da calça na cintura; sem isso as duas brigam pelo mesmo pixel
            const prio = /shirt|sweater|top|suit|jacket|blouse/i.test(mt.name + me.name) ? -12 : -2;
            mt.polygonOffset = true;
            mt.polygonOffsetFactor = prio;
            mt.polygonOffsetUnits = prio;
            // tecido é fosco: sem isso blazer e terno brilhavam como plástico
            if (!/^gravata/.test(mt.name)) {
              mt.roughness = Math.max(mt.roughness, 0.85);
              mt.metalness = 0;
              mt.roughnessMap = null;
              mt.metalnessMap = null;
              mt.envMapIntensity = 0.45;
              // relevo do tecido mais suave: forte demais, o blazer parecia papel amassado
              if (mt.normalMap) mt.normalScale.set(0.3, 0.3);
            }
          }
          // restos de estampa laranja na textura do blazer do uniforme também ganham a cor da casa
          if (tinta !== undefined && roupa && mt.map && /suit_tie_and_jacket/.test(mt.name)) {
            const c = mt.clone();
            c.map = repintarLaranja(mt.map, tinta);
            return c;
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
      // mãos um pouco menores: a proporção adulta nos corpos de 12 anos deixava as mãos enormes
      for (const lado of ['l', 'r']) modelo.getObjectByName('hand_' + lado)?.scale.setScalar(0.86);
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
      // braço um pouco afastado do tronco: colado demais, o paletó repuxa e faz corcova no ombro
      const braco = V6.set(0, -1, 0).multiplyScalar(0.94).addScaledVector(fora, 0.33).addScaledVector(frente, 0.07).normalize();
      this.alinhar(ombro, cot, braco, peso);
      const ante = V7.copy(braco).multiplyScalar(0.96).addScaledVector(frente, 0.26).normalize();
      this.alinhar(cot, mao, ante, peso);
      if (dedo) this.alinhar(mao, dedo, V8.copy(ante).addScaledVector(fora, -0.15).normalize(), peso);
    }
  }

  /** mão relaxada: dedos levemente dobrados para dentro */
  curvarDedos(fator = 1) {
    const eixo = new THREE.Vector3(CURVA.eixo === 'x' ? 1 : 0, CURVA.eixo === 'y' ? 1 : 0, CURVA.eixo === 'z' ? 1 : 0);
    const q = new THREE.Quaternion();
    for (const d of this.dedos) {
      q.setFromAxisAngle(eixo, d.ang * CURVA.sinal * fator);
      d.osso.quaternion.copy(d.repouso).multiply(q);
    }
  }

  /** sentado: parado vira sentado, falando vira falar sentado */
  sentado = false;

  tocar(estado: string, fade = 0.3) {
    if (this.sentado) estado = estado === 'falando' ? 'sentado_falando' : estado === 'parado' ? 'sentado' : estado;
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
      if (andando || ['parado', 'falando', 'feitico', 'apanhando', 'mexendo', 'comemorando', 'sentado', 'sentado_falando'].includes(est)) this.tocarSemMudarEstado(est);
      this.mixer.update(dt);
      // parado: braços soltos; falando: só suaviza o gesto
      const alvo = this.sentado ? 0 : est === 'parado' ? 0.75 : est === 'falando' ? 0.35 : 0;
      this.pesoRelax += (alvo - this.pesoRelax) * Math.min(1, dt * 4);
      if (this.pesoRelax > 0.01) this.bracosRelaxados(this.pesoRelax);
      // dedos se mexem de leve, como mão relaxada respirando
      this.curvarDedos(1 + Math.sin(performance.now() / 900 + this.semente) * 0.18);
    } else if (this.bicho) {
      this.bicho.animar(performance.now() / 1000 + this.semente, this.estado === 'falando');
    }
  }

  private tocarSemMudarEstado(est: string) {
    const guardado = this.estado;
    this.tocar(est);
    this.estado = guardado;
  }
}
