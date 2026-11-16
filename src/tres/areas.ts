// Ambientes 3D. Cada lugar do conteúdo vira um desses modelos, escolhido pelo tipo de cena.
// Arquitetura inspirada na vila ferroviária real de Paranapiacaba: tijolo inglês, madeira,
// ferro, telhado de duas águas, torre do relógio e neblina.
import * as THREE from 'three';
import type { Lugar } from '../conteudo/tipos';
import * as T from './texturas';
import { M } from './motor3d';
import { pbr } from './pbr';
import { movel } from './moveis';
import { comida, velasFlutuantes } from './banquete';

export interface Area {
  modelo: string;
  grupo: THREE.Group;
  entrada: { x: number; z: number; yaw: number };
  palco: { x: number; z: number }[];
  professor?: { x: number; z: number };
  assento?: { x: number; z: number; yaw: number };
  lousa?: THREE.Mesh;
  limites: [number, number, number, number];
  // onde os personagens podem ficar, quando é diferente de onde você anda (ex.: entre os bancos do trem)
  limitesNpc?: [number, number, number, number];
  obstaculosNpc?: [number, number, number, number][];
  obstaculos: [number, number, number, number][];
  portas: { x: number; z: number; rotulo: string }[];
  ceu: number;
  neblina: number;
  atualizar?: (dt: number, t: number) => void;
}

// ---------------------------------------------------------------- utilitários

const std = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o);
const texMat = (t: { map: THREE.Texture; bump: THREE.Texture }, o: THREE.MeshStandardMaterialParameters = {}) =>
  std({ map: t.map, bumpMap: t.bump, bumpScale: 1.2, roughness: 0.9, ...o });

function caixa(g: THREE.Object3D, w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number, ry = 0) {
  const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  me.position.set(x, y + h / 2, z);
  me.rotation.y = ry;
  me.castShadow = true;
  me.receiveShadow = true;
  g.add(me);
  return me;
}

function cil(g: THREE.Object3D, rt: number, rb: number, h: number, m: THREE.Material, x: number, y: number, z: number, seg = 16) {
  const me = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
  me.position.set(x, y + h / 2, z);
  me.castShadow = true;
  me.receiveShadow = true;
  g.add(me);
  return me;
}

function plano(g: THREE.Object3D, w: number, h: number, m: THREE.Material, x: number, y: number, z: number, rx = 0, ry = 0) {
  const me = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  me.position.set(x, y, z);
  me.rotation.set(rx, ry, 0);
  me.receiveShadow = true;
  g.add(me);
  return me;
}

/** caixa oca de sala: piso, teto e quatro paredes viradas para dentro */
function salaFechada(g: THREE.Object3D, w: number, d: number, h: number, parede: THREE.Material, piso: THREE.Material, teto: THREE.Material) {
  plano(g, w, d, piso, 0, 0, 0, -Math.PI / 2);
  plano(g, w, d, teto, 0, h, 0, Math.PI / 2);
  plano(g, w, h, parede, 0, h / 2, -d / 2);
  plano(g, w, h, parede, 0, h / 2, d / 2, 0, Math.PI);
  plano(g, d, h, parede, -w / 2, h / 2, 0, 0, Math.PI / 2);
  plano(g, d, h, parede, w / 2, h / 2, 0, 0, -Math.PI / 2);
}

function lampiao(g: THREE.Object3D, x: number, y: number, z: number, intens = 6, dist = 9, cor = 0xffb26b) {
  const vidro = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), std({ color: 0xffe0a8, emissive: cor, emissiveIntensity: 3 }));
  vidro.position.set(x, y, z);
  g.add(vidro);
  const fio = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.2, 4), std({ color: 0x111111 }));
  fio.position.set(x, y + 0.7, z);
  g.add(fio);
  const l = new THREE.PointLight(cor, intens, dist, 1.6);
  l.position.set(x, y - 0.1, z);
  g.add(l);
  return l;
}

function luzPrincipal(g: THREE.Object3D, x: number, y: number, z: number, cor = 0xffd9a8, intens = 30, alvo = new THREE.Vector3()) {
  const s = new THREE.SpotLight(cor, intens, 40, Math.PI / 2.6, 0.6, 1.3);
  s.position.set(x, y, z);
  s.target.position.copy(alvo);
  s.castShadow = true;
  s.shadow.mapSize.set(1024, 1024);
  s.shadow.bias = -0.0008;
  s.shadow.normalBias = 0.03;
  g.add(s, s.target);
  return s;
}

function janela(g: THREE.Object3D, x: number, y: number, z: number, w: number, h: number, ry: number, corCeu = 0x24345c) {
  const q = new THREE.Group();
  const vidro = new THREE.Mesh(new THREE.PlaneGeometry(w, h), std({ color: corCeu, emissive: corCeu, emissiveIntensity: 0.9, roughness: 0.1, metalness: 0.2 }));
  q.add(vidro);
  const ferro = std({ color: 0x1a1a1a, roughness: 0.5, metalness: 0.7 });
  for (let i = 1; i < 3; i++) {
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.04, h, 0.05), ferro);
    v.position.x = -w / 2 + (w / 3) * i;
    q.add(v);
  }
  const hz = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, 0.05), ferro);
  q.add(hz);
  const moldura = std({ color: 0xe8e2d4, roughness: 0.7 });
  for (const [mx, my, mw, mh] of [[0, h / 2, w + 0.2, 0.12], [0, -h / 2, w + 0.3, 0.16], [-w / 2, 0, 0.12, h], [w / 2, 0, 0.12, h]]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(mw, mh, 0.12), moldura);
    m.position.set(mx, my, 0.02);
    q.add(m);
  }
  q.position.set(x, y, z);
  q.rotation.y = ry;
  g.add(q);
  return q;
}

function rnd(semente: number) {
  let s = semente >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const COR_CASA = [0xe8a317, 0xff7f11, 0x3fb59f, 0x9ccc65];

// ---------------------------------------------------------------- modelos

function patio(): Area {
  const g = new THREE.Group();
  const r = rnd(3);
  plano(g, 140, 140, pbr('paralelepipedo', [46, 46]), 0, 0, 0, -Math.PI / 2);
  const tij = pbr('tijolo', [10, 4]);
  const tijT = pbr('tijolo', [2, 9]);
  const tel = pbr('telhado', [10, 3]);
  const madeiraClara = std({ color: 0xe9e1cf, roughness: 0.8 });
  // corpo principal do castelo
  caixa(g, 34, 12, 10, tij, 0, 0, -26);
  const perfil = new THREE.Shape();
  perfil.moveTo(-5.6, 0);
  perfil.lineTo(0, 4.4);
  perfil.lineTo(5.6, 0);
  perfil.closePath();
  const geoTel = new THREE.ExtrudeGeometry(perfil, { depth: 34.6, bevelEnabled: false });
  geoTel.translate(0, 0, -17.3);
  geoTel.rotateY(Math.PI / 2);
  const telhado = new THREE.Mesh(geoTel, tel);
  telhado.position.set(0, 12, -26);
  telhado.castShadow = true;
  g.add(telhado);
  // torre do relógio
  caixa(g, 5, 26, 5, tijT, 0, 0, -20.2);
  const pin = new THREE.Mesh(new THREE.ConeGeometry(4, 7, 4), tel);
  pin.position.set(0, 29.5, -20.2);
  pin.rotation.y = Math.PI / 4;
  g.add(pin);
  const mostrador = new THREE.Mesh(new THREE.CircleGeometry(1.7, 40), new THREE.MeshBasicMaterial({ color: 0xfff4d6, fog: false }));
  mostrador.position.set(0, 21, -17.65);
  g.add(mostrador);
  const ponteiro = (comp: number, larg: number) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(larg, comp, 0.05), new THREE.MeshBasicMaterial({ color: 0x111111, fog: false }));
    p.geometry.translate(0, comp / 2, 0);
    p.position.set(0, 21, -17.6);
    g.add(p);
    return p;
  };
  const hora = ponteiro(0.9, 0.12);
  const minuto = ponteiro(1.4, 0.07);
  // alas laterais com torreões
  for (const lado of [-1, 1]) {
    caixa(g, 10, 9, 14, tij, lado * 22, 0, -22);
    caixa(g, 4.4, 17, 4.4, tijT, lado * 17.5, 0, -15.8);
    const c = new THREE.Mesh(new THREE.ConeGeometry(3.2, 5, 4), tel);
    c.position.set(lado * 17.5, 20, -15.8);
    c.rotation.y = Math.PI / 4;
    g.add(c);
  }
  // janelas acesas
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue;
    for (const y of [3.4, 7.6]) janela(g, i * 4.2, y, -20.94, 1.4, 2.4, 0, 0xffb85c);
  }
  // portal de entrada
  caixa(g, 3.6, 4.4, 0.6, std({ color: 0x3a2412, roughness: 0.6 }), 0, 0, -17.4);
  caixa(g, 4.6, 0.5, 1.2, madeiraClara, 0, 4.4, -17.2);
  // trilhos da serra cruzando o pátio
  const ferro = std({ color: 0x5a5148, metalness: 0.8, roughness: 0.45 });
  for (const xz of [-0.72, 0.72]) caixa(g, 120, 0.12, 0.08, ferro, 0, 0, 6 + xz);
  const dorm = std({ color: 0x3b2a1e, roughness: 0.95 });
  for (let x = -60; x < 60; x += 0.9) caixa(g, 0.24, 0.08, 2.2, dorm, x, 0, 6);
  // postes de lampião
  const poste = std({ color: 0x1b1b1b, metalness: 0.6, roughness: 0.5 });
  for (const [x, z] of [[-8, -6], [8, -6], [-8, 14], [8, 14], [-20, 2], [20, 2]]) {
    void poste;
    movel(g, 'street_lamp_01', x, z, { alt: 4.2 });
    const luz = lampiao(g, x, 3.75, z, 9, 14);
    luz.parent!.children.slice(-3, -1).forEach((o) => (o.visible = false));
  }
  for (const [x, z, ry] of [[-5, -4, 0], [5, -4, 0], [-12, 10, Math.PI / 2], [12, 10, -Math.PI / 2]]) movel(g, 'painted_wooden_bench', x, z, { larg: 1.8, ry });
  for (const [x, z] of [[-14.6, -15], [-13.8, -14.4], [14.4, -15]]) movel(g, 'Barrel_01', x, z, { alt: 0.9 });
  // árvores da mata atlântica nas bordas
  const tronco = std({ color: 0x3a2a1e, roughness: 1 });
  const folha = std({ color: 0x1f3d22, roughness: 1 });
  for (let i = 0; i < 70; i++) {
    const ang = r() * Math.PI * 2;
    const d = 32 + r() * 30;
    const x = Math.cos(ang) * d;
    const z = Math.sin(ang) * d;
    if (z < -12 && Math.abs(x) < 32) continue;
    const h = 5 + r() * 7;
    cil(g, 0.15, 0.25, h * 0.5, tronco, x, 0, z, 6);
    const copa = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6 + r() * 1.8, 0), folha);
    copa.position.set(x, h * 0.5 + 1.2, z);
    copa.castShadow = true;
    g.add(copa);
  }
  // serra ao fundo
  const serra = std({ color: 0x2c3442, roughness: 1, fog: true });
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(18 + r() * 14, 22 + r() * 18, 5), serra);
    m.position.set(-90 + i * 22, 6, -95 - r() * 20);
    g.add(m);
  }
  // luz da lua e céu
  const hemi = new THREE.HemisphereLight(0x8a9ccf, 0x1c1a14, 0.9);
  g.add(hemi);
  const lua = new THREE.DirectionalLight(0xb9c8ff, 1.4);
  lua.position.set(-20, 40, 25);
  lua.castShadow = true;
  lua.shadow.mapSize.set(2048, 2048);
  Object.assign(lua.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 120 });
  lua.shadow.bias = -0.0005;
  g.add(lua);
  const disco = new THREE.Mesh(new THREE.CircleGeometry(4, 32), new THREE.MeshBasicMaterial({ color: 0xf6f1d3, fog: false }));
  disco.position.set(-60, 70, -120);
  disco.lookAt(0, 0, 0);
  g.add(disco);
  return {
    modelo: 'patio', grupo: g, entrada: { x: 0, z: 12, yaw: 0 }, palco: [{ x: -1.6, z: 8.4 }, { x: 1.4, z: 8.6 }, { x: 0, z: 7.8 }, { x: -3, z: 9.6 }],
    limites: [-28, 28, -16.6, 26], obstaculos: [[-17, 17, -31, -17], [-27, -15, -29, -15], [15, 27, -29, -15], [-6, -4, -4.5, -3.5], [4, 6, -4.5, -3.5], [-12.5, -11.5, 9, 11], [11.5, 12.5, 9, 11]],
    portas: [{ x: 0, z: -16.8, rotulo: 'Entrar no castelo' }], ceu: 0x1a2235, neblina: 0.028,
    atualizar: () => {
      const d = new Date();
      minuto.rotation.z = -(d.getMinutes() / 60) * Math.PI * 2;
      hora.rotation.z = -((d.getHours() % 12) / 12 + d.getMinutes() / 720) * Math.PI * 2;
    },
  };
}

function salao(colunas = false): Area {
  const g = new THREE.Group();
  let velas: ((dt: number, t: number, c?: THREE.Camera) => void) | null = null;
  const W = 14;
  const D = 32;
  const H = 9;
  salaFechada(g, W, D, H, pbr('pedra', [4, 3]), pbr('assoalho', [4, 9]), std({ color: 0x1a1428, roughness: 1 }));
  const mesa = texMat(T.madeira([3, 1], '#5a3820'), { roughness: 0.55 });
  const r = rnd(9);
  if (!colunas) {
    void r;
    for (const x of [-4.2, -1.4, 1.4, 4.2]) {
      for (let z = -12; z <= 8; z += 2.1) {
        movel(g, 'dining_table', x, z, { alt: 0.78, ry: Math.PI / 2 });
      }
      // bancos corridos de refeitório, na altura do assento
      const banco = pbr('assoalho', [0.4, 8]);
      for (const lx of [x - 0.78, x + 0.78]) {
        caixa(g, 0.34, 0.06, 22.4, banco, lx, 0.42, -2);
        for (let bz = -12.6; bz <= 8.6; bz += 2.8) caixa(g, 0.28, 0.42, 0.08, banco, lx, 0, bz);
      }
    }
    movel(g, 'vintage_grandfather_clock_01', -W / 2 + 0.5, -D / 2 + 0.8, { alt: 2.3, ry: Math.PI / 2 });
    comida(g, [-4.2, -1.4, 1.4, 4.2].map((x) => ({ x, z0: -13, z1: 9, y: 0.78 })));
    velas = velasFlutuantes(g, -W / 2 + 1, W / 2 - 1, -D / 2 + 1.5, D / 2 - 2, 5.2, 7.6);
    // estandartes das casas
    COR_CASA.forEach((c, i) => {
      const b = plano(g, 1.6, 4, std({ color: c, roughness: 0.9, side: THREE.DoubleSide }), -4.5 + i * 3, 5.4, -15.9);
      b.castShadow = true;
    });
  } else {
    const coluna = std({ color: 0xd8d0bc, roughness: 0.7 });
    for (const x of [-5, 5]) for (let z = -13; z <= 11; z += 6) cil(g, 0.45, 0.5, H, coluna, x, 0, z, 20);
    caixa(g, 6, 1.1, 1, mesa, 0, 0, -12);
    const orelhao = std({ color: 0xff9e2c, roughness: 0.5 });
    cil(g, 0.06, 0.06, 1.4, std({ color: 0x555555 }), 5.6, 0, 6, 8);
    const capa = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), orelhao);
    capa.scale.set(1, 1.4, 1);
    capa.position.set(5.6, 1.5, 6);
    g.add(capa);
  }
  for (const z of [-10, -2, 6]) for (const x of [-W / 2 + 0.02, W / 2 - 0.02]) janela(g, x, 5, z, 1.6, 3.4, x < 0 ? Math.PI / 2 : -Math.PI / 2);
  for (let z = -12; z <= 8; z += 5) {
    lampiao(g, 0, 6.2, z, 7, 12);
    movel(g, 'Chandelier_01', 0, z, { alt: 1.3, y: H, pendurado: true });
  }
  luzPrincipal(g, 0, 8.6, -2, 0xffd9a8, 60, new THREE.Vector3(0, 0, -2));
  g.add(new THREE.HemisphereLight(0x9a8ab8, 0x3a2a18, 1.1));
  return {
    modelo: colunas ? 'colunas' : 'salao', grupo: g, entrada: { x: 0, z: 13, yaw: 0 }, palco: [{ x: -1.2, z: 9.6 }, { x: 1.3, z: 9.4 }, { x: 0, z: 9 }, { x: -2.6, z: 10.4 }],
    limites: [-W / 2 + 0.4, W / 2 - 0.4, -D / 2 + 0.4, D / 2 - 0.4],
    obstaculos: colunas ? [[-3, 3, -12.6, -11.4]] : [-4.2, -1.4, 1.4, 4.2].map((x) => [x - 1.1, x + 1.1, -13, 9] as [number, number, number, number]),
    portas: [{ x: 0, z: 15.6, rotulo: 'Sair' }], ceu: 0x0e0b18, neblina: 0.012,
    atualizar: velas ? (dt, t) => velas!(dt, t, M.camera) : undefined,
  };
}

function sala(variante: 'aula' | 'biblioteca' | 'datacenter' | 'torre' = 'aula'): Area {
  const g = new THREE.Group();
  const W = 12;
  const D = 14;
  const H = variante === 'torre' ? 7 : 4.6;
  salaFechada(g, W, D, H, variante === 'datacenter' ? pbr('concreto', [4, 2]) : pbr('tijolo', [4, 2]), variante === 'datacenter' ? pbr('concreto', [4, 4], { color: 0x9a9fa8 }) : pbr('assoalho', [3, 3]), std({ color: 0x2a2030, roughness: 1 }));
  const madeira = texMat(T.madeira([1, 1], '#5c3a20'), { roughness: 0.6 });
  const r = rnd(variante.length);
  let lousa: THREE.Mesh | undefined;
  let assento: Area['assento'];
  const obst: Area['obstaculos'] = [];
  const atualiza: ((dt: number, t: number) => void)[] = [];
  // lousa na parede da frente
  if (variante !== 'datacenter') {
    lousa = plano(g, 5, 2.4, std({ color: 0xffffff, roughness: 0.95 }), 0, 2.2, -D / 2 + 0.06);
    (lousa.material as THREE.MeshStandardMaterial).map = T.lousa('Paranapiacaba', ['Quem tem backup tem tudo.']);
    caixa(g, 5.3, 0.1, 0.2, madeira, 0, 0.95, -D / 2 + 0.12);
    movel(g, 'painted_wooden_table', -3.4, -D / 2 + 1.6, { larg: 1.6 });
    movel(g, 'desk_lamp_arm_01', -3.9, -D / 2 + 1.5, { alt: 0.45, y: 0.76 });
    obst.push([-4.3, -2.5, -D / 2 + 1, -D / 2 + 2.2]);
  }
  if (variante === 'aula') {
    const tela = std({ color: 0x0b2a14, emissive: 0x2bff6a, emissiveIntensity: 0.6 });
    const gab = std({ color: 0xcfc6b0, roughness: 0.6 });
    void tela;
    void gab;
    for (let fila = 0; fila < 3; fila++)
      for (const x of [-3.2, -1, 1.2, 3.4]) {
        const z = -2.4 + fila * 2.4;
        movel(g, 'SchoolDesk_01', x, z, { alt: 0.76 });
        movel(g, 'classic_laptop', x, z - 0.05, { larg: 0.34, y: 0.76, ry: Math.PI });
        movel(g, 'SchoolChair_01', x, z + 0.62, { alt: 0.84 });
        obst.push([x - 0.5, x + 0.5, z - 0.4, z + 1]);
      }
    movel(g, 'wooden_bookshelf_worn', -W / 2 + 0.45, 3.5, { alt: 2.2, ry: Math.PI / 2 });
    movel(g, 'potted_plant_01', W / 2 - 0.6, -D / 2 + 0.7, { alt: 1.1 });
    assento = { x: 0.1, z: 4.6, yaw: 0 };
  } else if (variante === 'biblioteca') {
    const livros = [0x7a2e2e, 0x2e4a7a, 0x2e6a3a, 0x8a6a2a, 0x5a2e6a, 0x3a3a3a];
    void livros;
    for (const x of [-4.5, -1.5, 1.5, 4.5]) {
      for (const z of [-3, 1]) {
        movel(g, 'wooden_bookshelf_worn', x, z, { alt: 2.6 });
        for (const y of [0.1, 0.55, 1.0, 1.45, 1.9]) for (const dx of [-0.45, 0.45]) movel(g, 'book_encyclopedia_set_01', x + dx, z, { larg: 0.62, y, ry: Math.random() < 0.5 ? 0 : Math.PI });
        obst.push([x - 1.1, x + 1.1, z - 0.4, z + 0.4]);
      }
    }
    for (const x of [-2.8, 2.8]) {
      movel(g, 'painted_wooden_table', x, 4.3, { larg: 1.6 });
      movel(g, 'book_encyclopedia_set_01', x - 0.3, 4.3, { larg: 0.45, y: 0.76 });
      movel(g, 'desk_lamp_arm_01', x + 0.55, 4.2, { alt: 0.45, y: 0.76 });
      obst.push([x - 0.95, x + 0.95, 3.8, 4.8]);
    }
  } else if (variante === 'datacenter') {
    const rack = std({ color: 0x15161a, metalness: 0.6, roughness: 0.4 });
    const leds: THREE.Mesh[] = [];
    for (const x of [-3, 0, 3])
      for (let z = -5; z <= 3; z += 2) {
        caixa(g, 0.8, 2.2, 1.1, rack, x, 0, z);
        for (let i = 0; i < 10; i++) {
          const l = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.01), std({ color: 0x000000, emissive: r() > 0.3 ? 0x33ff66 : 0xffaa22, emissiveIntensity: 2 }));
          l.position.set(x - 0.3 + r() * 0.5, 0.2 + i * 0.2, z + 0.56);
          g.add(l);
          leds.push(l);
        }
        obst.push([x - 0.5, x + 0.5, z - 0.65, z + 0.65]);
      }
    atualiza.push((_dt, t) => leds.forEach((l, i) => ((l.material as THREE.MeshStandardMaterial).emissiveIntensity = Math.sin(t * 6 + i * 1.7) > 0.2 ? 2.4 : 0.2)));
    g.add(new THREE.PointLight(0x7fb0ff, 8, 14));
  } else {
    // torre: antenas, mesa de rádio e janelas para a noite
    const metal = std({ color: 0x7a8088, metalness: 0.8, roughness: 0.35 });
    for (let i = 0; i < 6; i++) cil(g, 0.03, 0.05, 2.5 + r() * 2, metal, -4 + i * 1.6, 0, -5.4, 6);
    movel(g, 'painted_wooden_table', 3, -4.6, { larg: 1.6 });
    movel(g, 'classic_laptop', 3, -4.6, { larg: 0.34, y: 0.76, ry: Math.PI });
    movel(g, 'desk_lamp_arm_01', 3.6, -4.7, { alt: 0.45, y: 0.76 });
  }
  for (const z of [-3, 2]) janela(g, W / 2 - 0.02, 2.4, z, 1.4, 2.2, -Math.PI / 2);
  for (const x of [-2.5, 2.5]) lampiao(g, x, H - 0.9, 0, 5, 9);
  luzPrincipal(g, 0, H - 0.2, 2, 0xffe2b8, 35, new THREE.Vector3(0, 0, -1));
  g.add(new THREE.HemisphereLight(0x9a8ab8, 0x3a2a18, 1.1));
  return {
    modelo: variante, grupo: g, entrada: { x: 0, z: 5.6, yaw: 0 }, palco: [{ x: -1.2, z: 3.4 }, { x: 1.2, z: 3.3 }, { x: 0, z: 3 }, { x: 2.4, z: 3.8 }],
    professor: { x: 1.6, z: -D / 2 + 1.5 }, assento, lousa,
    limites: [-W / 2 + 0.4, W / 2 - 0.4, -D / 2 + 0.4, D / 2 - 0.4], obstaculos: obst,
    portas: [{ x: -W / 2 + 0.5, z: 5.5, rotulo: 'Sair da sala' }], ceu: 0x0e0b18, neblina: 0.02,
    atualizar: atualiza.length ? (dt, t) => atualiza.forEach((f) => f(dt, t)) : undefined,
  };
}

function dormitorio(): Area {
  const g = new THREE.Group();
  const W = 9;
  const D = 10;
  salaFechada(g, W, D, 4, pbr('pedra', [3, 2]), pbr('assoalho', [3, 3]), std({ color: 0x3a2a1e, roughness: 1 }));
  const madeira = texMat(T.madeira([1, 1], '#4a2c18'), { roughness: 0.6 });
  const obst: Area['obstaculos'] = [];
  for (const [x, z] of [[-3.2, -3], [-3.2, 0.5], [3.2, -3], [3.2, 0.5]]) {
    void madeira;
    movel(g, 'GothicBed_01', x, z, { larg: 2.15, ry: x < 0 ? Math.PI / 2 : -Math.PI / 2 });
    movel(g, 'treasure_chest', x + (x < 0 ? 0.15 : -0.15), z + 1.45, { larg: 0.85 });
    movel(g, 'ClassicNightstand_01', x + (x < 0 ? -0.1 : 0.1), z - 1.45, { alt: 0.6 });
    movel(g, 'wooden_lantern_01', x + (x < 0 ? -0.1 : 0.1), z - 1.45, { alt: 0.32, y: 0.6 });
    obst.push([x - 0.6, x + 0.6, z - 1.1, z + 1.7]);
  }
  plano(g, 3, 4, std({ map: T.tecido('#5a3a6a', [3, 3]).map, roughness: 1 }), 0, 0.01, -1, -Math.PI / 2);
  janela(g, 0, 2.2, -D / 2 + 0.02, 1.6, 2, 0);
  // espelho
  const espelho = plano(g, 0.9, 1.8, std({ color: 0xaab4c8, metalness: 1, roughness: 0.05 }), W / 2 - 0.03, 1.4, 3, 0, -Math.PI / 2);
  espelho.name = 'espelho';
  lampiao(g, 0, 3.2, 0, 5, 9);
  luzPrincipal(g, 0, 3.9, 1, 0xffd6a0, 22, new THREE.Vector3(0, 0, -1));
  g.add(new THREE.HemisphereLight(0x9a8ab8, 0x3a2a18, 1.1));
  return {
    modelo: 'dormitorio', grupo: g, entrada: { x: 0, z: 3.6, yaw: 0 }, palco: [{ x: -1, z: 1.4 }, { x: 1, z: 1.4 }, { x: 0, z: 1 }, { x: 2, z: 2 }],
    limites: [-W / 2 + 0.4, W / 2 - 0.4, -D / 2 + 0.4, D / 2 - 0.4], obstaculos: obst,
    portas: [{ x: 0, z: D / 2 - 0.5, rotulo: 'Sair do dormitório' }], ceu: 0x0e0b18, neblina: 0.02,
  };
}

function casa(): Area {
  const g = new THREE.Group();
  const W = 7;
  const D = 8;
  salaFechada(g, W, D, 2.8, pbr('reboco', [3, 1.5]), texMat(T.ladrilho([5, 6]), { roughness: 0.5, bumpScale: 0.3 }), std({ color: 0xf0eadc, roughness: 1 }));
  movel(g, 'Sofa_01', -1.2, -3.1, { larg: 2.2 });
  movel(g, 'CoffeeTable_01', -1.2, -1.7, { larg: 1.1 });
  movel(g, 'Television_01', 2, -3.55, { alt: 0.55, y: 0.6 });
  const madeira = texMat(T.madeira([1, 1], '#6b4528'), { roughness: 0.6 });
  caixa(g, 1.6, 0.6, 0.45, madeira, 2, 0, -3.5);
  // o roteador de cabeça para baixo, claro
  const rot = caixa(g, 0.32, 0.06, 0.2, std({ color: 0x222222 }), 2.6, 0.62, -3.3);
  rot.rotation.z = Math.PI;
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), std({ color: 0x000000, emissive: 0x33ff55, emissiveIntensity: 3 }));
  led.position.set(2.5, 0.6, -3.19);
  g.add(led);
  // planta e imagem na parede
  movel(g, 'potted_plant_01', -3, 2.8, { alt: 1.2 });
  janela(g, -W / 2 + 0.02, 1.5, 0, 1.2, 1.2, Math.PI / 2, 0x9cc4e8);
  luzPrincipal(g, 0, 2.7, 0, 0xfff0d8, 18, new THREE.Vector3(0, 0, -1));
  g.add(new THREE.HemisphereLight(0xfff4e0, 0x6a5040, 1.1));
  return {
    modelo: 'casa', grupo: g, entrada: { x: 0, z: 2.8, yaw: 0 }, palco: [{ x: -0.8, z: 0.4 }, { x: 0.9, z: 0.3 }, { x: 0, z: 0 }, { x: -1.8, z: 0.8 }],
    limites: [-W / 2 + 0.3, W / 2 - 0.3, -D / 2 + 0.3, D / 2 - 0.3], obstaculos: [[-2.4, 0, -3.6, -2.6], [-1.8, -0.6, -2.1, -1.3], [1.1, 2.9, -3.8, -3.1]],
    portas: [{ x: 0, z: D / 2 - 0.4, rotulo: 'Sair de casa' }], ceu: 0x9cc4e8, neblina: 0.01,
  };
}

function trem(): Area {
  const g = new THREE.Group();
  const W = 3.2;
  const D = 16;
  salaFechada(g, W, D, 2.6, texMat(T.madeira([4, 1], '#7a4a2a'), { roughness: 0.6 }), texMat(T.tabuado([2, 8])), std({ color: 0xe8dcc4, roughness: 1 }));
  const banco = std({ map: T.tecido('#6a1f2b').map, roughness: 1 });
  const fora = std({ color: 0x55657a, emissive: 0x6f8098, emissiveIntensity: 0.8 });
  const paisagem: THREE.Mesh[] = [];
  for (let z = -6.5; z <= 6.5; z += 1.6) {
    for (const x of [-1.05, 1.05]) {
      caixa(g, 0.9, 0.45, 0.5, banco, x, 0, z);
      caixa(g, 0.9, 0.7, 0.1, banco, x, 0.45, z + 0.24);
    }
    for (const x of [-W / 2 + 0.02, W / 2 - 0.02]) {
      const j = janela(g, x, 1.5, z, 1, 0.8, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0x7a8aa0);
      paisagem.push(j.children[0] as THREE.Mesh);
    }
  }
  (paisagem[0].material as THREE.MeshStandardMaterial).dispose();
  paisagem.forEach((p) => (p.material = fora));
  for (let z = -6; z <= 6; z += 4) lampiao(g, 0, 2.3, z, 3, 6);
  g.add(new THREE.HemisphereLight(0xb0c0e0, 0x4a3020, 0.9));
  return {
    modelo: 'trem', grupo: g, entrada: { x: 0, z: 6.5, yaw: 0 }, palco: [{ x: -0.6, z: 4.6 }, { x: 0.6, z: 4.4 }, { x: 0, z: 4 }, { x: 0, z: 3 }],
    limites: [-0.5, 0.5, -D / 2 + 0.4, D / 2 - 0.4], obstaculos: [],
    limitesNpc: [-1.45, 1.45, -D / 2 + 0.4, D / 2 - 0.4],
    obstaculosNpc: Array.from({ length: 9 }, (_, i) => -6.5 + i * 1.6).flatMap((z) => [[-1.55, -0.55, z - 0.3, z + 0.32], [0.55, 1.55, z - 0.3, z + 0.32]] as [number, number, number, number][]),
    portas: [{ x: 0, z: -D / 2 + 0.5, rotulo: 'Descer do trem' }], ceu: 0x6f8098, neblina: 0.01,
    atualizar: (_dt, t) => {
      fora.emissiveIntensity = 0.65 + Math.sin(t * 2.3) * 0.08 + Math.sin(t * 7.1) * 0.04;
      g.position.y = Math.sin(t * 9) * 0.006;
    },
  };
}

function cidade(): Area {
  const g = new THREE.Group();
  const W = 6;
  const D = 24;
  salaFechada(g, W, D, 4, std({ color: 0x3a3440, roughness: 0.9 }), texMat(T.ladrilho([4, 14]), { roughness: 0.4, bumpScale: 0.2, color: 0x9a9a9a }), std({ color: 0x1a1820, roughness: 1 }));
  const lojas = ['TECLADOS ENCANTADOS', 'CABOS E FEITIÇOS', 'CONSERTO DE VARINHA', 'PENDRIVE SEM NOTA', 'POMBOS-CORREIO', 'LIVROS DE PROTOCOLO'];
  lojas.forEach((nome, i) => {
    const lado = i % 2 ? 1 : -1;
    const z = -9 + Math.floor(i / 2) * 7;
    const p = plano(g, 3, 0.7, std({ map: T.placa(nome, '#140f1c', ['#ff6ec7', '#6ef2ff', '#f2c45a'][i % 3]), emissive: 0xffffff, emissiveMap: T.placa(nome, '#140f1c', ['#ff6ec7', '#6ef2ff', '#f2c45a'][i % 3]), emissiveIntensity: 0.9 }), lado * (W / 2 - 0.05), 3, z, 0, -lado * Math.PI / 2);
    p.castShadow = false;
    caixa(g, 0.6, 1, 2.4, texMat(T.madeira([1, 1], '#3a2416')), lado * (W / 2 - 0.4), 0, z);
    janela(g, lado * (W / 2 - 0.02), 1.8, z + 1.9, 1.2, 1.2, -lado * Math.PI / 2, 0xffc98a);
    const l = new THREE.PointLight(['#ff6ec7', '#6ef2ff', '#f2c45a'][i % 3], 4, 6);
    l.position.set(lado * 1.8, 3, z);
    g.add(l);
  });
  // cabos pendurados, porque é Santa Ifigênia
  const cabo = std({ color: 0x111111 });
  for (let z = -10; z < 10; z += 1.3) {
    const c = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.012, 4, 24, Math.PI), cabo);
    c.position.set(0, 3.9, z);
    c.rotation.x = Math.PI;
    c.scale.y = 0.15;
    g.add(c);
  }
  g.add(new THREE.HemisphereLight(0x8a7aaa, 0x2a1a20, 0.7));
  luzPrincipal(g, 0, 3.9, 0, 0xffe0c0, 16, new THREE.Vector3(0, 0, -2));
  return {
    modelo: 'cidade', grupo: g, entrada: { x: 0, z: 10, yaw: 0 }, palco: [{ x: -0.8, z: 7.8 }, { x: 0.9, z: 7.6 }, { x: 0, z: 7.2 }, { x: -1.8, z: 8.6 }],
    limites: [-W / 2 + 0.9, W / 2 - 0.9, -D / 2 + 0.4, D / 2 - 0.4], obstaculos: [],
    portas: [{ x: 0, z: D / 2 - 0.5, rotulo: 'Voltar para a rua' }], ceu: 0x140f1c, neblina: 0.03,
  };
}

function masmorra(): Area {
  const g = new THREE.Group();
  const W = 10;
  const D = 12;
  salaFechada(g, W, D, 4, pbr('pedra', [4, 2]), pbr('pedra', [4, 4], { color: 0x9a9aa8 }), pbr('pedra', [4, 4], { color: 0x6a6a78 }));
  movel(g, 'treasure_chest', 3.6, -3.4, { larg: 1.1, ry: -0.4 });
  movel(g, 'wooden_candlestick', 3.6, -3.4, { alt: 0.35, y: 0.62 });
  for (const [bx, bz] of [[-4, 3.8], [-3.3, 4.3]]) movel(g, 'Barrel_01', bx, bz, { alt: 0.95 });
  const cofre = std({ color: 0x4a4a55, metalness: 0.8, roughness: 0.35 });
  const ouro = std({ color: 0xc9b26b, metalness: 1, roughness: 0.3 });
  const obst: Area['obstaculos'] = [];
  for (let i = 0; i < 5; i++) {
    const x = -4 + i * 2;
    caixa(g, 1.4, 1.8, 1, cofre, x, 0, -5.3);
    const roda = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.04, 8, 24), ouro);
    roda.position.set(x, 1, -4.78);
    g.add(roda);
    obst.push([x - 0.7, x + 0.7, -5.8, -4.8]);
  }
  const tochas: THREE.PointLight[] = [];
  for (const [x, z] of [[-W / 2 + 0.2, -2], [W / 2 - 0.2, -2], [-W / 2 + 0.2, 3], [W / 2 - 0.2, 3]]) {
    cil(g, 0.04, 0.06, 0.5, std({ color: 0x3a2a1a }), x, 1.8, z, 6);
    const fogo = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 8), std({ color: 0xffa040, emissive: 0xff7a20, emissiveIntensity: 4 }));
    fogo.position.set(x, 2.42, z);
    g.add(fogo);
    const l = new THREE.PointLight(0xff8a3a, 6, 9, 1.5);
    l.position.set(x * 0.92, 2.5, z);
    g.add(l);
    tochas.push(l);
  }
  g.add(new THREE.HemisphereLight(0x5a5a7a, 0x1a1010, 0.35));
  return {
    modelo: 'masmorra', grupo: g, entrada: { x: 0, z: 4.6, yaw: 0 }, palco: [{ x: -1, z: 2.4 }, { x: 1, z: 2.3 }, { x: 0, z: 2 }, { x: 2.2, z: 2.8 }],
    limites: [-W / 2 + 0.5, W / 2 - 0.5, -D / 2 + 0.4, D / 2 - 0.4], obstaculos: obst,
    portas: [{ x: 0, z: D / 2 - 0.5, rotulo: 'Subir a escada' }], ceu: 0x0a0810, neblina: 0.04,
    atualizar: (_dt, t) => tochas.forEach((l, i) => (l.intensity = 5 + Math.sin(t * 11 + i) * 0.8 + Math.sin(t * 23 + i * 3) * 0.5)),
  };
}

function floresta(lago = false): Area {
  const g = new THREE.Group();
  const r = rnd(lago ? 77 : 41);
  plano(g, 120, 120, pbr('chao_mata', [36, 36]), 0, 0, 0, -Math.PI / 2);
  const tronco = std({ color: 0x3a2a1e, roughness: 1 });
  const folhas = [0x1f3d22, 0x24482a, 0x18341c].map((c) => std({ color: c, roughness: 1 }));
  for (let i = 0; i < (lago ? 60 : 140); i++) {
    const x = (r() - 0.5) * 80;
    const z = (r() - 0.5) * 80;
    if (Math.abs(x) < 3.5 && z > -8 && z < 14) continue;
    if (lago && z < -4 && Math.abs(x) < 22) continue;
    const h = 4 + r() * 8;
    cil(g, 0.12, 0.24, h * 0.55, tronco, x, 0, z, 6);
    const copa = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2 + r() * 1.6, 0), folhas[i % 3]);
    copa.position.set(x, h * 0.55 + 1, z);
    copa.castShadow = true;
    g.add(copa);
  }
  if (lago) {
    const agua = plano(g, 50, 30, std({ color: 0x0c1a2c, metalness: 0.9, roughness: 0.08 }), 0, 0.02, -19, -Math.PI / 2);
    agua.receiveShadow = false;
  } else {
    // galpão do viveiro com gaiolas
    caixa(g, 6, 3, 4, texMat(T.madeira([3, 1], '#4a3220')), 0, 0, -9);
    const grade = std({ color: 0x777777, metalness: 0.8, roughness: 0.4, wireframe: true });
    for (const x of [-4.5, 4.5]) caixa(g, 1.2, 1.2, 1.2, grade, x, 0, -6);
  }
  const vagalumes: THREE.Mesh[] = [];
  for (let i = 0; i < 24; i++) {
    const v = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), std({ color: 0x000000, emissive: 0xb5ff7a, emissiveIntensity: 4 }));
    v.position.set((r() - 0.5) * 16, 0.5 + r() * 2, (r() - 0.5) * 16);
    v.userData.base = v.position.clone();
    g.add(v);
    vagalumes.push(v);
  }
  g.add(new THREE.HemisphereLight(0x6a8aaa, 0x101a10, 0.7));
  const lua = new THREE.DirectionalLight(0xa9b8ff, 1.1);
  lua.position.set(10, 30, 10);
  lua.castShadow = true;
  lua.shadow.mapSize.set(1024, 1024);
  Object.assign(lua.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25 });
  g.add(lua);
  return {
    modelo: lago ? 'lago' : 'floresta', grupo: g, entrada: { x: 0, z: 10, yaw: 0 }, palco: [{ x: -1, z: 7.6 }, { x: 1.2, z: 7.4 }, { x: 0, z: 7 }, { x: -2.2, z: 8.4 }],
    limites: [-14, 14, lago ? -3.5 : -6.5, 18], obstaculos: lago ? [] : [[-3.2, 3.2, -11.2, -6.8]],
    portas: [{ x: 0, z: 17.5, rotulo: 'Voltar pela trilha' }], ceu: 0x0e1622, neblina: 0.045,
    atualizar: (_dt, t) => vagalumes.forEach((v, i) => {
      const b = v.userData.base as THREE.Vector3;
      v.position.set(b.x + Math.sin(t * 0.7 + i) * 0.6, b.y + Math.sin(t * 1.3 + i * 2) * 0.3, b.z + Math.cos(t * 0.5 + i) * 0.6);
    }),
  };
}

function campo(): Area {
  const g = new THREE.Group();
  plano(g, 140, 140, pbr('grama', [46, 46]), 0, 0, 0, -Math.PI / 2);
  const ouro = std({ color: 0xd9b54f, metalness: 0.9, roughness: 0.3 });
  for (const z of [-30, 30])
    for (const [x, h] of [[-4, 12], [0, 15], [4, 10]]) {
      cil(g, 0.12, 0.15, h, ouro, x, 0, z, 10);
      const aro = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.09, 10, 32), ouro);
      aro.position.set(x, h + 1.2, z);
      g.add(aro);
    }
  const madeira = texMat(T.madeira([4, 1], '#5a3a20'));
  for (const x of [-22, 22])
    for (let k = 0; k < 6; k++) caixa(g, 2, 0.5 + k * 0.6, 50, madeira, x + Math.sign(x) * k * 1.1, 0, 0);
  COR_CASA.forEach((c, i) => plano(g, 2, 6, std({ color: c, side: THREE.DoubleSide }), -28 + (i % 2) * 56, 8, -15 + i * 10, 0, Math.PI / 2));
  const flag = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), std({ color: 0xffd700, emissive: 0xffaa00, emissiveIntensity: 2, metalness: 1 }));
  g.add(flag);
  g.add(new THREE.HemisphereLight(0xbfd8ff, 0x3a5a2a, 1.2));
  const sol = new THREE.DirectionalLight(0xfff2d8, 1.8);
  sol.position.set(20, 40, 10);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40 });
  g.add(sol);
  return {
    modelo: 'campo', grupo: g, entrada: { x: 0, z: 14, yaw: 0 }, palco: [{ x: -1.2, z: 11.6 }, { x: 1.2, z: 11.4 }, { x: 0, z: 11 }, { x: -2.4, z: 12.4 }],
    limites: [-18, 18, -34, 34], obstaculos: [],
    portas: [{ x: 0, z: 33, rotulo: 'Voltar ao castelo' }], ceu: 0x9fbfe0, neblina: 0.018,
    atualizar: (_dt, t) => flag.position.set(Math.sin(t * 1.3) * 8, 7 + Math.sin(t * 2.1) * 3, Math.cos(t * 0.9) * 12),
  };
}

// ---------------------------------------------------------------- escolha do modelo por lugar

export function modeloDoLugar(l: Lugar | undefined): string {
  if (!l) return 'patio';
  const fixo: Record<string, string> = {
    refeitorio: 'salao', dormitorio: 'dormitorio', lab_terminal: 'aula', biblioteca: 'biblioteca', datacenter: 'datacenter',
    casa_vo: 'casa', estacao: 'trem', santa_ifigenia: 'cidade', cripta: 'masmorra', torre_redes: 'torre', viveiro: 'floresta',
    mata: 'floresta', campo: 'campo', sala_diretora: 'torre', represa: 'lago', vila: 'cidade', secretaria: 'colunas', patio: 'patio',
  };
  if (fixo[l.id]) return fixo[l.id];
  const txt = `${l.nome} ${l.descricao}`.toLowerCase();
  if (l.cena === 'sala') {
    if (/biblioteca|arquivo|livro|estante/.test(txt)) return 'biblioteca';
    if (/rack|servidor|data center|datacenter|coletor|switch/.test(txt)) return 'datacenter';
    if (/dormit/.test(txt)) return 'dormitorio';
    if (/refeit|salão|galpão/.test(txt)) return 'salao';
    return 'aula';
  }
  return ({ castelo: 'patio', masmorra: 'masmorra', floresta: 'floresta', cidade: 'cidade', casa: 'casa', trem: 'trem', campo: 'campo', torre: 'torre', lago: 'lago', banco: 'colunas', ministerio: 'colunas' } as Record<string, string>)[l.cena] ?? 'aula';
}

export function construir(modelo: string): Area {
  switch (modelo) {
    case 'patio': return patio();
    case 'salao': return salao();
    case 'colunas': return salao(true);
    case 'aula': return sala('aula');
    case 'biblioteca': return sala('biblioteca');
    case 'datacenter': return sala('datacenter');
    case 'torre': return sala('torre');
    case 'dormitorio': return dormitorio();
    case 'casa': return casa();
    case 'trem': return trem();
    case 'cidade': return cidade();
    case 'masmorra': return masmorra();
    case 'floresta': return floresta();
    case 'lago': return floresta(true);
    case 'campo': return campo();
    default: return sala('aula');
  }
}

export function aplicarAmbiente(a: Area) {
  M.cena.background = new THREE.Color(a.ceu);
  M.cena.fog = new THREE.FogExp2(a.ceu, a.neblina);
}
