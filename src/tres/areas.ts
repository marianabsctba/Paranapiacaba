// Ambientes 3D. Cada lugar do conteúdo vira um desses modelos, escolhido pelo tipo de cena.
// Arquitetura inspirada na vila ferroviária real de Paranapiacaba: tijolo inglês, madeira,
// ferro, telhado de duas águas, torre do relógio e neblina.
import * as THREE from 'three';
import type { Lugar } from '../conteudo/tipos';
import * as T from './texturas';
import { M } from './motor3d';
import { pbr } from './pbr';
import { movel, repetir } from './moveis';
import { comida, velasFlutuantes } from './banquete';
import { brasaoSvg } from '../arte/brasao';
import { CASA_INFO } from '../motor/texto';
import { criarBicho } from './bichos';
import { foto } from './foto';

export interface Area {
  modelo: string;
  grupo: THREE.Group;
  entrada: { x: number; z: number; yaw: number };
  palco: { x: number; z: number }[];
  professor?: { x: number; z: number };
  assento?: { x: number; z: number; yaw: number };
  // lugares onde personagens sentam (cadeira, banco); casa = índice da casa da mesa no refeitório
  assentos?: { x: number; z: number; ry: number; casa?: number; y?: number }[];
  lousa?: THREE.Mesh;
  // onde cada um fica no duelo (sem isso, o duelo se arranja na frente da entrada)
  duelo?: { voce: { x: number; z: number; yaw: number }; oponente: { x: number; z: number }; y?: number };
  limites: [number, number, number, number];
  // onde os personagens podem ficar, quando é diferente de onde você anda (ex.: entre os bancos do trem)
  limitesNpc?: [number, number, number, number];
  obstaculosNpc?: [number, number, number, number][];
  obstaculos: [number, number, number, number][];
  // destino: lugar para onde a porta leva direto (sem abrir o mapa); "acao:..." dispara uma ação do lugar
  portas: { x: number; z: number; rotulo: string; destino?: string }[];
  // quem já está no lugar quando você chega (dono da loja, atendente)
  gente?: { id: string; x: number; z: number; ry: number }[];
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

/** estandarte de tecido com o brasão bordado e a ponta em rabo de andorinha */
function estandarte(g: THREE.Object3D, casa: 'oncarina' | 'tucanal' | 'capivarias' | 'jararacas', x: number, y: number, z: number) {
  const info = CASA_INFO[casa];
  const cv = document.createElement('canvas');
  cv.width = 256;
  cv.height = 640;
  const c = cv.getContext('2d')!;
  const pano = () => {
    c.clearRect(0, 0, 256, 640);
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(256, 0);
    c.lineTo(256, 640);
    c.lineTo(128, 560);
    c.lineTo(0, 640);
    c.closePath();
    const gr = c.createLinearGradient(0, 0, 256, 0);
    gr.addColorStop(0, info.cor2);
    gr.addColorStop(0.5, info.cor);
    gr.addColorStop(1, info.cor2);
    c.fillStyle = gr;
    c.fill();
    c.strokeStyle = '#d9a520';
    c.lineWidth = 10;
    c.stroke();
    for (let i = 0; i < 256; i += 3) {
      c.fillStyle = 'rgba(0,0,0,0.05)';
      c.fillRect(i, 0, 1, 640);
    }
  };
  pano();
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const img = new Image();
  img.onload = () => {
    c.drawImage(img, 28, 70, 200, 240);
    c.fillStyle = '#f2e6c8';
    c.font = 'italic 22px Georgia, serif';
    c.textAlign = 'center';
    const palavras = info.lema.split(' ');
    let linha = '';
    let yy = 360;
    for (const p of palavras) {
      if (c.measureText(linha + p).width > 210) {
        c.fillText(linha.trim(), 128, yy);
        yy += 28;
        linha = '';
      }
      linha += p + ' ';
    }
    c.fillText(linha.trim(), 128, yy);
    tex.needsUpdate = true;
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(brasaoSvg(casa));
  const geo = new THREE.PlaneGeometry(1.6, 4, 8, 16);
  // leve ondulação do tecido
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getY(i) * 2.2 + pos.getX(i)) * 0.04);
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, std({ map: tex, roughness: 0.92, side: THREE.DoubleSide, alphaTest: 0.5, transparent: false }));
  m.position.set(x, y, z);
  m.castShadow = true;
  g.add(m);
  const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 8), std({ color: 0xd9a520, metalness: 0.9, roughness: 0.3 }));
  haste.rotation.z = Math.PI / 2;
  haste.position.set(x, y + 2.03, z + 0.03);
  g.add(haste);
}

const COR_CASA = [0xe8a317, 0xff7f11, 0x3fb59f, 0x9ccc65];

/** conta de luz com o QR code do convite impresso no verso */
function contaDeLuz(): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = 256;
  cv.height = 362;
  const c = cv.getContext('2d')!;
  c.fillStyle = '#f4f1ea';
  c.fillRect(0, 0, 256, 362);
  c.fillStyle = '#1d4e89';
  c.fillRect(0, 0, 256, 44);
  c.fillStyle = '#fff';
  c.font = 'bold 20px sans-serif';
  c.fillText('CONTA DE LUZ', 14, 30);
  c.fillStyle = '#333';
  c.font = '13px sans-serif';
  ['Cliente: Aparecida (Vó Cida)', 'Nova Iguaçu, RJ', 'Vencimento: 10/09', 'Total: R$ 240,00'].forEach((l, i) => c.fillText(l, 14, 70 + i * 20));
  // QR code fictício: padrão determinístico com os três quadrados de canto
  const ox = 64, oy = 170, n = 25, q = 5;
  let s = 7;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  c.fillStyle = '#fff';
  c.fillRect(ox - 8, oy - 8, n * q + 16, n * q + 16);
  c.fillStyle = '#111';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (rnd() > 0.5) c.fillRect(ox + x * q, oy + y * q, q, q);
  for (const [cx, cy] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
    c.fillStyle = '#111';
    c.fillRect(ox + cx * q, oy + cy * q, 7 * q, 7 * q);
    c.fillStyle = '#fff';
    c.fillRect(ox + (cx + 1) * q, oy + (cy + 1) * q, 5 * q, 5 * q);
    c.fillStyle = '#111';
    c.fillRect(ox + (cx + 2) * q, oy + (cy + 2) * q, 3 * q, 3 * q);
  }
  c.fillStyle = '#7a3b5a';
  c.font = 'italic 12px sans-serif';
  c.fillText('Leia com atenção. Ou não.', 60, 330);
  const tx = new THREE.CanvasTexture(cv);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
}

/** teclas de um teclado mecânico visto de cima */
function teclado(): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = 512;
  cv.height = 180;
  const c = cv.getContext('2d')!;
  c.fillStyle = '#1b1b1f';
  c.fillRect(0, 0, 512, 180);
  const linhas = [15, 14, 13, 12];
  linhas.forEach((qtd, l) => {
    const w = 512 / 15.5;
    for (let i = 0; i < qtd; i++) {
      c.fillStyle = (l + i) % 7 === 0 ? '#c9a227' : '#e8e4da';
      c.fillRect(8 + i * w + l * 8, 10 + l * 36, w - 5, 30);
    }
  });
  c.fillStyle = '#e8e4da';
  c.fillRect(140, 154, 230, 22);
  const tx = new THREE.CanvasTexture(cv);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
}

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
    const mesas: { x: number; z: number }[] = [];
    for (const x of [-4.2, -1.4, 1.4, 4.2]) {
      for (let z = -12; z <= 8; z += 2.1) mesas.push({ x, z });
      // bancos corridos de refeitório, na altura do assento
      const banco = pbr('assoalho', [0.4, 8]);
      for (const lx of [x - 0.78, x + 0.78]) {
        caixa(g, 0.34, 0.06, 22.4, banco, lx, 0.42, -2);
        for (let bz = -12.6; bz <= 8.6; bz += 2.8) caixa(g, 0.28, 0.42, 0.08, banco, lx, 0, bz);
      }
    }
    repetir(g, 'dining_table', mesas, { alt: 0.78, ry: Math.PI / 2 });
    movel(g, 'vintage_grandfather_clock_01', -W / 2 + 0.5, -D / 2 + 0.8, { alt: 2.3, ry: Math.PI / 2 });
    comida(g, [-4.2, -1.4, 1.4, 4.2].map((x) => ({ x, z0: -13, z1: 9, y: 0.78 })));
    velas = velasFlutuantes(g, -W / 2 + 1, W / 2 - 1, -D / 2 + 1.5, D / 2 - 2, 5.2, 7.6);
    // estandartes das casas
    (['oncarina', 'tucanal', 'capivarias', 'jararacas'] as const).forEach((casa, i) => estandarte(g, casa, -4.5 + i * 3, 5.2, -15.9));
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
    assentos: colunas ? undefined : [-4.2, -1.4, 1.4, 4.2].flatMap((x, casa) => [-11, -8, -5, -2, 1, 4, 7].flatMap((z) => [{ x: x - 0.78, z, ry: Math.PI / 2, casa }, { x: x + 0.78, z: z + 1.2, ry: -Math.PI / 2, casa }])),
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
  let assentos: Area['assentos'];
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
    const lugares: { x: number; z: number }[] = [];
    for (let fila = 0; fila < 3; fila++)
      for (const x of [-3.2, -1, 1.2, 3.4]) {
        const z = -2.4 + fila * 2.4;
        lugares.push({ x, z });
        obst.push([x - 0.5, x + 0.5, z - 0.4, z + 1]);
      }
    repetir(g, 'SchoolDesk_01', lugares, { alt: 0.76 });
    repetir(g, 'classic_laptop', lugares.map((p) => ({ x: p.x, z: p.z - 0.05 })), { larg: 0.34, y: 0.76, ry: 0 }, false);
    repetir(g, 'SchoolChair_01', lugares.map((p) => ({ x: p.x, z: p.z + 0.62 })), { alt: 0.84, ry: Math.PI });
    movel(g, 'wooden_bookshelf_worn', -W / 2 + 0.45, 3.5, { alt: 2.2, ry: Math.PI / 2 });
    movel(g, 'potted_plant_01', W / 2 - 0.6, -D / 2 + 0.7, { alt: 1.1 });
    // você senta numa carteira da última fila; os colegas ocupam as outras
    assento = { x: 1.2, z: 2.4 + 0.62, yaw: 0 };
    assentos = lugares.filter((p) => !(p.x === 1.2 && p.z === 2.4)).map((p) => ({ x: p.x, z: p.z + 0.62, ry: Math.PI }));
  } else if (variante === 'biblioteca') {
    const livros = [0x7a2e2e, 0x2e4a7a, 0x2e6a3a, 0x8a6a2a, 0x5a2e6a, 0x3a3a3a];
    void livros;
    const estantes: { x: number; z: number }[] = [];
    const livrosPos: { x: number; z: number; y: number; ry: number }[] = [];
    for (const x of [-4.5, -1.5, 1.5, 4.5]) {
      for (const z of [-3, 1]) {
        estantes.push({ x, z });
        for (const y of [0.1, 0.55, 1.0, 1.45, 1.9]) for (const dx of [-0.45, 0.45]) livrosPos.push({ x: x + dx, z, y, ry: r() < 0.5 ? 0 : Math.PI });
        obst.push([x - 1.1, x + 1.1, z - 0.4, z + 0.4]);
      }
    }
    repetir(g, 'wooden_bookshelf_worn', estantes, { alt: 2.6 });
    // lombadas de livro desenhadas de uma vez só: as coleções 3D pesavam quase 3 milhões de triângulos
    void livrosPos;
    const cores = [0x7a2e2e, 0x2e4a7a, 0x2e6a3a, 0x8a6a2a, 0x5a2e6a, 0x3a3a3a, 0x9a4a2a, 0x2a5a5a, 0xc9b26b];
    const lombadas: { x: number; y: number; z: number; w: number; h: number; c: number }[] = [];
    for (const e of estantes)
      for (const y of [0.12, 0.6, 1.08, 1.56, 2.04]) {
        let x = e.x - 0.74;
        while (x < e.x + 0.7) {
          const w = 0.03 + r() * 0.035;
          if (r() > 0.08) lombadas.push({ x: x + w / 2, y, z: e.z, w, h: 0.26 + r() * 0.12, c: cores[Math.floor(r() * cores.length)] });
          x += w + 0.004;
        }
      }
    const livro = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 0.24).translate(0, 0.5, 0), std({ color: 0xffffff, roughness: 0.75 }), lombadas.length);
    const mm = new THREE.Matrix4();
    lombadas.forEach((l, i) => {
      mm.makeScale(l.w, l.h, 1).setPosition(l.x, l.y, l.z);
      livro.setMatrixAt(i, mm);
      livro.setColorAt(i, new THREE.Color(l.c));
    });
    livro.receiveShadow = true;
    g.add(livro);
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
    professor: { x: 1.6, z: -D / 2 + 1.5 }, assento, assentos, lousa,
    limites: [-W / 2 + 0.4, W / 2 - 0.4, -D / 2 + 0.4, D / 2 - 0.4], obstaculos: obst,
    portas: [{ x: -W / 2 + 0.5, z: 5.5, rotulo: 'Sair da sala' }], ceu: 0x0e0b18, neblina: 0.02,
    atualizar: atualiza.length ? (dt, t) => atualiza.forEach((f) => f(dt, t)) : undefined,
  };
}

/** quadro de cortiça com post-its de 1998 */
function cortica(): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = 512;
  cv.height = 320;
  const g = cv.getContext('2d')!;
  g.fillStyle = '#a8784a';
  g.fillRect(0, 0, 512, 320);
  const rr = rnd(7);
  for (let i = 0; i < 1400; i++) {
    g.fillStyle = rr() < 0.5 ? 'rgba(90,55,25,0.35)' : 'rgba(210,170,120,0.3)';
    g.fillRect(rr() * 512, rr() * 320, 2, 2);
  }
  const notas = [['senha do', 'wi-fi: NÃO'], ['backup', 'sexta'], ['trocar', 'toner', '(1998)'], ['ligar p/', 'provedor'], ['NÃO', 'clicar'], ['reunião', '14h'], ['modem', '56k ok?']];
  const cores = ['#fff275', '#ff9fd2', '#9fe7ff', '#b8ff9f', '#ffd29f'];
  notas.forEach((linhas, i) => {
    const x = 20 + (i % 4) * 122 + rr() * 10;
    const y = 20 + Math.floor(i / 4) * 150 + rr() * 12;
    g.save();
    g.translate(x + 50, y + 50);
    g.rotate((rr() - 0.5) * 0.25);
    g.fillStyle = cores[i % cores.length];
    g.fillRect(-50, -50, 100, 100);
    g.fillStyle = '#222';
    g.font = '16px "Comic Sans MS", cursive';
    g.textAlign = 'center';
    linhas.forEach((ln, k) => g.fillText(ln, 0, -14 + k * 20));
    g.fillStyle = '#c0392b';
    g.beginPath();
    g.arc(0, -42, 5, 0, Math.PI * 2);
    g.fill();
    g.restore();
  });
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** gabinete da diretora: madeira, estantes, modems antigos, cafeteira que fala e os quatro estandartes */
function gabinete(): Area {
  const g = new THREE.Group();
  const W = 9;
  const D = 10;
  const H = 4.2;
  salaFechada(g, W, D, H, pbr('reboco', [3, 1.5], { color: 0xd9c7a8 }), pbr('assoalho', [3, 3]), std({ color: 0x3a2618, roughness: 1 }));
  const madeira = texMat(T.madeira([2, 1], '#4a2c18'), { roughness: 0.55 });
  // lambri de madeira na metade de baixo das paredes
  caixa(g, W, 1.2, 0.05, madeira, 0, 0, -D / 2 + 0.03);
  caixa(g, 0.05, 1.2, D, madeira, -W / 2 + 0.03, 0, 0);
  caixa(g, 0.05, 1.2, D, madeira, W / 2 - 0.03, 0, 0);
  // tapete
  plano(g, 4.2, 5, std({ map: T.tecido('#6a1f2b', [4, 4]).map, roughness: 1 }), 0, 0.01, -0.6, -Math.PI / 2);
  // mesa da diretora com abajur, papelada e computador
  movel(g, 'painted_wooden_table', 0, -2.6, { larg: 2.2 });
  movel(g, 'desk_lamp_arm_01', -0.8, -2.75, { alt: 0.45, y: 0.76 });
  movel(g, 'classic_laptop', 0.3, -2.7, { larg: 0.36, y: 0.76 });
  const papel = std({ color: 0xf2eee2, roughness: 1 });
  for (let i = 0; i < 4; i++) caixa(g, 0.3, 0.012, 0.22, papel, -0.3 + (i % 2) * 0.05, 0.765 + i * 0.012, -2.45, i * 0.2);
  // estantes de livros no fundo
  for (const x of [-3.1, 3.1]) {
    movel(g, 'wooden_bookshelf_worn', x, -D / 2 + 0.4, { alt: 2.3 });
    for (const y of [0.42, 0.8, 1.18, 1.56, 1.94]) movel(g, 'book_encyclopedia_set_01', x, -D / 2 + 0.4, { larg: 0.75, y });
  }
  // prateleira de modems antigos com LED piscando
  const plastico = std({ color: 0xcfc8b8, roughness: 0.6 });
  caixa(g, 0.35, 0.04, 2.2, madeira, W / 2 - 0.2, 1.3, -1);
  const leds: THREE.MeshStandardMaterial[] = [];
  for (let i = 0; i < 4; i++) {
    caixa(g, 0.26, 0.08, 0.36, plastico, W / 2 - 0.22, 1.34, -1.8 + i * 0.52);
    const led = std({ color: 0x000000, emissive: [0x33ff55, 0xffaa22, 0x33ff55, 0xff3344][i], emissiveIntensity: 2 });
    leds.push(led);
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), led);
    l.position.set(W / 2 - 0.36, 1.39, -1.8 + i * 0.52);
    g.add(l);
  }
  // cafeteira que fala, num aparador
  caixa(g, 0.5, 0.9, 1.1, madeira, -W / 2 + 0.3, 0, 1.6);
  caixa(g, 0.22, 0.32, 0.2, std({ color: 0x1c1c1c, metalness: 0.4, roughness: 0.4 }), -W / 2 + 0.3, 0.9, 1.6);
  const vozCafe = std({ color: 0x000000, emissive: 0x6ef2ff, emissiveIntensity: 1 });
  const olho = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), vozCafe);
  olho.position.set(-W / 2 + 0.42, 1.12, 1.6);
  g.add(olho);
  // quadro de cortiça com post-its
  plano(g, 1.6, 1, std({ map: cortica(), roughness: 1 }), -W / 2 + 0.06, 1.9, -1.2, 0, Math.PI / 2);
  // os quatro estandartes atrás da mesa
  const faixas = new THREE.Group();
  faixas.scale.setScalar(0.62);
  faixas.position.set(0, 0, -D / 2 + 0.08);
  g.add(faixas);
  (['oncarina', 'tucanal', 'capivarias', 'jararacas'] as const).forEach((c, i) => estandarte(faixas, c, (-1.5 + i) * 1.75, 4.2, 0));
  movel(g, 'vintage_grandfather_clock_01', -W / 2 + 0.45, -3.6, { alt: 2.1, ry: Math.PI / 2 });
  movel(g, 'Sofa_01', 0, 1.6, { larg: 2, ry: Math.PI });
  movel(g, 'potted_plant_01', W / 2 - 0.6, 3.8, { alt: 1.3 });
  movel(g, 'Chandelier_01', 0, -0.6, { alt: 0.9, y: H, pendurado: true });
  janela(g, W / 2 - 0.02, 2.3, 2.2, 1.3, 1.8, -Math.PI / 2);
  luzPrincipal(g, 0, H - 0.2, 1.5, 0xffe2b8, 26, new THREE.Vector3(0, 0, -2));
  lampiao(g, 0, H - 1.1, -0.6, 5, 8);
  g.add(new THREE.HemisphereLight(0xfff0dc, 0x4a3020, 1));
  return {
    modelo: 'gabinete', grupo: g, entrada: { x: 0, z: 3.6, yaw: 0 }, palco: [{ x: -1.3, z: -0.6 }, { x: 1.3, z: -0.7 }, { x: 0, z: -1.6 }, { x: 2.2, z: 0.2 }],
    professor: { x: 0, z: -3.4 },
    limites: [-W / 2 + 0.5, W / 2 - 0.5, -D / 2 + 0.6, D / 2 - 0.4],
    obstaculos: [[-1.2, 1.2, -3.1, -2.1], [-3.7, -2.5, -D / 2, -4.2], [2.5, 3.7, -D / 2, -4.2], [-1.1, 1.1, 1.1, 2.1], [-W / 2, -W / 2 + 0.6, 1, 2.2]],
    portas: [{ x: 0, z: D / 2 - 0.5, rotulo: 'Sair do gabinete' }], ceu: 0x0e0b18, neblina: 0.01,
    atualizar: (_dt, t) => {
      leds.forEach((l, i) => (l.emissiveIntensity = Math.sin(t * (3 + i * 1.7)) > 0.2 ? 2.5 : 0.2));
      vozCafe.emissiveIntensity = 0.6 + Math.abs(Math.sin(t * 2.2)) * 1.6;
    },
  };
}

/** pombal no alto da torre (ou a sala do relógio, com o mostrador por dentro) */
function pombal(relogio = false): Area {
  const g = new THREE.Group();
  const W = 8;
  const D = 8;
  const H = 5;
  salaFechada(g, W, D, H, pbr('tijolo', [3, 2]), pbr('assoalho', [3, 3], { color: 0xb8a890 }), std({ color: 0x2a1c12, roughness: 1 }));
  const madeira = texMat(T.madeira([1, 1], '#5a3c22'), { roughness: 0.8 });
  const rr = rnd(relogio ? 11 : 5);
  // vigas do telhado
  for (let x = -3; x <= 3; x += 1.5) caixa(g, 0.18, 0.22, D, madeira, x, H - 0.5, 0);
  // caixotes e um saco de milho no canto
  for (const [x, z] of [[-2.6, 2.6], [-2.1, 2.9]] as const) caixa(g, 0.6, 0.5, 0.6, madeira, x, 0, z, rr());
  movel(g, 'Barrel_01', 2.6, 2.6, { alt: 0.8 });
  const atualiza: ((t: number) => void)[] = [];
  if (relogio) {
    // o mostrador gigante visto por dentro, com os ponteiros e as engrenagens girando
    const cv = document.createElement('canvas');
    cv.width = cv.height = 512;
    const c = cv.getContext('2d')!;
    c.fillStyle = '#f3ead2';
    c.beginPath();
    c.arc(256, 256, 250, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#2a1c12';
    c.font = 'bold 54px serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    ['XII', 'III', 'VI', 'IX'].forEach((n, i) => c.fillText(n, 256 + Math.sin((i * Math.PI) / 2) * 190, 256 - Math.cos((i * Math.PI) / 2) * 190));
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mostrador = new THREE.Mesh(new THREE.CircleGeometry(1.8, 48), std({ map: tex, emissive: 0xfff2d0, emissiveMap: tex, emissiveIntensity: 0.6 }));
    mostrador.position.set(0, 2.6, -D / 2 + 0.05);
    g.add(mostrador);
    const ferro = std({ color: 0x1a1a1a, metalness: 0.7, roughness: 0.4 });
    const ponteiros = [1.4, 1.0].map((comp, i) => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.07, comp, 0.03), ferro);
      p.geometry.translate(0, comp / 2, 0);
      p.position.set(0, 2.6, -D / 2 + 0.1 + i * 0.03);
      g.add(p);
      return p;
    });
    atualiza.push((t) => {
      ponteiros[0].rotation.z = t * 0.2;
      ponteiros[1].rotation.z = t * 0.017;
    });
    for (const [x, y, raio] of [[-2.6, 1.4, 0.7], [-1.8, 0.6, 0.4], [2.5, 1.2, 0.6]] as const) {
      const e = new THREE.Mesh(new THREE.TorusGeometry(raio, 0.08, 6, 24), std({ color: 0x8a6a3a, metalness: 0.8, roughness: 0.35 }));
      e.position.set(x, y, -D / 2 + 0.4);
      g.add(e);
      atualiza.push((t) => (e.rotation.z = t * (raio > 0.5 ? 0.3 : -0.5)));
    }
  } else {
    // janela redonda com o céu
    const vidro = new THREE.Mesh(new THREE.CircleGeometry(0.8, 32), std({ color: 0x8aa8c8, emissive: 0x8aa8c8, emissiveIntensity: 0.9 }));
    vidro.position.set(0, 2.8, -D / 2 + 0.03);
    g.add(vidro);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.07, 8, 32), madeira);
    aro.position.copy(vidro.position);
    g.add(aro);
  }
  // ninhos de madeira nas paredes laterais, com pombas
  const pombas: { b: ReturnType<typeof criarBicho>; f: number }[] = [];
  for (const lado of [-1, 1]) {
    for (let fila = 0; fila < 3; fila++) {
      for (let col = 0; col < 4; col++) {
        const z = -2.4 + col * 1.4;
        const y = 0.9 + fila * 0.9;
        caixa(g, 0.6, 0.06, 1.2, madeira, lado * (W / 2 - 0.3), y, z);
        caixa(g, 0.6, 0.6, 0.05, madeira, lado * (W / 2 - 0.3), y, z - 0.6);
        if ((fila + col + (lado > 0 ? 1 : 0)) % 2 === 0 && pombas.length < (relogio ? 4 : 9)) {
          const b = criarBicho('pomba');
          b.grupo.scale.setScalar(0.7);
          b.grupo.position.set(lado * (W / 2 - 0.35), y + 0.06, z + (rr() - 0.5) * 0.4);
          b.grupo.rotation.y = lado > 0 ? -Math.PI / 2 : Math.PI / 2;
          g.add(b.grupo);
          pombas.push({ b, f: rr() * 10 });
        }
      }
    }
  }
  luzPrincipal(g, 0, H - 0.3, 1.5, 0xffe6c0, 22, new THREE.Vector3(0, 0, -2));
  lampiao(g, 0, H - 1.2, 0, 4, 8);
  g.add(new THREE.HemisphereLight(0xc8d0e0, 0x4a3828, 0.9));
  return {
    modelo: relogio ? 'relogio' : 'pombal', grupo: g, entrada: { x: 0, z: 2.8, yaw: 0 }, palco: [{ x: -1, z: 0.6 }, { x: 1, z: 0.5 }, { x: 0, z: 0 }, { x: 1.8, z: 1.4 }],
    limites: [-W / 2 + 1, W / 2 - 1, -D / 2 + 0.8, D / 2 - 0.4], obstaculos: [],
    portas: [{ x: 0, z: D / 2 - 0.5, rotulo: 'Descer a escada' }], ceu: 0x0e0b18, neblina: 0.015,
    atualizar: (_dt, t) => {
      pombas.forEach((p) => p.b.animar(t + p.f, false));
      atualiza.forEach((fn) => fn(t));
    },
  };
}

/** galeria dos formandos: corredor com retratos de quem já se formou */
function galeria(): Area {
  const g = new THREE.Group();
  const W = 5;
  const D = 18;
  const H = 4.4;
  salaFechada(g, W, D, H, pbr('reboco', [2, 4], { color: 0xcbb592 }), pbr('assoalho', [2, 6]), std({ color: 0x2a1c14, roughness: 1 }));
  const madeira = texMat(T.madeira([3, 1], '#3e2414'), { roughness: 0.5 });
  caixa(g, 0.05, 1.1, D, madeira, -W / 2 + 0.03, 0, 0);
  caixa(g, 0.05, 1.1, D, madeira, W / 2 - 0.03, 0, 0);
  // passadeira vermelha
  plano(g, 1.6, D - 1, std({ map: T.tecido('#7a1a24', [2, 8]).map, roughness: 1 }), 0, 0.01, 0, -Math.PI / 2);
  // retratos em molduras douradas; a foto aparece quando termina de renderizar
  const ouro = std({ color: 0xb8933e, metalness: 0.9, roughness: 0.35 });
  const quem = ['iolanda', 'otavio', 'ruth', 'heitor', 'nanda', 'marlene', 'adulto1', 'adulta1', 'baltazar', 'zuleica'];
  const turmas = ['1979', '1984', '1991', '1993', '2004', '1998', '2009', '2012', '1987', '1982'];
  quem.forEach((id, i) => {
    const lado = i % 2 ? 1 : -1;
    const z = -7 + Math.floor(i / 2) * 3.2;
    const x = lado * (W / 2 - 0.06);
    const ry = -lado * Math.PI / 2;
    const moldura = caixa(g, 0.95, 1.25, 0.06, ouro, x, 1.45, z, ry);
    moldura.castShadow = false;
    const tela = plano(g, 0.8, 1.05, std({ color: 0x3a3028, roughness: 0.8 }), x - lado * 0.04, 2.07, z, 0, ry);
    foto(id).then((url) => {
      new THREE.TextureLoader().load(url, (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        const m = tela.material as THREE.MeshStandardMaterial;
        m.map = t;
        m.color.set(0xffffff);
        m.needsUpdate = true;
      });
    }).catch(() => undefined);
    const plaquinha = plano(g, 0.5, 0.12, std({ map: T.placa('Turma de ' + turmas[i], '#2a1a10', '#e8c66a', 256, 64), roughness: 0.6 }), x - lado * 0.04, 1.35, z, 0, ry);
    plaquinha.castShadow = false;
    caixa(g, 0.5, 0.05, 0.12, ouro, x - lado * 0.1, 2.75, z, ry);
  });
  for (let z = -6; z <= 6; z += 6) lampiao(g, 0, H - 0.9, z, 5, 9);
  luzPrincipal(g, 0, H - 0.2, 4, 0xffe2b8, 24, new THREE.Vector3(0, 0, -4));
  g.add(new THREE.HemisphereLight(0xfff0dc, 0x4a3020, 1));
  return {
    modelo: 'galeria', grupo: g, entrada: { x: 0, z: D / 2 - 1.6, yaw: 0 }, palco: [{ x: -0.8, z: D / 2 - 3.6 }, { x: 0.8, z: D / 2 - 3.7 }, { x: 0, z: D / 2 - 4.2 }, { x: -0.6, z: D / 2 - 5 }],
    limites: [-W / 2 + 0.6, W / 2 - 0.6, -D / 2 + 0.5, D / 2 - 0.4], obstaculos: [],
    portas: [{ x: 0, z: D / 2 - 0.5, rotulo: 'Sair da galeria' }], ceu: 0x0e0b18, neblina: 0.01,
  };
}

// ---------------------------------------------------------------- vila de Paranapiacaba

/** telhado de duas águas: prisma triangular de largura w, altura h e comprimento len (ao longo de z) */
function telhado(g: THREE.Object3D, w: number, h: number, len: number, m: THREE.Material, x: number, y: number, z: number, ry = 0) {
  const forma = new THREE.Shape();
  forma.moveTo(-w / 2 - 0.25, 0);
  forma.lineTo(w / 2 + 0.25, 0);
  forma.lineTo(0, h);
  forma.closePath();
  const geo = new THREE.ExtrudeGeometry(forma, { depth: len + 0.4, bevelEnabled: false });
  geo.translate(0, 0, -(len + 0.4) / 2);
  const me = new THREE.Mesh(geo, m);
  me.position.set(x, y, z);
  me.rotation.y = ry;
  me.castShadow = true;
  me.receiveShadow = true;
  g.add(me);
  return me;
}

/** mostrador de relógio desenhado em canvas */
function mostradorRelogio(): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const c = cv.getContext('2d')!;
  c.fillStyle = '#f3ead2';
  c.beginPath();
  c.arc(128, 128, 124, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = '#2a1c12';
  c.lineWidth = 6;
  c.stroke();
  c.fillStyle = '#2a1c12';
  c.font = 'bold 28px serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  ['XII', 'III', 'VI', 'IX'].forEach((n, i) => c.fillText(n, 128 + Math.sin((i * Math.PI) / 2) * 92, 128 - Math.cos((i * Math.PI) / 2) * 92));
  c.lineWidth = 7;
  c.beginPath();
  c.moveTo(128, 128);
  c.lineTo(128, 52);
  c.moveTo(128, 128);
  c.lineTo(178, 128);
  c.stroke();
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** rua principal da vila: casinhas inglesas de madeira, lojas, lampiões, neblina e a torre do relógio ao fundo */
function vila(): Area {
  const g = new THREE.Group();
  const L = 52;
  const RUA = 6.4;
  // chão: paralelepípedo na rua, terra batida nas calçadas
  plano(g, RUA, L, pbr('paralelepipedo', [3, 24]), 0, 0, 0, -Math.PI / 2);
  for (const lado of [-1, 1]) plano(g, 30, L, pbr('chao_mata', [8, 14]), lado * (RUA / 2 + 15), -0.01, 0, -Math.PI / 2);
  // calçada de tábua na frente das casas
  const tabua = texMat(T.tabuado([1, 12]), { roughness: 0.8 });
  for (const lado of [-1, 1]) caixa(g, 1.2, 0.12, L - 4, tabua, lado * (RUA / 2 + 0.6), 0, 0);

  const cores = ['#7a2e2a', '#2f4a5c', '#5a6b3a', '#8a6a2a', '#5c3a5a', '#3a5a52'];
  const branco = std({ color: 0xece4d4, roughness: 0.8 });
  const telhas = pbr('telhado', [2, 2], { color: 0x6a3a2a });
  const lojas: { nome: string; destino: string; cor: string }[] = [
    { nome: 'VAGÃO DO SEU ZÉ', destino: 'vila_vagao', cor: '#f2c45a' },
    { nome: 'DOCERIA BYTE DOCE', destino: 'vila_doceria', cor: '#ff9fd2' },
    { nome: 'TECLADOS & CABOS DA SERRA', destino: 'vila_teclados', cor: '#6ef2ff' },
    { nome: 'LIVRARIA DO PROTOCOLO', destino: 'vila_livraria', cor: '#e8c66a' },
    { nome: 'CORREIO DE POMBOS', destino: 'vila_correio', cor: '#b8ff9f' },
    { nome: 'PEGADINHAS DE REDE LTDA', destino: 'vila_pegadinhas', cor: '#ff6ec7' },
  ];
  const portas: Area['portas'] = [];
  const obst: Area['obstaculos'] = [];
  const brilhos: THREE.MeshStandardMaterial[] = [];
  let k = 0;
  for (let z = -18; z <= 18; z += 7.2) {
    for (const lado of [-1, 1]) {
      const larg = 5.6;
      const fundo = 6;
      const alt = 3.6 + ((k * 37) % 5) * 0.25;
      const x = lado * (RUA / 2 + 1.2 + fundo / 2);
      const parede = texMat(T.madeira([3, 2], cores[k % cores.length]), { roughness: 0.75 });
      caixa(g, fundo, alt, larg, parede, x, 0, z);
      telhado(g, larg, 1.6, fundo, telhas, x, alt, z, Math.PI / 2);
      // frente: porta, duas janelas com luz quente e a cornija branca
      const fx = lado * (RUA / 2 + 1.2) + -lado * 0.0;
      const ry = lado < 0 ? Math.PI / 2 : -Math.PI / 2;
      caixa(g, 0.08, 0.15, larg + 0.2, branco, fx, alt - 0.15, z);
      const porta = caixa(g, 0.08, 2.1, 1.1, texMat(T.madeira([1, 2], '#3a2414'), { roughness: 0.6 }), fx, 0, z);
      porta.castShadow = false;
      for (const dz of [-1.7, 1.7]) {
        const luz = std({ color: 0x2a1a10, emissive: 0xffc070, emissiveIntensity: 0.9 });
        brilhos.push(luz);
        const jan = plano(g, 1.1, 1.2, luz, fx + lado * -0.05, 1.7, z + dz, 0, ry);
        jan.castShadow = false;
        caixa(g, 0.1, 0.08, 1.3, branco, fx, 1.05, z + dz);
        caixa(g, 0.1, 0.08, 1.3, branco, fx, 2.3, z + dz);
        caixa(g, 0.07, 1.2, 0.06, branco, fx, 1.1, z + dz).castShadow = false;
        caixa(g, 0.07, 0.05, 1.1, branco, fx, 1.68, z + dz).castShadow = false;
      }
      // segundo andar: janelinha no telhado
      const sotao = std({ color: 0x2a1a10, emissive: 0xffd090, emissiveIntensity: 0.6 });
      plano(g, 0.7, 0.6, sotao, fx + lado * -0.05, alt + 0.55, z, 0, ry).castShadow = false;
      obst.push([Math.min(x - fundo / 2, x + fundo / 2), Math.max(x - fundo / 2, x + fundo / 2), z - larg / 2, z + larg / 2]);
      const loja = k < lojas.length ? lojas[k] : null;
      if (loja) {
        const tex = T.placa(loja.nome, '#1a120c', loja.cor, 768, 128);
        const placa = plano(g, 3.4, 0.56, std({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.55 }), fx + lado * -0.09, 2.75, z, 0, ry);
        placa.castShadow = false;
        portas.push({ x: lado * (RUA / 2 - 0.2), z, rotulo: `Entrar: ${loja.nome.charAt(0)}${loja.nome.slice(1).toLowerCase()}`, destino: loja.destino });
      }
      k++;
    }
  }
  // postes de luz e bancos na calçada
  for (let z = -21; z <= 21; z += 8.4) {
    for (const lado of [-1, 1]) movel(g, 'street_lamp_01', lado * (RUA / 2 - 0.3), z + (lado > 0 ? 4.2 : 0), { alt: 3.4 });
  }
  for (const z of [-12.6, 4.2, 16.8]) {
    const l = new THREE.PointLight(0xffc98a, 6, 12, 1.6);
    l.position.set(z > 0 ? RUA / 2 - 0.5 : -RUA / 2 + 0.5, 3.3, z);
    g.add(l);
  }
  // torre do relógio no fim da rua
  const tijolo = pbr('tijolo', [2, 6]);
  caixa(g, 3.4, 12, 3.4, tijolo, 0, 0, -L / 2 - 1.2);
  telhado(g, 3.4, 2.6, 3.4, telhas, 0, 12, -L / 2 - 1.2);
  const relogio = new THREE.Mesh(new THREE.CircleGeometry(1.15, 40), (() => { const t = mostradorRelogio(); return std({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.5 }); })());
  relogio.position.set(0, 9.6, -L / 2 + 0.52);
  g.add(relogio);
  // céu e luz de fim de tarde com neblina
  g.add(new THREE.HemisphereLight(0xb8c4d8, 0x3a3428, 1.1));
  const sol = new THREE.DirectionalLight(0xffe0b8, 1.1);
  sol.position.set(8, 14, 10);
  sol.castShadow = true;
  sol.shadow.mapSize.set(1024, 1024);
  sol.shadow.camera.left = -14;
  sol.shadow.camera.right = 14;
  sol.shadow.camera.top = 28;
  sol.shadow.camera.bottom = -28;
  g.add(sol, sol.target);
  return {
    modelo: 'vila', grupo: g, entrada: { x: 0, z: L / 2 - 3, yaw: 0 }, palco: [{ x: -1, z: L / 2 - 5.2 }, { x: 1.1, z: L / 2 - 5.4 }, { x: 0, z: L / 2 - 6 }, { x: -1.8, z: L / 2 - 6.4 }],
    limites: [-RUA / 2 + 0.3, RUA / 2 - 0.3, -L / 2 + 1, L / 2 - 1], obstaculos: obst,
    portas: [...portas, { x: 0, z: L / 2 - 0.8, rotulo: 'Voltar pela estrada' }], ceu: 0x9aa6b4, neblina: 0.03,
    atualizar: (_dt, t) => brilhos.forEach((b, i) => (b.emissiveIntensity = 0.85 + Math.sin(t * 1.3 + i) * 0.08)),
  };
}

/** barril de madeira com aros de ferro */
function barril(g: THREE.Object3D, x: number, z: number, alt = 0.95) {
  const tabuas = texMat(T.madeira([3, 1], '#6a4424'), { roughness: 0.7 });
  const corpo = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, alt, 16, 4), tabuas);
  const pos = corpo.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / (alt / 2);
    const k = 1 + 0.12 * (1 - y * y);
    pos.setX(i, pos.getX(i) * k);
    pos.setZ(i, pos.getZ(i) * k);
  }
  corpo.geometry.computeVertexNormals();
  corpo.position.set(x, alt / 2, z);
  corpo.castShadow = true;
  g.add(corpo);
  const ferro = std({ color: 0x2a2a2a, metalness: 0.7, roughness: 0.5 });
  for (const yy of [0.12, 0.5, 0.88]) {
    const k = 1 + 0.12 * (1 - Math.pow((yy - 0.5) * 2, 2));
    const aro = new THREE.Mesh(new THREE.TorusGeometry(0.345 * k, 0.012, 6, 24), ferro);
    aro.rotation.x = Math.PI / 2;
    aro.position.set(x, yy * alt, z);
    g.add(aro);
  }
}

/** caneca de quentão de caramelo salgado, com espuma */
function caneca(g: THREE.Object3D, x: number, y: number, z: number) {
  const vidro = std({ color: 0xc89a5a, roughness: 0.25, metalness: 0.1 });
  cil(g, 0.06, 0.055, 0.14, vidro, x, y, z, 12);
  cil(g, 0.062, 0.062, 0.03, std({ color: 0xf6efe0, roughness: 1 }), x, y + 0.14, z, 12);
  const asa = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 6, 12, Math.PI), vidro);
  asa.position.set(x + 0.065, y + 0.07, z);
  asa.rotation.z = -Math.PI / 2;
  g.add(asa);
}

/** bar dentro de um vagão antigo: balcão, banquetas, barris e o quentão */
function vagao(): Area {
  const g = new THREE.Group();
  const W = 4.2;
  const D = 15;
  salaFechada(g, W, D, 3, pbr('assoalho', [6, 1.4], { color: 0xc89070 }), texMat(T.tabuado([2, 8])), std({ color: 0x3a2214, roughness: 0.8 }));
  const madeira = texMat(T.madeira([2, 1], '#3a2214'), { roughness: 0.45 });
  const metal = std({ color: 0xb08a4a, metalness: 0.9, roughness: 0.3 });
  // balcão comprido no lado esquerdo, com tampo de cobre
  caixa(g, 0.7, 1.05, 9, madeira, -W / 2 + 1.05, 0, -1.5);
  caixa(g, 0.8, 0.05, 9.1, metal, -W / 2 + 1.05, 1.05, -1.5);
  // prateleira de garrafas atrás do balcão
  caixa(g, 0.3, 0.04, 8, madeira, -W / 2 + 0.2, 1.4, -1.5);
  caixa(g, 0.3, 0.04, 8, madeira, -W / 2 + 0.2, 1.9, -1.5);
  const coresGarrafa = [0x2a5a2a, 0x6a2a1a, 0xc8a050, 0x2a3a6a, 0x8a5a2a];
  for (let i = 0; i < 26; i++) {
    const z = -5.2 + (i % 13) * 0.6;
    cil(g, 0.04, 0.045, 0.28, std({ color: coresGarrafa[i % 5], roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.85 }), -W / 2 + 0.2, i < 13 ? 1.44 : 1.94, z, 8);
  }
  // panelão de quentão fumegando no balcão
  cil(g, 0.28, 0.24, 0.35, std({ color: 0x3a3a3a, metalness: 0.7, roughness: 0.4 }), -W / 2 + 1.05, 1.08, 1.6, 20);
  cil(g, 0.27, 0.27, 0.02, std({ color: 0xb06a2a, emissive: 0x6a2a0a, emissiveIntensity: 0.4 }), -W / 2 + 1.05, 1.4, 1.6, 20);
  for (let i = 0; i < 6; i++) caneca(g, -W / 2 + 1.0 + (i % 2) * 0.12, 1.08, -4 + i * 1.1);
  // banquetas na frente do balcão
  const assentos: NonNullable<Area['assentos']> = [];
  for (let i = 0; i < 7; i++) {
    const z = -5.4 + i * 1.25;
    cil(g, 0.2, 0.2, 0.06, std({ color: 0x6a1f2b, roughness: 0.8 }), -W / 2 + 1.85, 0.7, z, 14);
    cil(g, 0.03, 0.05, 0.7, metal, -W / 2 + 1.85, 0, z, 6);
    // banqueta é mais alta que cadeira: quem senta nela sobe junto
    if (i % 2 === 0) assentos.push({ x: -W / 2 + 1.85, z, ry: -Math.PI / 2, y: 0.3 });
  }
  // mesinhas com barril do outro lado
  for (const z of [-4.6, -1.6, 1.4]) {
    barril(g, W / 2 - 0.7, z);
    caneca(g, W / 2 - 0.7, 0.95, z);
  }
  // janelas do vagão com a neblina lá fora
  for (let z = -5.5; z <= 5.5; z += 2.2) janela(g, W / 2 - 0.02, 1.7, z, 1, 0.8, -Math.PI / 2, 0x8a96a8);
  for (let z = -5; z <= 5; z += 5) lampiao(g, 0, 2.6, z, 5, 7, 0xffb26b);
  g.add(new THREE.HemisphereLight(0xffe0c0, 0x3a2010, 0.9));
  luzPrincipal(g, 0, 2.9, 2, 0xffd6a0, 18, new THREE.Vector3(0, 0, -2));
  return {
    modelo: 'vagao', grupo: g, entrada: { x: 0.6, z: D / 2 - 1.6, yaw: 0 }, palco: [{ x: 0.2, z: 3.4 }, { x: 1.1, z: 3.2 }, { x: 0.5, z: 2.6 }, { x: 1.2, z: 4.2 }],
    limites: [-W / 2 + 2.1, W / 2 - 0.4, -D / 2 + 0.6, D / 2 - 0.5], obstaculos: [[W / 2 - 1.1, W / 2, -5.1, -4.1], [W / 2 - 1.1, W / 2, -2.1, -1.1], [W / 2 - 1.1, W / 2, 0.9, 1.9]],
    assentos,
    gente: [{ id: 'seu_ze', x: -W / 2 + 0.55, z: 1.0, ry: Math.PI / 2 }],
    portas: [
      { x: -W / 2 + 1.6, z: 1.6, rotulo: 'Pedir um Quentão de Caramelo Salgado', destino: 'acao:quentao' },
      { x: 0.6, z: D / 2 - 0.4, rotulo: 'Voltar para a rua', destino: 'vila' },
    ],
    ceu: 0x2a1a10, neblina: 0.02,
  };
}

/** lojas da vila: mesma casinha por dentro, cada uma com o que vende */
function loja(tipo: 'doceria' | 'teclados' | 'livraria' | 'correio' | 'pegadinhas'): Area {
  const g = new THREE.Group();
  const W = 7;
  const D = 8;
  const H = 3.4;
  salaFechada(g, W, D, H, pbr('reboco', [3, 1.5], { color: ({ doceria: 0xf2b8c8, teclados: 0xb8d0d8, livraria: 0xe0cba0, correio: 0xc8d8b0, pegadinhas: 0xb89ad8 } as Record<string, number>)[tipo] }), pbr('assoalho', [3, 3]), std({ color: 0x3a2a1e, roughness: 1 }));
  const madeira = texMat(T.madeira([2, 1], '#4a2c18'), { roughness: 0.5 });
  caixa(g, W, 1, 0.05, madeira, 0, 0, -D / 2 + 0.03);
  caixa(g, 0.05, 1, D, madeira, -W / 2 + 0.03, 0, 0);
  caixa(g, 0.05, 1, D, madeira, W / 2 - 0.03, 0, 0);
  // balcão no fundo
  caixa(g, 4, 1, 0.8, madeira, 0, 0, -D / 2 + 1.6);
  const atualiza: ((t: number) => void)[] = [];
  const rr = rnd(tipo.length * 13);
  const gente: NonNullable<Area['gente']> = [{ id: ['adulta1', 'adulto1', 'adulta2', 'adulto1', 'adulta1'][['doceria', 'teclados', 'livraria', 'correio', 'pegadinhas'].indexOf(tipo)], x: 0.8, z: -D / 2 + 0.8, ry: 0 }];
  if (tipo === 'doceria') {
    // vitrine de vidro com doces coloridos
    const vidro = std({ color: 0xddeeff, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.25 });
    caixa(g, 3.6, 0.5, 0.6, vidro, 0, 1, -D / 2 + 1.6);
    const doces = [0xff6ec7, 0xffd166, 0x6ef2ff, 0x9fe79f, 0xff8a5a, 0x8a5a2a];
    for (let i = 0; i < 40; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.05 + rr() * 0.03, 10, 8), std({ color: doces[i % doces.length], roughness: 0.4 }));
      b.position.set(-1.6 + rr() * 3.2, 1.06, -D / 2 + 1.35 + rr() * 0.5);
      g.add(b);
    }
    // potes nas prateleiras
    for (const lado of [-1, 1]) for (let fila = 0; fila < 3; fila++) {
      caixa(g, 0.4, 0.04, 4, madeira, lado * (W / 2 - 0.25), 0.8 + fila * 0.7, 0);
      for (let i = 0; i < 6; i++) cil(g, 0.12, 0.12, 0.3, std({ color: doces[(i + fila) % doces.length], roughness: 0.2, transparent: true, opacity: 0.8 }), lado * (W / 2 - 0.25), 0.84 + fila * 0.7, -1.5 + i * 0.6, 12);
    }
  } else if (tipo === 'teclados') {
    // parede de teclados encantados e cabos pendurados
    const teclas = teclado();
    for (let fila = 0; fila < 4; fila++) for (let col = 0; col < 6; col++) {
      const brilha = (fila + col) % 5 === 0;
      const m = std({ map: teclas, roughness: 0.6, emissive: brilha ? 0x7df9ff : 0x000000, emissiveIntensity: brilha ? 0.4 : 0 });
      const t = plano(g, 0.8, 0.28, m, -2.5 + col * 1, 1.0 + fila * 0.5, -D / 2 + 0.05);
      t.castShadow = false;
      if (brilha) atualiza.push((tt) => (m.emissiveIntensity = 0.25 + Math.abs(Math.sin(tt * 2 + col)) * 0.4));
    }
    const cabo = std({ color: 0x111111 });
    for (let i = 0; i < 8; i++) {
      const c = new THREE.Mesh(new THREE.TorusGeometry(0.25 + rr() * 0.15, 0.015, 6, 20), [cabo, std({ color: 0x2a5aaa }), std({ color: 0xaa2a2a })][i % 3]);
      c.position.set(W / 2 - 0.1, 1.2 + (i % 3) * 0.55, -2.5 + i * 0.7);
      c.rotation.y = Math.PI / 2;
      g.add(c);
    }
  } else if (tipo === 'livraria') {
    for (const lado of [-1, 1]) for (const z of [-1.8, 0.4, 2.6]) {
      movel(g, 'wooden_bookshelf_worn', lado * (W / 2 - 0.4), z, { alt: 2.3, ry: lado < 0 ? Math.PI / 2 : -Math.PI / 2 });
      for (const y of [0.42, 0.8, 1.18, 1.56, 1.94]) movel(g, 'book_encyclopedia_set_01', lado * (W / 2 - 0.4), z, { larg: 0.75, y, ry: lado < 0 ? Math.PI / 2 : -Math.PI / 2 });
    }
    movel(g, 'desk_lamp_arm_01', -1.2, -D / 2 + 1.6, { alt: 0.45, y: 1 });
  } else if (tipo === 'correio') {
    // escaninhos com pombas e pacotes
    for (let fila = 0; fila < 4; fila++) for (let col = 0; col < 7; col++) {
      caixa(g, 0.62, 0.04, 0.5, madeira, -2.1 + col * 0.7, 0.9 + fila * 0.55, -D / 2 + 0.3);
      caixa(g, 0.04, 0.55, 0.5, madeira, -2.4 + col * 0.7, 0.9 + fila * 0.55, -D / 2 + 0.3);
    }
    for (let i = 0; i < 5; i++) {
      const b = criarBicho('pomba');
      b.grupo.scale.setScalar(1.1);
      b.grupo.position.set(-2.1 + ((i * 3) % 7) * 0.7, 0.95 + (i % 4) * 0.55, -D / 2 + 0.35);
      g.add(b.grupo);
      const f = rr() * 10;
      atualiza.push((t) => b.animar(t + f, false));
    }
    const papelao = std({ color: 0xb08a5a, roughness: 1 });
    for (let i = 0; i < 9; i++) caixa(g, 0.3 + rr() * 0.3, 0.2 + rr() * 0.3, 0.3 + rr() * 0.2, papelao, W / 2 - 0.6 - rr() * 0.4, (i % 3) * 0.32, -1.5 + Math.floor(i / 3) * 0.9, rr());
  } else {
    // pegadinhas: caixas coloridas, patos de borracha e um letreiro de oferta suspeita
    const tex = T.placa('PRÊMIO! CLIQUE AQUI', '#000000', '#ff3d5a', 512, 128);
    const letreiro = std({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 1 });
    plano(g, 2.4, 0.6, letreiro, 0, 2.6, -D / 2 + 0.05).castShadow = false;
    atualiza.push((t) => (letreiro.emissiveIntensity = Math.sin(t * 6) > 0 ? 1.2 : 0.3));
    const cores = [0xff6ec7, 0x6ef2ff, 0xffd166, 0x9fe79f];
    for (const lado of [-1, 1]) for (let fila = 0; fila < 3; fila++) {
      caixa(g, 0.4, 0.04, 4, madeira, lado * (W / 2 - 0.25), 0.8 + fila * 0.7, 0);
      for (let i = 0; i < 6; i++) {
        if ((i + fila) % 2) caixa(g, 0.3, 0.3, 0.3, std({ color: cores[(i + fila) % 4], roughness: 0.5 }), lado * (W / 2 - 0.25), 0.84 + fila * 0.7, -1.5 + i * 0.6, rr());
        else {
          const pato = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), std({ color: 0xffd400, roughness: 0.4 }));
          pato.position.set(lado * (W / 2 - 0.25), 0.96 + fila * 0.7, -1.5 + i * 0.6);
          g.add(pato);
        }
      }
    }
  }
  lampiao(g, 0, H - 0.8, 0, 5, 8, 0xffc98a);
  luzPrincipal(g, 0, H - 0.1, 2, 0xffe2c0, 16, new THREE.Vector3(0, 0, -2));
  g.add(new THREE.HemisphereLight(0xfff0dc, 0x4a3020, 1));
  return {
    modelo: 'loja_' + tipo, grupo: g, entrada: { x: 0, z: D / 2 - 1.4, yaw: 0 }, palco: [{ x: -0.9, z: 0.2 }, { x: 0.9, z: 0.1 }, { x: 0, z: -0.4 }, { x: 1.6, z: 0.8 }],
    limites: [-W / 2 + 0.8, W / 2 - 0.8, -D / 2 + 2.2, D / 2 - 0.4], obstaculos: [],
    gente,
    portas: [{ x: 0, z: D / 2 - 0.4, rotulo: 'Voltar para a rua', destino: 'vila' }], ceu: 0x2a1a10, neblina: 0.01,
    atualizar: atualiza.length ? (_dt, t) => atualiza.forEach((fn) => fn(t)) : undefined,
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
  const conta = plano(g, 0.21, 0.297, std({ map: contaDeLuz(), roughness: 0.9 }), 1.45, 0.603, -3.35, -Math.PI / 2);
  conta.rotation.z = 0.35;
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
    assentos: Array.from({ length: 9 }, (_, i) => -6.5 + i * 1.6).flatMap((z) => [{ x: -1.05, z: z - 0.05, ry: Math.PI }, { x: 1.05, z: z - 0.05, ry: Math.PI }]),
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
  // balcão de teclados encantados: um deles brilha, é o que vai escolher você
  const tampo = std({ color: 0x2a1a10, roughness: 0.5 });
  caixa(g, 0.9, 1.0, 3.2, tampo, -W / 2 + 0.75, 0, -5.5);
  const teclas = teclado();
  for (let i = 0; i < 6; i++) {
    const brilha = i === 3;
    const k = caixa(g, 0.42, 0.035, 0.15, std({ map: teclas, roughness: 0.6, emissive: brilha ? 0x7df9ff : 0x000000, emissiveIntensity: brilha ? 0.35 : 0 }), -W / 2 + 0.75, 1.0, -6.8 + i * 0.5, 0.15);
    k.castShadow = false;
  }
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
    limites: [-W / 2 + 0.9, W / 2 - 0.9, -D / 2 + 0.4, D / 2 - 0.4], obstaculos: [[-W / 2, -W / 2 + 1.3, -7.2, -3.8]],
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

/** Clube de Duelos: antigo galpão de locomotivas com tablado no meio e placar de LED meio queimado */
function clube(): Area {
  const g = new THREE.Group();
  const W = 12;
  const D = 20;
  const H = 6.5;
  salaFechada(g, W, D, H, pbr('tijolo', [6, 3]), pbr('concreto', [6, 10], { color: 0x8a847c }), std({ color: 0x3a342e, roughness: 1 }));
  // tesouras de ferro do telhado e trilhos no chão, que o galpão já foi de locomotiva
  const ferro = std({ color: 0x2b2e33, metalness: 0.7, roughness: 0.5 });
  for (let z = -D / 2 + 2; z < D / 2; z += 4) {
    caixa(g, W, 0.25, 0.18, ferro, 0, H - 0.6, z);
    for (const x of [-W / 2 + 0.15, W / 2 - 0.15]) caixa(g, 0.25, H, 0.25, ferro, x, 0, z);
  }
  const trilho = std({ color: 0x6a6460, metalness: 0.9, roughness: 0.35 });
  const dormente = texMat(T.madeira([1, 1], '#3a2818'), { roughness: 0.9 });
  for (const x of [-4.2, 4.2]) {
    for (const dx of [-0.72, 0.72]) caixa(g, 0.07, 0.07, D - 0.4, trilho, x + dx, 0, 0).castShadow = false;
    for (let z = -D / 2 + 0.6; z < D / 2; z += 0.9) caixa(g, 1.9, 0.04, 0.22, dormente, x, 0, z).castShadow = false;
  }
  // tablado de madeira com faixa de duelo pintada
  const TZ = 10;
  caixa(g, 3.2, 0.35, TZ, texMat(T.tabuado([2, 6]), { roughness: 0.7 }), 0, 0, -1);
  const faixa = std({ color: 0xd8c27a, roughness: 0.8 });
  for (const z of [-1 - TZ / 2 + 0.6, -1 + TZ / 2 - 0.6]) caixa(g, 2.6, 0.005, 0.08, faixa, 0, 0.35, z).castShadow = false;
  caixa(g, 0.06, 0.005, TZ - 1.2, faixa, 0, 0.35, -1).castShadow = false;
  // placar: metade dos segmentos funciona, o resto é fé
  const led = T.placa('VOCÊ  0 8 : 0 8  OPONENTE', '#0b0a0e', '#ff4a3a', 1024, 160);
  const placar = plano(g, 5, 0.8, std({ map: led, emissive: 0xffffff, emissiveMap: led, emissiveIntensity: 0.9 }), 0, 4.6, -D / 2 + 0.08);
  placar.castShadow = false;
  caixa(g, 5.3, 1.05, 0.1, ferro, 0, 4.07, -D / 2 + 0.01);
  // bancos de arquibancada dos dois lados
  const madeira = texMat(T.madeira([2, 1], '#5a3a22'), { roughness: 0.7 });
  const assentos: NonNullable<Area['assentos']> = [];
  for (const lado of [-1, 1]) {
    for (let z = -6; z <= 4; z += 2.5) {
      caixa(g, 0.42, 0.06, 2, madeira, lado * 2.6, 0.4, z);
      for (const dz of [-0.85, 0.85]) caixa(g, 0.34, 0.4, 0.07, madeira, lado * 2.6, 0, z + dz);
      for (const dz of [-0.5, 0.5]) assentos.push({ x: lado * 2.6 + lado * 0.06, z: z + dz, ry: lado < 0 ? Math.PI / 2 : -Math.PI / 2 });
    }
  }
  for (let z = -6; z <= 4; z += 5) lampiao(g, 0, 4.4, z, 7, 10, 0xffd6a0);
  luzPrincipal(g, 0, H - 0.4, 3, 0xffe2c0, 26, new THREE.Vector3(0, 0, -2));
  g.add(new THREE.HemisphereLight(0xc8c0b8, 0x3a3028, 0.8));
  janela(g, -W / 2 + 0.02, 3.4, -3, 1.6, 2.2, Math.PI / 2, 0x6a7f9a);
  janela(g, W / 2 - 0.02, 3.4, 1, 1.6, 2.2, -Math.PI / 2, 0x6a7f9a);
  return {
    modelo: 'clube', grupo: g, entrada: { x: 0, z: 7.6, yaw: 0 }, palco: [{ x: -1.1, z: 5.4 }, { x: 1.1, z: 5.3 }, { x: 0, z: 5 }, { x: -2, z: 6 }],
    limites: [-W / 2 + 0.5, W / 2 - 0.5, -D / 2 + 0.5, D / 2 - 0.5], obstaculos: [],
    obstaculosNpc: [[-1.7, 1.7, -6.2, 4.2], [-2.9, -2.3, -7.1, 5.1], [2.3, 2.9, -7.1, 5.1]],
    assentos,
    duelo: { voce: { x: 0, z: 2.6, yaw: 0 }, oponente: { x: 0, z: -1.6 }, y: 0.35 },
    portas: [{ x: 0, z: D / 2 - 0.5, rotulo: 'Sair do galpão' }], ceu: 0x6a7f9a, neblina: 0.02,
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
    vila: 'vila', vila_vagao: 'vagao', vila_doceria: 'loja_doceria', vila_teclados: 'loja_teclados', vila_livraria: 'loja_livraria', vila_correio: 'loja_correio', vila_pegadinhas: 'loja_pegadinhas',
    a1_clube_duelos: 'clube', sala_diretora: 'gabinete', a1_pombal: 'pombal', a2_torre_relogio: 'relogio', a1_galeria_formandos: 'galeria', refeitorio: 'salao', dormitorio: 'dormitorio', lab_terminal: 'aula', biblioteca: 'biblioteca', datacenter: 'datacenter',
    casa_vo: 'casa', estacao: 'trem', santa_ifigenia: 'cidade', cripta: 'masmorra', torre_redes: 'torre', viveiro: 'floresta',
    mata: 'floresta', campo: 'campo', represa: 'lago', secretaria: 'colunas', patio: 'patio',
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
    case 'clube': return clube();
    case 'vila': return vila();
    case 'vagao': return vagao();
    case 'loja_doceria': return loja('doceria');
    case 'loja_teclados': return loja('teclados');
    case 'loja_livraria': return loja('livraria');
    case 'loja_correio': return loja('correio');
    case 'loja_pegadinhas': return loja('pegadinhas');
    case 'gabinete': return gabinete();
    case 'pombal': return pombal();
    case 'relogio': return pombal(true);
    case 'galeria': return galeria();
    default: return sala('aula');
  }
}

export function aplicarAmbiente(a: Area) {
  M.cena.background = new THREE.Color(a.ceu);
  M.cena.fog = new THREE.FogExp2(a.ceu, a.neblina);
}
