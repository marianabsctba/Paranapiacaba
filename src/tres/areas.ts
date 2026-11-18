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
import { L as carregadorGltf } from './humanos';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { rastrear } from './carga';

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
  // alas laterais com torreões redondos de telhado cônico
  const pedraBase = pbr('pedra', [8, 1], { color: 0x9a948a });
  const pedraClara = pbr('concreto', [1, 1], { color: 0xd6ccb8 });
  const torreao = (x: number, z: number, r0: number, h: number) => {
    cil(g, r0, r0 * 1.06, h, pbr('pedra', [4, h / 3], { color: 0xa49c90 }), x, 0, z, 24);
    // cinta de pedra e ameias no alto da torre
    cil(g, r0 + 0.25, r0 + 0.25, 0.5, pedraClara, x, h - 0.5, z, 24);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      caixa(g, 0.6, 0.7, 0.45, pedraClara, x + Math.cos(a) * (r0 + 0.1), h, z + Math.sin(a) * (r0 + 0.1), -a + Math.PI / 2);
    }
    const c = new THREE.Mesh(new THREE.ConeGeometry(r0 + 0.35, r0 * 2.6, 24), tel);
    c.position.set(x, h + r0 * 1.3 + 0.2, z);
    c.castShadow = true;
    g.add(c);
    // bandeirola no topo
    cil(g, 0.04, 0.04, 1.6, std({ color: 0x222222, metalness: 0.8 }), x, h + r0 * 2.6, z, 6);
    const fl = plano(g, 1, 0.5, std({ color: 0x7a2a3a, side: THREE.DoubleSide, roughness: 1 }), x + 0.5, h + r0 * 2.6 + 1.3, z);
    fl.castShadow = false;
    bandeiras.push(fl);
    // seteiras acesas subindo a torre
    for (let y = 3; y < h - 2; y += 3.4) {
      const fresta = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 1), std({ color: 0x000000, emissive: 0xffb85c, emissiveIntensity: 1.6 }));
      fresta.position.set(x, y, z + r0 + 0.06);
      g.add(fresta);
    }
  };
  const bandeiras: THREE.Mesh[] = [];
  const chamas: THREE.Mesh[] = [];
  const luzesTocha: THREE.PointLight[] = [];
  for (const lado of [-1, 1]) {
    caixa(g, 10, 9, 14, tij, lado * 22, 0, -22);
    caixa(g, 10.3, 1.1, 14.3, pedraBase, lado * 22, 0, -22);
    // ameias no alto das alas
    for (let x = -4.6; x <= 4.6; x += 1.15) caixa(g, 0.6, 0.75, 0.5, pedraClara, lado * 22 + x, 9, -15.2);
    for (let z = -28.6; z <= -15.6; z += 1.15) caixa(g, 0.5, 0.75, 0.6, pedraClara, lado * 27.1, 9, z);
    caixa(g, 10.4, 0.3, 14.4, pedraClara, lado * 22, 8.8, -22);
    torreao(lado * 17.5, -15.8, 2.4, 17);
    torreao(lado * 27, -15.4, 1.9, 13);
    // janelas das alas
    for (const dx of [-2.4, 2.4]) for (const y of [2.6, 6]) janela(g, lado * 22 + dx, y, -14.94, 1.2, 2, 0, 0xffb85c);
  }
  // base de pedra e cornija do corpo principal
  caixa(g, 34.4, 1.2, 10.4, pedraBase, 0, 0, -26);
  caixa(g, 34.6, 0.35, 10.6, pedraClara, 0, 11.7, -26);
  caixa(g, 5.3, 0.4, 5.3, pedraClara, 0, 17, -20.2);
  caixa(g, 5.4, 0.45, 5.4, pedraClara, 0, 25.6, -20.2);
  // aro de pedra em volta do relógio
  const aro = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.16, 8, 40), pedraClara);
  aro.position.set(0, 21, -17.64);
  g.add(aro);
  // contrafortes entre as janelas
  for (const x of [-14.7, -10.5, -6.3, 6.3, 10.5, 14.7]) {
    const cf = caixa(g, 0.7, 10.5, 1.2, pbr('pedra', [1, 4], { color: 0xa49c90 }), x, 0, -20.6);
    void cf;
  }
  // chaminés no telhado
  for (const x of [-12, -4, 9]) caixa(g, 0.9, 3.2, 0.9, tij, x, 13.6, -27.5);
  // janelas acesas, com arco ogival por cima
  const vidroArco = std({ color: 0xffb85c, emissive: 0xffb85c, emissiveIntensity: 0.9, roughness: 0.1 });
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue;
    for (const y of [3.4, 7.6]) {
      janela(g, i * 4.2, y, -20.94, 1.4, 2.4, 0, 0xffb85c);
      const arco = new THREE.Mesh(new THREE.CircleGeometry(0.7, 20, 0, Math.PI), vidroArco);
      arco.position.set(i * 4.2, y + 1.2, -20.93);
      g.add(arco);
      const pedraArco = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.08, 6, 20, Math.PI), pedraClara);
      pedraArco.position.set(i * 4.2, y + 1.2, -20.9);
      g.add(pedraArco);
    }
  }
  // portal de entrada: arco de pedra, porta de madeira com ferragens e degraus
  void madeiraClara;
  const portaMat = texMat(T.madeira([1, 2], '#3a2412'), { roughness: 0.7 });
  caixa(g, 3.6, 4.4, 0.6, portaMat, 0, 0, -17.4);
  const topoPorta = new THREE.Mesh(new THREE.CircleGeometry(1.8, 24, 0, Math.PI), portaMat);
  topoPorta.position.set(0, 4.4, -17.09);
  g.add(topoPorta);
  for (const x of [-2.3, 2.3]) caixa(g, 0.8, 4.6, 0.9, pedraClara, x, 0, -17.2);
  const arcoPortal = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.42, 8, 28, Math.PI), pedraClara);
  arcoPortal.position.set(0, 4.5, -17.2);
  arcoPortal.castShadow = true;
  g.add(arcoPortal);
  const ferragem = std({ color: 0x1a1a1a, metalness: 0.8, roughness: 0.4 });
  for (const y of [1, 2.6, 4]) caixa(g, 3.4, 0.1, 0.05, ferragem, 0, y, -17.08);
  for (const x of [-0.5, 0.5]) {
    const arg = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 6, 16), std({ color: 0xc9a227, metalness: 0.9, roughness: 0.3 }));
    arg.position.set(x, 2.1, -17.05);
    g.add(arg);
  }
  caixa(g, 7.2, 0.12, 1.6, pedraClara, 0, 0, -16.4);
  caixa(g, 6.2, 0.12, 1.0, pedraClara, 0, 0.12, -16.7);
  // tochas dos dois lados do portal
  for (const x of [-3.2, 3.2]) {
    caixa(g, 0.12, 0.5, 0.2, ferragem, x, 2.6, -17.1);
    const chama = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.42, 8), std({ color: 0xffa040, emissive: 0xff8020, emissiveIntensity: 3 }));
    chama.position.set(x, 3.35, -16.95);
    g.add(chama);
    chamas.push(chama);
    const l = new THREE.PointLight(0xff9a40, 5, 9, 1.6);
    l.position.set(x, 3.4, -16.6);
    g.add(l);
    luzesTocha.push(l);
  }
  // estandartes das quatro escolas na fachada
  (['oncarina', 'tucanal', 'capivarias', 'jararacas'] as const).forEach((casa, i) => estandarte(g, casa, [-10.5, -6.3, 6.3, 10.5][i], 7.4, -19.9));
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
  // caminho de pedra clara do portão até o portal
  const laje = pbr('paralelepipedo', [2, 18], { color: 0xe6dccb });
  plano(g, 3.2, 34, laje, 0, 0.012, 2, -Math.PI / 2).castShadow = false;
  // chafariz no meio do pátio, com água correndo
  const FZ = -8;
  cil(g, 2.3, 2.4, 0.6, pedraClara, 0, 0, FZ, 32);
  const agua = new THREE.Mesh(new THREE.CircleGeometry(2.05, 40), std({ color: 0x2a5a78, roughness: 0.05, metalness: 0.4, emissive: 0x0a2030, transparent: true, opacity: 0.88 }));
  agua.rotation.x = -Math.PI / 2;
  agua.position.set(0, 0.52, FZ);
  g.add(agua);
  cil(g, 0.28, 0.4, 1.6, pedraClara, 0, 0.5, FZ, 16);
  cil(g, 0.9, 0.3, 0.3, pedraClara, 0, 1.9, FZ, 24);
  cil(g, 0.12, 0.18, 0.7, pedraClara, 0, 2.2, FZ, 10);
  const jatoMat = std({ color: 0xbfe4ff, emissive: 0x4a7a9a, transparent: true, opacity: 0.25, roughness: 0.05, depthWrite: false });
  const jatos: THREE.Mesh[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const jato = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 1.5, 6, 1, true), jatoMat);
    jato.position.set(Math.cos(a) * 1.05, 1.4, FZ + Math.sin(a) * 1.05);
    jato.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35);
    g.add(jato);
    jatos.push(jato);
  }
  // canteiros com sebe aparada e flores dos dois lados do caminho
  const sebe = pbr('grama', [3, 1], { color: 0x3f6a36, roughness: 1 });
  const corFlor = [0xe85a8a, 0xf2c94c, 0xf4f1ea, 0xb06ad8, 0xff8a3d];
  const flor = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.09, 0), std({ roughness: 0.8 }), 360);
  let nf = 0;
  const mF = new THREE.Matrix4();
  const canteiros: [number, number, number, number][] = [[-7.5, -3, -14.6, -11], [3, 7.5, -14.6, -11], [-7.5, -3, 0, 3.4], [3, 7.5, 0, 3.4]];
  for (const [x0, x1, z0, z1] of canteiros) {
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = x1 - x0, d = z1 - z0;
    caixa(g, w, 0.18, d, pedraClara, cx, 0, cz);
    plano(g, w - 0.2, d - 0.2, pbr('grama', [2, 2]), cx, 0.19, cz, -Math.PI / 2).castShadow = false;
    // sebe em volta, aberta para o caminho
    caixa(g, w, 0.45, 0.4, sebe, cx, 0.18, z0 + 0.2);
    caixa(g, w, 0.45, 0.4, sebe, cx, 0.18, z1 - 0.2);
    caixa(g, 0.4, 0.45, d, sebe, x0 < 0 ? x0 + 0.2 : x1 - 0.2, 0.18, cz);
    for (let i = 0; i < 90 && nf < 360; i++) {
      mF.makeTranslation(x0 + 0.6 + r() * (w - 1.2), 0.25 + r() * 0.12, z0 + 0.6 + r() * (d - 1.2));
      flor.setMatrixAt(nf, mF);
      flor.setColorAt(nf, new THREE.Color(corFlor[nf % corFlor.length]));
      nf++;
    }
  }
  flor.count = nf;
  g.add(flor);
  // muro baixo de pedra com portão de ferro na frente do pátio
  for (const lado of [-1, 1]) {
    caixa(g, 25, 1.2, 0.6, pedraBase, lado * 15.5, 0, 20);
    caixa(g, 25.2, 0.18, 0.75, pedraClara, lado * 15.5, 1.2, 20);
    caixa(g, 1, 3, 1, pedraClara, lado * 3, 0, 20);
    const bola = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), pedraClara);
    bola.position.set(lado * 3, 3.4, 20);
    g.add(bola);
    lampiao(g, lado * 3, 3.2, 20.7, 3, 7);
    // folha do portão aberta para dentro
    const folhaPortao = new THREE.Group();
    for (let i = 0; i <= 6; i++) {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.4, 6), ferragem);
      b.position.set(-lado * (0.15 + i * 0.4), 1.2, 0);
      folhaPortao.add(b);
      const ponta = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 6), ferragem);
      ponta.position.set(-lado * (0.15 + i * 0.4), 2.5, 0);
      folhaPortao.add(ponta);
    }
    for (const y of [0.4, 2]) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.06, 0.06), ferragem);
      t.position.set(-lado * 1.35, y, 0);
      folhaPortao.add(t);
    }
    folhaPortao.position.set(lado * 2.5, 0, 20);
    folhaPortao.rotation.y = lado * 1.2;
    g.add(folhaPortao);
  }
  // vaga-lumes na neblina
  const NV = 90;
  const posV = new Float32Array(NV * 3);
  const baseV: number[] = [];
  for (let i = 0; i < NV; i++) {
    const x = (r() - 0.5) * 44, y = 0.5 + r() * 3, z = -14 + r() * 32;
    baseV.push(x, y, z, r() * 10);
  }
  const geoV = new THREE.BufferGeometry();
  geoV.setAttribute('position', new THREE.BufferAttribute(posV, 3));
  const vaga = new THREE.Points(geoV, new THREE.PointsMaterial({ color: 0xd8ff8a, size: 0.12, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  vaga.frustumCulled = false;
  g.add(vaga);
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
    limites: [-28, 28, -16.6, 26],
    obstaculos: [[-17, 17, -31, -17], [-27, -15, -29, -15], [15, 27, -29, -15], [-6, -4, -4.5, -3.5], [4, 6, -4.5, -3.5], [-12.5, -11.5, 9, 11], [11.5, 12.5, 9, 11],
      [-2.5, 2.5, FZ - 2.5, FZ + 2.5], ...canteiros, [-28, -2.5, 19.6, 20.4], [2.5, 28, 19.6, 20.4], [-20, -14.9, -18.4, -13.2], [14.9, 20, -18.4, -13.2], [-29, -25, -17.4, -13.4], [25, 29, -17.4, -13.4]],
    portas: [{ x: 0, z: -16.8, rotulo: 'Entrar no castelo' }], ceu: 0x1a2235, neblina: 0.028,
    atualizar: (_dt: number, t: number) => {
      // água, tochas, bandeirolas e vaga-lumes
      jatos.forEach((j, i) => ((j.material as THREE.MeshStandardMaterial).opacity = 0.24 + Math.sin(t * 9 + i) * 0.06));
      (agua.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8 + Math.sin(t * 2.3) * 0.2;
      chamas.forEach((c, i) => c.scale.set(1, 0.85 + Math.sin(t * 13 + i * 2) * 0.15 + Math.sin(t * 29 + i) * 0.06, 1));
      luzesTocha.forEach((l, i) => (l.intensity = 4.6 + Math.sin(t * 11 + i * 3) * 0.8));
      bandeiras.forEach((b, i) => (b.rotation.y = Math.sin(t * 2 + i) * 0.35));
      for (let i = 0; i < NV; i++) {
        const [x, y, z, f] = baseV.slice(i * 4, i * 4 + 4);
        posV[i * 3] = x + Math.sin(t * 0.4 + f) * 0.8;
        posV[i * 3 + 1] = y + Math.sin(t * 0.7 + f * 2) * 0.4;
        posV[i * 3 + 2] = z + Math.cos(t * 0.35 + f) * 0.8;
      }
      geoV.attributes.position.needsUpdate = true;
      (vaga.material as THREE.PointsMaterial).opacity = 0.55 + Math.sin(t * 3) * 0.35;
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
    // mesa e os dois bancos ocupam 0,97 m de cada lado: sobra corredor de uns 85 cm entre as fileiras
    obstaculos: colunas ? [[-3, 3, -12.6, -11.4]] : [-4.2, -1.4, 1.4, 4.2].map((x) => [x - 0.97, x + 0.97, -12.6, 8.6] as [number, number, number, number]),
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
  const floreiras: { x: number; z: number; lado: number }[] = [];
  const chamines: { x: number; z: number; y: number }[] = [];
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
        floreiras.push({ x: fx + lado * -0.18, z: z + dz, lado });
      }
      if (k % 3 !== 1) chamines.push({ x: x + lado * 1.2, z: z - 1.4, y: alt + 1.5 });
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
  const TZ = -40;
  caixa(g, 3.4, 12, 3.4, tijolo, 0, 0, TZ);
  telhado(g, 3.4, 2.6, 3.4, telhas, 0, 12, TZ);
  const relogio = new THREE.Mesh(new THREE.CircleGeometry(1.15, 40), (() => { const t = mostradorRelogio(); return std({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.5 }); })());
  relogio.position.set(0, 9.6, TZ + 1.72);
  g.add(relogio);
  const festa = festaDaVila(g, { RUA, floreiras, chamines, branco, telhas });
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
    limites: [-10.5, 10.5, -37, L / 2 - 1],
    obstaculos: [...obst, [-11, -RUA / 2 - 1.2, -22, L / 2], [RUA / 2 + 1.2, 11, -22, L / 2], ...festa.obst],
    // a Tati e o Cauã passeando na rua
    gente: [{ id: 'tati', x: 1.4, z: L / 2 - 8, ry: Math.PI * 0.8 }, { id: 'caua', x: 0.5, z: L / 2 - 8.6, ry: -Math.PI * 0.85 }],
    portas: [...portas, { x: 0, z: L / 2 - 0.8, rotulo: 'Voltar pela estrada' }], ceu: 0x9aa6b4, neblina: 0.03,
    atualizar: (dt, t) => {
      brilhos.forEach((b, i) => (b.emissiveIntensity = 0.85 + Math.sin(t * 1.3 + i) * 0.08));
      festa.atualizar(dt, t);
    },
  };
}

/** curva de fio pendurado entre dois pontos (barriga no meio) */
function fioPendurado(a: THREE.Vector3, b: THREE.Vector3, barriga: number, n: number) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    return new THREE.Vector3().lerpVectors(a, b, t).setY(a.y + (b.y - a.y) * t - barriga * 4 * t * (1 - t));
  });
}

/** a vila em dia de festa: praça com coreto e ipês, varais de lâmpada e bandeirinha, floreiras, chaminés e galinhas */
function festaDaVila(g: THREE.Group, o: { RUA: number; floreiras: { x: number; z: number; lado: number }[]; chamines: { x: number; z: number; y: number }[]; branco: THREE.Material; telhas: THREE.Material }) {
  const { RUA } = o;
  const obst: Area['obstaculos'] = [];
  const anima: ((dt: number, t: number) => void)[] = [];
  const r = rnd(77);
  // chão da praça
  plano(g, 90, 26, pbr('chao_mata', [12, 4]), 0, -0.012, -36, -Math.PI / 2);
  plano(g, 22, 16, pbr('paralelepipedo', [8, 6], { color: 0xd8cfc0 }), 0, 0.004, -30, -Math.PI / 2);
  // coreto branco de telhado vermelho
  const CZ = -30;
  const branco = std({ color: 0xf2ece0, roughness: 0.7 });
  const verde = std({ color: 0x2e6a4a, roughness: 0.6 });
  cil(g, 3.2, 3.35, 0.7, branco, 0, 0, CZ, 8);
  caixa(g, 1.6, 0.35, 0.8, branco, 0, 0, CZ + 3.4);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const px = Math.cos(a) * 2.9, pz = CZ + Math.sin(a) * 2.9;
    cil(g, 0.08, 0.09, 2.8, branco, px, 0.7, pz, 8);
    // guarda-corpo entre os postes (a frente fica aberta)
    if (i !== 1) {
      const a2 = a + Math.PI / 8;
      caixa(g, 2.2, 0.08, 0.08, verde, Math.cos(a2) * 2.75, 1.4, CZ + Math.sin(a2) * 2.75, -a2 + Math.PI / 2);
      for (let k = -3; k <= 3; k++) caixa(g, 0.04, 0.7, 0.04, branco, Math.cos(a2) * 2.75 + Math.cos(-a2 + Math.PI / 2) * k * 0.3, 0.7, CZ + Math.sin(a2) * 2.75 - Math.sin(-a2 + Math.PI / 2) * k * 0.3).castShadow = false;
    }
  }
  const tetoCoreto = new THREE.Mesh(new THREE.ConeGeometry(3.7, 1.9, 8), o.telhas);
  tetoCoreto.position.set(0, 3.5 + 0.95, CZ);
  tetoCoreto.rotation.y = Math.PI / 8;
  tetoCoreto.castShadow = true;
  g.add(tetoCoreto);
  caixa(g, 0.1, 0.25, 0.1, verde, 0, 3.3, CZ).castShadow = false;
  const pinaculo = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), std({ color: 0xd4b030, metalness: 0.8, roughness: 0.3 }));
  pinaculo.position.set(0, 5.55, CZ);
  g.add(pinaculo);
  obst.push([-3.4, 3.4, CZ - 3.4, CZ + 3.0]);
  const luzCoreto = new THREE.PointLight(0xffc070, 7, 14, 1.5);
  luzCoreto.position.set(0, 3, CZ);
  g.add(luzCoreto);
  // ipês amarelos e rosas nos cantos, com flor caída no chão
  for (const [x, z, cor] of [[-8.3, -24.5, 0xf2c230], [8.3, -24.5, 0xd96aa8], [-8.3, -35.5, 0xd96aa8], [8.3, -35.5, 0xf2c230]] as const) {
    cil(g, 0.16, 0.24, 3.2, std({ color: 0x4a3626, roughness: 1 }), x, 0, z, 8);
    const flor = std({ color: cor, roughness: 0.9 });
    for (let i = 0; i < 6; i++) {
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9 + r() * 0.5, 1), flor);
      c.position.set(x + (r() - 0.5) * 1.8, 3.4 + r() * 1.2, z + (r() - 0.5) * 1.8);
      c.castShadow = true;
      g.add(c);
    }
    const chao = new THREE.Mesh(new THREE.CircleGeometry(2.2, 20), std({ color: cor, roughness: 1, transparent: true, opacity: 0.55 }));
    chao.rotation.x = -Math.PI / 2;
    chao.position.set(x, 0.008, z);
    g.add(chao);
    obst.push([x - 0.4, x + 0.4, z - 0.4, z + 0.4]);
  }
  // casinhas em volta da praça, para o fundo não ficar vazio
  const coresCasa = ['#2f4a5c', '#8a6a2a', '#5c3a5a', '#3a5a52', '#7a2e2a', '#5a6b3a'];
  const casinha = (x: number, z: number, ry: number, i: number) => {
    const c = new THREE.Group();
    c.position.set(x, 0, z);
    c.rotation.y = ry;
    g.add(c);
    const alt = 3.4 + (i % 3) * 0.35;
    caixa(c, 5.4, alt, 5, texMat(T.madeira([3, 2], coresCasa[i % coresCasa.length]), { roughness: 0.75 }), 0, 0, 0);
    telhado(c, 5.4, 1.5, 5, o.telhas, 0, alt, 0);
    caixa(c, 1, 2.1, 0.08, texMat(T.madeira([1, 2], '#3a2414'), { roughness: 0.6 }), 0, 0, 2.52);
    for (const dx of [-1.6, 1.6]) {
      plano(c, 1, 1.1, std({ color: 0x2a1a10, emissive: 0xffc070, emissiveIntensity: 0.8 }), dx, 1.7, 2.53).castShadow = false;
      caixa(c, 1.2, 0.08, 0.1, o.branco, dx, 1.1, 2.54).castShadow = false;
      caixa(c, 0.2, 0.14, 0.2, caixaFlorCasa, dx, 0.95, 2.62).castShadow = false;
    }
  };
  const caixaFlorCasa = texMat(T.madeira([1, 1], '#4a2e1a'), { roughness: 0.8 });
  [[-13.8, -26.5], [-13.8, -33.5]].forEach(([x, z], i) => casinha(x, z, Math.PI / 2, i));
  [[13.8, -26.5], [13.8, -33.5]].forEach(([x, z], i) => casinha(x, z, -Math.PI / 2, i + 2));
  [[-6.5, -41], [6.5, -41]].forEach(([x, z], i) => casinha(x, z, 0, i + 4));
  // bancos e postes da praça
  for (const lado of [-1, 1]) {
    movel(g, 'painted_wooden_bench', lado * 5.6, CZ, { larg: 1.8, ry: lado < 0 ? Math.PI / 2 : -Math.PI / 2 });
    obst.push([lado * 5.6 - 0.5, lado * 5.6 + 0.5, CZ - 1, CZ + 1]);
    for (const z of [-23.5, -36.5]) movel(g, 'street_lamp_01', lado * 9.6, z, { alt: 3.4 });
  }
  // barraca de quentão e pinhão
  const BX = 7.6, BZ = -29;
  caixa(g, 2.2, 1, 0.8, texMat(T.madeira([2, 1], '#6a4424'), { roughness: 0.7 }), BX, 0, BZ);
  for (const dx of [-1, 1]) for (const dz of [-0.4, 0.4]) cil(g, 0.04, 0.04, 2.3, std({ color: 0x5a3a22 }), BX + dx * 1.05, 0, BZ + dz, 6);
  const cvL = document.createElement('canvas');
  cvL.width = 128;
  cvL.height = 16;
  const cl = cvL.getContext('2d')!;
  for (let i = 0; i < 8; i++) {
    cl.fillStyle = i % 2 ? '#f4efe4' : '#c0392b';
    cl.fillRect(i * 16, 0, 16, 16);
  }
  const listra = new THREE.CanvasTexture(cvL);
  listra.colorSpace = THREE.SRGBColorSpace;
  const lona = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.3), std({ map: listra, side: THREE.DoubleSide, roughness: 1 }));
  lona.rotation.set(-Math.PI / 2 + 0.35, 0, 0);
  lona.rotation.order = 'YXZ';
  lona.rotation.y = -Math.PI / 2;
  lona.position.set(BX, 2.35, BZ);
  g.add(lona);
  const placa = T.placa('QUENTÃO · PINHÃO', '#2a1a0e', '#ffd166', 512, 96);
  plano(g, 1.8, 0.34, std({ map: placa, emissive: 0xffffff, emissiveMap: placa, emissiveIntensity: 0.4 }), BX - 0.42, 0.7, BZ, 0, -Math.PI / 2).castShadow = false;
  for (let i = 0; i < 4; i++) caneca(g, BX - 0.1, 1, BZ - 0.6 + i * 0.4);
  obst.push([BX - 1.2, BX + 1.2, BZ - 0.6, BZ + 0.6]);
  // varal de lâmpadas em zigue-zague sobre a rua e do coreto para os cantos da praça
  const pontosLuz: THREE.Vector3[] = [];
  const fio = new THREE.LineBasicMaterial({ color: 0x1a1a1a });
  const pendurar = (a: THREE.Vector3, b: THREE.Vector3, barriga: number, cada: number) => {
    const pts = fioPendurado(a, b, barriga, 24);
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), fio));
    const n = Math.max(2, Math.round(a.distanceTo(b) / cada));
    fioPendurado(a, b, barriga, n).slice(1, -1).forEach((p) => pontosLuz.push(p.clone().setY(p.y - 0.06)));
  };
  const borda = RUA / 2 + 1.2;
  for (let z = -19, i = 0; z < 19; z += 3.6, i++) {
    const s = i % 2 ? 1 : -1;
    pendurar(new THREE.Vector3(s * borda, 3.3, z), new THREE.Vector3(-s * borda, 3.3, z + 3.6), 0.55, 0.45);
  }
  for (const [x, z] of [[-9.6, -23.5], [9.6, -23.5], [-9.6, -36.5], [9.6, -36.5]]) pendurar(new THREE.Vector3(0, 4.3, CZ), new THREE.Vector3(x, 3.2, z), 0.7, 0.5);
  const lampadas = new THREE.InstancedMesh(new THREE.SphereGeometry(0.055, 8, 6), std({ color: 0xfff2c8, emissive: 0xffc070, emissiveIntensity: 2.6 }), pontosLuz.length);
  const mtx = new THREE.Matrix4();
  pontosLuz.forEach((p, i) => lampadas.setMatrixAt(i, mtx.makeTranslation(p.x, p.y, p.z)));
  lampadas.castShadow = false;
  g.add(lampadas);
  const corLamp = lampadas.material as THREE.MeshStandardMaterial;
  anima.push((_dt, t) => (corLamp.emissiveIntensity = 2.4 + Math.sin(t * 2.1) * 0.25));
  // bandeirinhas de festa atravessando a rua
  const coresBand = [0xe74c3c, 0xf2c94c, 0x2e86de, 0x27ae60, 0xff7ab8, 0xf39c12];
  const triangulo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.13, 0, 0), new THREE.Vector3(0.13, 0, 0), new THREE.Vector3(0, -0.3, 0)]);
  triangulo.computeVertexNormals();
  const bandeiras: THREE.Mesh[] = [];
  for (const z of [-17.2, -10, -2.8, 4.4, 11.6, 18.8]) {
    const a = new THREE.Vector3(-borda, 3.75, z), b = new THREE.Vector3(borda, 3.75, z);
    const pts = fioPendurado(a, b, 0.6, 24);
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), fio));
    fioPendurado(a, b, 0.6, 28).slice(1, -1).forEach((p, i) => {
      const m = new THREE.Mesh(triangulo, std({ color: coresBand[(((i + Math.round(z)) % coresBand.length) + coresBand.length) % coresBand.length], side: THREE.DoubleSide, roughness: 1 }));
      m.position.copy(p);
      g.add(m);
      bandeiras.push(m);
    });
  }
  anima.push((_dt, t) => bandeiras.forEach((b, i) => (b.rotation.x = Math.sin(t * 2.4 + i * 0.7) * 0.3)));
  // floreiras debaixo das janelas
  const caixaFlor = texMat(T.madeira([1, 1], '#4a2e1a'), { roughness: 0.8 });
  const flores = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.065, 0), std({ roughness: 0.8 }), o.floreiras.length * 9);
  let nf = 0;
  const corF = [0xe74c3c, 0xf2c94c, 0xffffff, 0xff7ab8, 0xb06ad8];
  for (const f of o.floreiras) {
    caixa(g, 0.22, 0.16, 1.15, caixaFlor, f.x, 0.88, f.z).castShadow = false;
    for (let i = 0; i < 9; i++) {
      flores.setMatrixAt(nf, mtx.makeTranslation(f.x + (r() - 0.5) * 0.12, 1.08 + r() * 0.06, f.z - 0.48 + i * 0.12));
      flores.setColorAt(nf, new THREE.Color(corF[(nf * 7) % corF.length]));
      nf++;
    }
  }
  flores.castShadow = false;
  g.add(flores);
  // chaminés soltando fumaça
  const fumacas: { m: THREE.Mesh; mat: THREE.MeshStandardMaterial; x: number; z: number; y: number; f: number }[] = [];
  for (const c of o.chamines) {
    caixa(g, 0.5, 1.5, 0.5, pbr('tijolo', [1, 2]), c.x, c.y - 1.1, c.z);
    for (let i = 0; i < 5; i++) {
      const mat = std({ color: 0xc8c4bc, roughness: 1, transparent: true, opacity: 0.4, depthWrite: false });
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), mat);
      m.castShadow = false;
      g.add(m);
      fumacas.push({ m, mat, x: c.x, z: c.z, y: c.y + 0.4, f: i / 5 });
    }
  }
  anima.push((_dt, t) => {
    for (const s of fumacas) {
      const k = (t * 0.22 + s.f) % 1;
      s.m.position.set(s.x + Math.sin(k * 3 + s.x) * 0.3 + k * 0.6, s.y + k * 3.2, s.z + k * 0.3);
      s.m.scale.setScalar(0.6 + k * 1.8);
      s.mat.opacity = 0.42 * (1 - k);
    }
  });
  // galinhas ciscando pela praça (Quaternius, CC0)
  const galinhas: { raiz: THREE.Object3D; mixer: THREE.AnimationMixer; acoes: Record<string, THREE.AnimationAction>; alvo: THREE.Vector2; espera: number; atual: string }[] = [];
  const sortearAlvo = () => {
    for (;;) {
      const v = new THREE.Vector2((r() - 0.5) * 17, -24 - r() * 12);
      if (Math.hypot(v.x, v.y - CZ) > 3.9 && !(Math.abs(v.x - BX) < 1.6 && Math.abs(v.y - BZ) < 1)) return v;
    }
  };
  rastrear(carregadorGltf().loadAsync(`${import.meta.env.BASE_URL}ambiente/bichos/galinha.glb?v=${__VERSAO__}`)).then((gl) => {
    const caixaG = new THREE.Box3().setFromObject(gl.scene);
    const k = 0.42 / Math.max(0.01, caixaG.getSize(new THREE.Vector3()).y);
    for (let i = 0; i < 7; i++) {
      const raiz = SkeletonUtils.clone(gl.scene);
      raiz.scale.setScalar(k * (0.85 + r() * 0.3));
      raiz.traverse((x) => ((x as THREE.Mesh).isMesh && ((x as THREE.Mesh).castShadow = true)));
      const p = sortearAlvo();
      raiz.position.set(p.x, -caixaG.min.y * k, p.y);
      g.add(raiz);
      const mixer = new THREE.AnimationMixer(raiz);
      const acoes: Record<string, THREE.AnimationAction> = {};
      for (const nome of ['Idle', 'Idle_Peck', 'Run']) {
        const clip = gl.animations.find((a) => a.name.endsWith('|' + nome));
        if (clip) acoes[nome] = mixer.clipAction(clip);
      }
      acoes.Idle_Peck?.play();
      mixer.update(r() * 2);
      galinhas.push({ raiz, mixer, acoes, alvo: sortearAlvo(), espera: 1 + r() * 4, atual: 'Idle_Peck' });
    }
  });
  const tocar = (gn: (typeof galinhas)[number], nome: string) => {
    if (gn.atual === nome || !gn.acoes[nome]) return;
    gn.acoes[nome].reset().play();
    gn.acoes[gn.atual]?.crossFadeTo(gn.acoes[nome], 0.2, false);
    gn.atual = nome;
  };
  anima.push((dt) => {
    for (const gn of galinhas) {
      gn.mixer.update(dt);
      if (gn.espera > 0) {
        gn.espera -= dt;
        if (gn.espera <= 0) gn.alvo = sortearAlvo();
        continue;
      }
      const p = gn.raiz.position;
      const dx = gn.alvo.x - p.x, dz = gn.alvo.y - p.z, d = Math.hypot(dx, dz);
      if (d < 0.15) {
        gn.espera = 2 + r() * 5;
        tocar(gn, r() < 0.7 ? 'Idle_Peck' : 'Idle');
        continue;
      }
      tocar(gn, 'Run');
      if (gn.acoes.Run) gn.acoes.Run.timeScale = 0.7;
      const passo = Math.min(d, 0.9 * dt);
      p.x += (dx / d) * passo;
      p.z += (dz / d) * passo;
      gn.raiz.rotation.y = Math.atan2(dx, dz);
    }
  });
  return { obst, atualizar: (dt: number, t: number) => anima.forEach((f) => f(dt, t)) };
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
  const gente: NonNullable<Area['gente']> = [{ id: ({ doceria: 'vila_lurdinha', teclados: 'vila_kenji', livraria: 'vila_firmina', correio: 'vila_oswaldo', pegadinhas: 'vila_juca' } as Record<string, string>)[tipo], x: 0.8, z: -D / 2 + 0.8, ry: 0 }];
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

// ---------------------------------------------------------------- salas temáticas (um cenário próprio por lugar)

/** tela falsa desenhada em canvas: log rolando, gráfico, mapa, alerta ou slide */
function telaFalsa(tipo: 'log' | 'graf' | 'mapa' | 'alerta' | 'slide' | 'hex', texto = '', semente = 1): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = 512;
  cv.height = 320;
  const c = cv.getContext('2d')!;
  const r = rnd(semente);
  c.fillStyle = tipo === 'alerta' ? '#2a0508' : tipo === 'slide' ? '#f4f1ea' : '#06120c';
  c.fillRect(0, 0, 512, 320);
  if (tipo === 'log' || tipo === 'hex') {
    c.font = '15px monospace';
    for (let i = 0; i < 17; i++) {
      c.fillStyle = r() < 0.12 ? '#ff5a5a' : r() < 0.2 ? '#ffd166' : '#5aff8a';
      const linha = tipo === 'hex'
        ? `${(0x7f3a0000 + i * 16).toString(16)}  ${Array.from({ length: 8 }, () => Math.floor(r() * 65536).toString(16).padStart(4, '0')).join(' ')}`
        : `${String(10 + Math.floor(r() * 13)).padStart(2, '0')}:${String(Math.floor(r() * 60)).padStart(2, '0')} ${['sshd', 'kernel', 'nginx', 'auth', 'dns', 'fw'][Math.floor(r() * 6)]}: ${['login ok', 'conexão recusada', 'GET /index 200', 'senha errada', 'consulta castelo.br', 'pacote bloqueado', 'sessão aberta'][Math.floor(r() * 7)]}`;
      c.fillText(linha, 10, 22 + i * 18);
    }
  } else if (tipo === 'graf') {
    c.strokeStyle = '#1e4a3a';
    for (let x = 0; x < 512; x += 32) c.strokeRect(x, 0, 32, 320);
    c.strokeStyle = '#6ef2ff';
    c.lineWidth = 3;
    c.beginPath();
    for (let x = 0; x <= 512; x += 16) c.lineTo(x, 200 - Math.sin(x / 40 + semente) * 60 - r() * 40);
    c.stroke();
    c.fillStyle = '#ffd166';
    for (let i = 0; i < 10; i++) c.fillRect(20 + i * 48, 300 - r() * 90, 30, 90);
  } else if (tipo === 'mapa') {
    c.fillStyle = '#0d2a3a';
    c.beginPath();
    c.ellipse(256, 160, 200, 120, 0, 0, Math.PI * 2);
    c.fill();
    for (let i = 0; i < 24; i++) {
      c.fillStyle = r() < 0.3 ? '#ff3d5a' : '#6ef2ff';
      c.beginPath();
      c.arc(90 + r() * 330, 70 + r() * 180, 4 + r() * 4, 0, Math.PI * 2);
      c.fill();
    }
  } else if (tipo === 'alerta') {
    c.fillStyle = '#ff3d5a';
    c.font = 'bold 54px sans-serif';
    c.textAlign = 'center';
    c.fillText(texto || 'ALERTA', 256, 150);
    c.font = '22px monospace';
    c.fillStyle = '#ffd0d0';
    c.fillText('severidade: alta', 256, 210);
  } else {
    c.fillStyle = '#1a1a2e';
    c.font = 'bold 40px sans-serif';
    c.textAlign = 'center';
    c.fillText(texto || 'SINERGIA 360°', 256, 120);
    c.font = '22px sans-serif';
    c.fillStyle = '#7a4aa8';
    ['• alavancar', '• empoderar', '• sinergizar'].forEach((t, i) => c.fillText(t, 256, 180 + i * 34));
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** monitor com moldura preta e tela acesa */
function monitor(g: THREE.Object3D, x: number, y: number, z: number, ry: number, tex: THREE.Texture, w = 0.55, hh = 0.34) {
  const m = new THREE.Group();
  m.position.set(x, y, z);
  m.rotation.y = ry;
  g.add(m);
  caixa(m, w + 0.04, hh + 0.04, 0.04, std({ color: 0x151515, roughness: 0.5 }), 0, 0.12, 0);
  const tela = plano(m, w, hh, std({ color: 0x000000, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.9 }), 0, 0.12 + (hh + 0.04) / 2, 0.022);
  tela.castShadow = false;
  caixa(m, 0.05, 0.12, 0.05, std({ color: 0x222222 }), 0, 0, 0);
  return m;
}

interface Tema {
  modelo: string;
  W: number;
  D: number;
  H: number;
  parede: THREE.Material;
  piso: THREE.Material;
  teto?: THREE.Material;
  lousa?: string; // título escrito na lousa; sem isso não tem lousa
  carteiras?: { fileiras: number; colunas: number; z0?: number; laptop?: boolean };
  luz?: number;
  ceu?: number;
  neblina?: number;
  porta?: string;
  /** acabamento comum: 'escola' (vigas, lambri, quadros), 'industrial' (treliça, canos, faixas) ou 'nenhum' */
  estilo?: 'escola' | 'industrial' | 'nenhum';
  deco: (g: THREE.Group, obst: Area['obstaculos'], atualiza: ((t: number) => void)[], d: { W: number; D: number; H: number }) => void;
}

// frases dos quadros nas paredes das salas
const QUADROS = [
  'QUEM TEM BACKUP TEM TUDO', 'DESCONFIE DO URGENTE', 'SENHA NÃO É PRESENTE', 'ATUALIZE HOJE, NÃO AMANHÃ', 'LOG É MEMÓRIA',
  'MENOR PRIVILÉGIO SEMPRE', 'NA DÚVIDA, NÃO CLIQUE', 'TODO SISTEMA TEM UM HUMANO', 'MFA EM TUDO', 'ANOTE O HORÁRIO EM UTC',
  'CONFIE, MAS VERIFIQUE', 'NADA É SÓ UM TESTE',
];

/** acabamento comum das salas temáticas, para nenhuma ficar com teto preto e parede lisa */
function enfeitarSala(g: THREE.Group, W: number, D: number, H: number, estilo: 'escola' | 'industrial' | 'nenhum', modelo: string, obst: Area['obstaculos'], temLousa: boolean) {
  if (estilo === 'nenhum') return;
  const h = [...modelo].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0;
  const r = rnd(h);
  if (estilo === 'escola') {
    // vigas de madeira no teto
    const viga = texMat(T.madeira([3, 1], '#3e2614'), { roughness: 0.7 });
    for (let z = -D / 2 + 1.6; z < D / 2 - 0.5; z += 2.6) caixa(g, W, 0.24, 0.28, viga, 0, H - 0.24, z).castShadow = false;
    caixa(g, 0.3, 0.2, D, viga, 0, H - 0.44, 0).castShadow = false;
    // lambri de madeira nas paredes laterais e na do fundo, com friso por cima
    const lambri = texMat(T.madeira([4, 1], '#5a3a22'), { roughness: 0.6 });
    const friso = texMat(T.madeira([4, 1], '#3e2614'), { roughness: 0.5 });
    for (const lado of [-1, 1]) {
      caixa(g, 0.04, 1, D - 0.1, lambri, lado * (W / 2 - 0.025), 0, 0).castShadow = false;
      caixa(g, 0.08, 0.07, D - 0.1, friso, lado * (W / 2 - 0.04), 1, 0).castShadow = false;
    }
    caixa(g, W - 0.1, 1, 0.04, lambri, 0, 0, -D / 2 + 0.025).castShadow = false;
    caixa(g, W - 0.1, 0.07, 0.08, friso, 0, 1, -D / 2 + 0.04).castShadow = false;
    // quadros com frases de segurança, um de cada lado
    const moldura = texMat(T.madeira([1, 1], '#2a1a0e'), { roughness: 0.5 });
    for (const lado of [-1, 1]) {
      const frase = QUADROS[(h + (lado > 0 ? 5 : 0)) % QUADROS.length];
      const z = D / 2 - 2.2;
      const x = lado * (W / 2 - 0.05);
      caixa(g, 0.05, 0.86, 1.56, moldura, x, 1.87, z).castShadow = false;
      const tex = T.placa(frase, '#f4ecd8', '#2a1a2e', 768, 384);
      plano(g, 1.4, 0.7, std({ map: tex, roughness: 0.9 }), x - lado * 0.035, 2.3, z, 0, lado < 0 ? Math.PI / 2 : -Math.PI / 2).castShadow = false;
    }
    // relógio de parede em cima da porta
    const rel = new THREE.Group();
    rel.position.set(0, H - 0.9, D / 2 - 0.06);
    rel.rotation.y = Math.PI;
    g.add(rel);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 8, 28), std({ color: 0x2a1a0e, roughness: 0.4 }));
    rel.add(aro);
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.29, 28), std({ color: 0xf4ecd8, roughness: 0.8 }));
    face.position.z = -0.005;
    rel.add(face);
    for (const [c, a] of [[0.17, 0.7], [0.24, 2.3]] as const) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.02, c, 0.01), std({ color: 0x111111 }));
      p.geometry.translate(0, c / 2, 0);
      p.rotation.z = a;
      p.position.z = 0.01;
      rel.add(p);
    }
    // plantas nos cantos da entrada e luminárias pendentes de vidro
    for (const lado of [-1, 1]) {
      const x = lado * (W / 2 - 0.6);
      movel(g, 'potted_plant_01', x, D / 2 - 0.8, { alt: 0.9 + r() * 0.5 });
      obst.push([x - 0.35, x + 0.35, D / 2 - 1.15, D / 2 - 0.45]);
    }
    const bulbo = std({ color: 0xfff0d0, emissive: 0xffc98a, emissiveIntensity: 2 });
    const fio = std({ color: 0x111111 });
    for (const x of [-W / 4, W / 4]) for (const z of temLousa ? [-D / 4, D / 4] : [0]) {
      const queda = 0.9;
      cil(g, 0.008, 0.008, queda, fio, x, H - queda, z, 4);
      const cupula = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.2, 16, 1, true), std({ color: 0x2e4a3a, metalness: 0.5, roughness: 0.4, side: THREE.DoubleSide }));
      cupula.position.set(x, H - queda - 0.05, z);
      g.add(cupula);
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), bulbo);
      b.position.set(x, H - queda - 0.14, z);
      g.add(b);
    }
  } else {
    // treliça de ferro no teto, canos nas paredes e faixa zebrada no chão
    const ferro = std({ color: 0x2b2e33, metalness: 0.7, roughness: 0.5 });
    for (let z = -D / 2 + 2; z < D / 2; z += 3.5) {
      caixa(g, W, 0.22, 0.16, ferro, 0, H - 0.4, z).castShadow = false;
      for (const lado of [-1, 1]) {
        const d = new THREE.Mesh(new THREE.BoxGeometry(0.1, Math.hypot(W / 4, 0.8), 0.1), ferro);
        d.position.set(lado * W / 8, H - 0.4 + 0.4, z);
        d.rotation.z = lado * Math.atan2(W / 4, 0.8);
        g.add(d);
      }
    }
    const cano = std({ color: 0x6a4a32, metalness: 0.6, roughness: 0.5 });
    const canoAzul = std({ color: 0x2a4a6a, metalness: 0.5, roughness: 0.5 });
    for (const lado of [-1, 1]) for (const [y, m, rr] of [[H - 0.9, cano, 0.09], [H - 1.25, canoAzul, 0.06]] as const) {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, D - 0.2, 10), m);
      c.rotation.x = Math.PI / 2;
      c.position.set(lado * (W / 2 - 0.2), y, 0);
      g.add(c);
      for (let z = -D / 2 + 1; z < D / 2; z += 2) caixa(g, 0.12, 0.05, 0.05, ferro, lado * (W / 2 - 0.12), y - 0.02, z).castShadow = false;
    }
    const cvz = document.createElement('canvas');
    cvz.width = 256;
    cvz.height = 32;
    const cz = cvz.getContext('2d')!;
    for (let i = 0; i < 16; i++) {
      cz.fillStyle = i % 2 ? '#1a1a1a' : '#e8b820';
      cz.beginPath();
      cz.moveTo(i * 16, 32);
      cz.lineTo(i * 16 + 16, 0);
      cz.lineTo(i * 16 + 32, 0);
      cz.lineTo(i * 16 + 16, 32);
      cz.fill();
    }
    const tz = new THREE.CanvasTexture(cvz);
    tz.colorSpace = THREE.SRGBColorSpace;
    tz.wrapS = THREE.RepeatWrapping;
    for (const lado of [-1, 1]) {
      const t2 = tz.clone();
      t2.repeat.set(D / 2, 1);
      t2.needsUpdate = true;
      plano(g, D - 1, 0.14, std({ map: t2, roughness: 0.9 }), lado * (W / 2 - 0.5), 0.013, 0, -Math.PI / 2, Math.PI / 2).castShadow = false;
    }
    // lâmpadas industriais de cúpula
    const bulbo = std({ color: 0xfff6e0, emissive: 0xfff0c0, emissiveIntensity: 2.2 });
    for (const x of [-W / 4, W / 4]) for (const z of [-D / 4, D / 4]) {
      cil(g, 0.01, 0.01, 1.2, ferro, x, H - 1.2, z, 4);
      const cup = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.25, 16, 1, true), std({ color: 0x3a4a3a, metalness: 0.6, roughness: 0.4, side: THREE.DoubleSide }));
      cup.position.set(x, H - 1.25, z);
      g.add(cup);
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), bulbo);
      b.position.set(x, H - 1.36, z);
      g.add(b);
    }
  }
}

/** sala com paredes, luz, lousa e carteiras opcionais; o tema coloca o resto */
function salaTematica(t: Tema): Area {
  const g = new THREE.Group();
  const { W, D, H } = t;
  salaFechada(g, W, D, H, t.parede, t.piso, t.teto ?? std({ color: 0x2a2018, roughness: 1 }));
  const obst: Area['obstaculos'] = [];
  const atualiza: ((tt: number) => void)[] = [];
  let lousa: THREE.Mesh | undefined;
  let assento: Area['assento'];
  let assentos: Area['assentos'];
  if (t.lousa !== undefined) {
    lousa = plano(g, 4, 2, std({ color: 0xffffff, roughness: 0.95 }), 0, 2.1, -D / 2 + 0.06);
    (lousa.material as THREE.MeshStandardMaterial).map = T.lousa(t.lousa, ['Quem tem backup tem tudo.']);
    caixa(g, 4.3, 0.1, 0.2, texMat(T.madeira([1, 1], '#5c3a20'), { roughness: 0.6 }), 0, 1.05, -D / 2 + 0.12);
  }
  if (t.carteiras) {
    const { fileiras, colunas } = t.carteiras;
    const z0 = t.carteiras.z0 ?? -D / 2 + 3.4;
    const lugares: { x: number; z: number }[] = [];
    for (let f = 0; f < fileiras; f++)
      for (let c = 0; c < colunas; c++) {
        const x = (c - (colunas - 1) / 2) * 2.2;
        const z = z0 + f * 2.3;
        lugares.push({ x, z });
        obst.push([x - 0.5, x + 0.5, z - 0.4, z + 1]);
      }
    repetir(g, 'SchoolDesk_01', lugares, { alt: 0.76 });
    if (t.carteiras.laptop !== false) repetir(g, 'classic_laptop', lugares.map((p) => ({ x: p.x, z: p.z - 0.05 })), { larg: 0.34, y: 0.76, ry: 0 }, false);
    repetir(g, 'SchoolChair_01', lugares.map((p) => ({ x: p.x, z: p.z + 0.62 })), { alt: 0.84, ry: Math.PI });
    const meu = lugares[lugares.length - 2] ?? lugares[0];
    assento = { x: meu.x, z: meu.z + 0.62, yaw: 0 };
    assentos = lugares.filter((p) => p !== meu).map((p) => ({ x: p.x, z: p.z + 0.62, ry: Math.PI }));
  }
  t.deco(g, obst, atualiza, { W, D, H });
  enfeitarSala(g, W, D, H, t.estilo ?? 'escola', t.modelo, obst, t.lousa !== undefined);
  lampiao(g, 0, H - 0.9, 0, 5, 10, t.luz ?? 0xffc98a);
  luzPrincipal(g, 0, H - 0.2, 2, t.luz ?? 0xffe2b8, 26, new THREE.Vector3(0, 0, -1.5));
  g.add(new THREE.HemisphereLight(0xd8d0e0, 0x3a2a18, 1));
  return {
    modelo: t.modelo, grupo: g, entrada: { x: 0, z: D / 2 - 1.4, yaw: 0 }, palco: [{ x: -1.2, z: D / 2 - 3.4 }, { x: 1.2, z: D / 2 - 3.5 }, { x: 0, z: D / 2 - 4 }, { x: 2.2, z: D / 2 - 3 }],
    professor: { x: 1.4, z: -D / 2 + 1.4 }, assento, assentos, lousa,
    limites: [-W / 2 + 0.5, W / 2 - 0.5, -D / 2 + 0.5, D / 2 - 0.4], obstaculos: obst,
    portas: [{ x: 0, z: D / 2 - 0.4, rotulo: t.porta ?? 'Sair' }], ceu: t.ceu ?? 0x0e0b18, neblina: t.neblina ?? 0.015,
    atualizar: atualiza.length ? (_dt, tt) => atualiza.forEach((f) => f(tt)) : undefined,
  };
}

const madeiraEscura = () => texMat(T.madeira([2, 1], '#4a2c18'), { roughness: 0.55 });
const metalEscuro = () => std({ color: 0x3a3e44, metalness: 0.7, roughness: 0.4 });

const TEMAS: Record<string, () => Area> = {
  // sala acolhedora demais: almofada, biscoito e um quadro que pede confiança
  persuasao: () => salaTematica({
    modelo: 'persuasao', W: 11, D: 12, H: 4, parede: pbr('reboco', [3, 1.5], { color: 0xf0c8c0 }), piso: pbr('assoalho', [3, 3]),
    lousa: 'Persuasão e Engano', carteiras: { fileiras: 2, colunas: 3, laptop: false }, luz: 0xffd0b0, porta: 'Sair da sala',
    deco: (g, obst, _a, { W, D }) => {
      for (const lado of [-1, 1]) {
        movel(g, 'Sofa_01', lado * (W / 2 - 0.8), 1.5, { larg: 2, ry: lado < 0 ? Math.PI / 2 : -Math.PI / 2 });
        obst.push([lado < 0 ? -W / 2 : W / 2 - 1.3, lado < 0 ? -W / 2 + 1.3 : W / 2, 0.4, 2.6]);
      }
      const cores = [0xff9fd2, 0xffd166, 0x9fe7ff, 0xc8a0ff];
      for (let i = 0; i < 8; i++) {
        const a = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), std({ color: cores[i % 4], roughness: 1 }));
        a.scale.set(1, 0.45, 1);
        a.position.set(-W / 2 + 1.2 + (i % 2) * 0.5, 0.14 + Math.floor(i / 2) * 0.01, -2.2 + i * 0.5);
        g.add(a);
      }
      movel(g, 'CoffeeTable_01', W / 2 - 2.2, 3.6, { larg: 1 });
      for (let i = 0; i < 6; i++) cil(g, 0.05, 0.05, 0.015, std({ color: 0xc89050, roughness: 0.9 }), W / 2 - 2.3 + (i % 3) * 0.12, 0.45, 3.5 + Math.floor(i / 3) * 0.12, 12);
      const tex = T.placa('CONFIE EM MIM', '#3a1a2a', '#ffd0e0', 512, 128);
      plano(g, 2, 0.5, std({ map: tex, roughness: 0.8 }), -W / 2 + 0.05, 2.4, -1, 0, Math.PI / 2).castShadow = false;
      movel(g, 'potted_plant_01', -W / 2 + 0.7, -D / 2 + 0.7, { alt: 1.2 });
    },
  }),
  // casa de máquinas do funicular: volante gigante, tambor de cabo e cabos de rede no lugar do aço
  maquinas: () => salaTematica({
    modelo: 'maquinas', estilo: 'industrial', W: 14, D: 14, H: 7, parede: pbr('tijolo', [5, 3]), piso: pbr('concreto', [4, 4], { color: 0x8a847c }),
    lousa: 'Casa de Máquinas', luz: 0xffd8a0, porta: 'Sair da casa de máquinas',
    deco: (g, obst, atualiza, { W, D }) => {
      const ferro = metalEscuro();
      const volante = new THREE.Group();
      volante.position.set(-3.6, 2.8, -2);
      volante.rotation.y = Math.PI / 2;
      g.add(volante);
      const aro = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.16, 10, 40), ferro);
      volante.add(aro);
      for (let i = 0; i < 6; i++) {
        const raio = new THREE.Mesh(new THREE.BoxGeometry(0.14, 4.8, 0.14), ferro);
        raio.rotation.z = (i * Math.PI) / 6;
        volante.add(raio);
      }
      atualiza.push((t) => (volante.rotation.x = t * 0.25));
      caixa(g, 1, 0.5, 5.4, ferro, -3.6, 0, -2);
      obst.push([-6.5, -0.8, -5, 1]);
      // tambor com cabo amarelo enrolado
      const tambor = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 2.4, 24), std({ color: 0xd4b030, roughness: 0.6 }));
      tambor.rotation.z = Math.PI / 2;
      tambor.position.set(3.4, 1.2, -3);
      g.add(tambor);
      atualiza.push((t) => (tambor.rotation.x = -t * 0.4));
      obst.push([2, 4.8, -4.2, -1.8]);
      for (let i = 0; i < 4; i++) cil(g, 0.035, 0.035, 9, std({ color: [0x2a5aaa, 0xd4b030, 0xaa2a2a, 0x2aaa5a][i] }), W / 2 - 0.3, 5.8 - i * 0.12, -D / 2 + 2, 6).rotation.x = Math.PI / 2;
      movel(g, 'steel_frame_shelves_01', W / 2 - 0.6, 3, { alt: 2.2, ry: -Math.PI / 2 });
    },
  }),
  // central telefônica: mesas de telefonista com plugues de latão
  comutacao: () => salaTematica({
    modelo: 'comutacao', W: 12, D: 12, H: 4.2, parede: texMat(T.madeira([4, 2], '#6a4a2e'), { roughness: 0.7 }), piso: pbr('assoalho', [3, 3]),
    lousa: 'Sala de Comutação', porta: 'Sair da sala',
    deco: (g, obst, atualiza, { W }) => {
      const cv = document.createElement('canvas');
      cv.width = 512;
      cv.height = 256;
      const c = cv.getContext('2d')!;
      c.fillStyle = '#2a1c12';
      c.fillRect(0, 0, 512, 256);
      for (let y = 0; y < 6; y++) for (let x = 0; x < 16; x++) {
        c.fillStyle = '#c9a050';
        c.beginPath();
        c.arc(18 + x * 31, 22 + y * 40, 7, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#111';
        c.beginPath();
        c.arc(18 + x * 31, 22 + y * 40, 3, 0, Math.PI * 2);
        c.fill();
      }
      const painel = new THREE.CanvasTexture(cv);
      painel.colorSpace = THREE.SRGBColorSpace;
      const luzes: THREE.MeshStandardMaterial[] = [];
      for (const lado of [-1, 1]) for (let i = 0; i < 3; i++) {
        const z = -2.5 + i * 2.4;
        const x = lado * (W / 2 - 0.5);
        caixa(g, 0.7, 0.8, 1.8, madeiraEscura(), x, 0, z);
        plano(g, 1.8, 0.9, std({ map: painel, roughness: 0.6 }), lado * (W / 2 - 0.06), 1.4, z, 0, lado < 0 ? Math.PI / 2 : -Math.PI / 2);
        const l = std({ color: 0x000000, emissive: 0xffaa22, emissiveIntensity: 1 });
        luzes.push(l);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), l);
        lamp.position.set(lado * (W / 2 - 0.1), 1.95, z);
        g.add(lamp);
        movel(g, 'SchoolChair_01', lado * (W / 2 - 1.3), z, { alt: 0.84, ry: lado < 0 ? -Math.PI / 2 : Math.PI / 2 });
        obst.push([x - 0.5, x + 0.5, z - 1, z + 1]);
        for (let k = 0; k < 3; k++) {
          const cabo = new THREE.Mesh(new THREE.TorusGeometry(0.25 + k * 0.08, 0.012, 5, 16, Math.PI), std({ color: [0x8a2a2a, 0x2a2a2a, 0x2a4a8a][k] }));
          cabo.position.set(lado * (W / 2 - 0.4), 0.95, z - 0.3 + k * 0.3);
          cabo.rotation.set(Math.PI, lado < 0 ? Math.PI / 2 : -Math.PI / 2, 0);
          g.add(cabo);
        }
      }
      atualiza.push((t) => luzes.forEach((l, i) => (l.emissiveIntensity = Math.sin(t * 2.5 + i * 1.7) > 0.4 ? 2 : 0.15)));
    },
  }),
  // antiga sala do telégrafo: fitas de papel perfurado nas paredes e mesa de luz
  rastros: () => salaTematica({
    modelo: 'rastros', W: 12, D: 14, H: 4.6, parede: pbr('reboco', [3, 1.5], { color: 0xd8ccb0 }), piso: pbr('assoalho', [3, 3]),
    lousa: 'Leitura de Rastros', carteiras: { fileiras: 3, colunas: 4 }, porta: 'Sair da sala',
    deco: (g, _o, _a, { W, D }) => {
      const cv = document.createElement('canvas');
      cv.width = 64;
      cv.height = 512;
      const c = cv.getContext('2d')!;
      c.fillStyle = '#f2ecd8';
      c.fillRect(0, 0, 64, 512);
      c.fillStyle = '#2a2018';
      const r = rnd(3);
      for (let y = 8; y < 512; y += 14) for (let x = 0; x < 5; x++) if (r() < 0.5) c.fillRect(8 + x * 11, y, 6, 6);
      const fita = new THREE.CanvasTexture(cv);
      fita.colorSpace = THREE.SRGBColorSpace;
      for (const lado of [-1, 1]) for (let i = 0; i < 9; i++)
        plano(g, 0.18, 2.4, std({ map: fita, roughness: 1, side: THREE.DoubleSide }), lado * (W / 2 - 0.04), 2.2 + Math.sin(i) * 0.15, -5 + i * 1.2, 0, lado < 0 ? Math.PI / 2 : -Math.PI / 2).castShadow = false;
      const mesaLuz = caixa(g, 1.6, 0.9, 1, std({ color: 0xf0f4ff, emissive: 0xdde8ff, emissiveIntensity: 0.7 }), -W / 2 + 1.4, 0, -D / 2 + 1.6);
      mesaLuz.castShadow = false;
    },
  }),
  // antiga sala de música tomada pela consultoria: pufe, lousa de vidro e TV gigante
  sinergia: () => salaTematica({
    modelo: 'sinergia', W: 12, D: 12, H: 4.2, parede: pbr('reboco', [3, 1.5], { color: 0xeeeeee }), piso: pbr('assoalho', [3, 3], { color: 0xcfc8c0 }),
    lousa: 'Sinergia', luz: 0xf0f4ff, porta: 'Sair da sala',
    deco: (g, obst, _a, { W }) => {
      const tv = plano(g, 3.6, 2, std({ color: 0x000000, emissive: 0xffffff, emissiveMap: telaFalsa('slide', 'SINERGIA 360°'), emissiveIntensity: 0.9 }), W / 2 - 0.1, 2.1, 0, 0, -Math.PI / 2);
      tv.castShadow = false;
      caixa(g, 0.1, 2.1, 3.7, std({ color: 0x111111 }), W / 2 - 0.02, 1.05, 0);
      const cores = [0xff7a3a, 0x3ad0ff, 0xc8ff3a, 0xff3ad0, 0xffd23a];
      for (let i = 0; i < 10; i++) {
        const x = -3 + (i % 5) * 1.5;
        const z = 0.5 + Math.floor(i / 5) * 2;
        cil(g, 0.35, 0.4, 0.42, std({ color: cores[i % 5], roughness: 0.9 }), x, 0, z, 16);
        obst.push([x - 0.4, x + 0.4, z - 0.4, z + 0.4]);
      }
      movel(g, 'potted_plant_01', -W / 2 + 0.6, -3.5, { alt: 1.4 });
    },
  }),
  // oficina de locomotivas virada laboratório: bancadas de ferro com monitores em fila
  reverso: () => salaTematica({
    modelo: 'reverso', W: 13, D: 15, H: 5.5, parede: pbr('tijolo', [4, 2]), piso: pbr('concreto', [4, 4], { color: 0x8a847c }),
    lousa: 'Engenharia Reversa', carteiras: { fileiras: 3, colunas: 4, laptop: false }, luz: 0xe8f0ff, porta: 'Sair do laboratório',
    deco: (g, _o, _a, { W, D, H }) => {
      for (let f = 0; f < 3; f++) for (let c = 0; c < 4; c++) monitor(g, (c - 1.5) * 2.2, 0.76, -D / 2 + 3.4 + f * 2.3 - 0.15, 0, telaFalsa(f % 2 ? 'hex' : 'log', '', f * 4 + c));
      const ferro = metalEscuro();
      for (let x = -4; x <= 4; x += 4) caixa(g, 0.25, 0.3, D, ferro, x, H - 0.6, 0);
      for (const lado of [-1, 1]) {
        const e = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.1, 6, 20), std({ color: 0x8a6a3a, metalness: 0.8, roughness: 0.35 }));
        e.position.set(lado * (W / 2 - 0.1), 3, 2);
        e.rotation.y = Math.PI / 2;
        g.add(e);
      }
    },
  }),
  // túneis ferroviários de 1890 com cabo de cobre pregado na pedra
  tunel: () => salaTematica({
    modelo: 'tunel', estilo: 'nenhum', W: 5, D: 26, H: 3.6, parede: pbr('pedra', [10, 1.4]), piso: pbr('pedra', [2, 10], { color: 0x8a8a90 }), teto: pbr('pedra', [2, 10], { color: 0x6a6a70 }),
    luz: 0xffb070, ceu: 0x050508, neblina: 0.05, porta: 'Subir para o castelo',
    deco: (g, _o, atualiza, { W, D }) => {
      const trilho = std({ color: 0x6a6460, metalness: 0.9, roughness: 0.35 });
      for (const dx of [-0.72, 0.72]) caixa(g, 0.07, 0.07, D - 0.4, trilho, dx, 0, 0).castShadow = false;
      const dormente = texMat(T.madeira([1, 1], '#3a2818'), { roughness: 0.9 });
      for (let z = -D / 2 + 0.6; z < D / 2; z += 0.9) caixa(g, 1.9, 0.04, 0.22, dormente, 0, 0, z).castShadow = false;
      const cobre = std({ color: 0xb87333, metalness: 0.9, roughness: 0.35 });
      for (const lado of [-1, 1]) for (let i = 0; i < 3; i++) cil(g, 0.025, 0.025, D - 1, cobre, lado * (W / 2 - 0.08), 2 + i * 0.12, 0, 6).rotation.x = Math.PI / 2;
      const leds: THREE.MeshStandardMaterial[] = [];
      for (let z = -10; z <= 10; z += 5) {
        const lado = z % 10 ? 1 : -1;
        caixa(g, 0.2, 0.4, 0.5, metalEscuro(), lado * (W / 2 - 0.12), 1.3, z);
        const l = std({ color: 0x000000, emissive: 0x33ff55, emissiveIntensity: 2 });
        leds.push(l);
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), l);
        p.position.set(lado * (W / 2 - 0.23), 1.6, z);
        g.add(p);
        lampiao(g, 0, 3, z, 3, 7, 0xffb070);
      }
      atualiza.push((t) => leds.forEach((l, i) => (l.emissiveIntensity = Math.sin(t * 4 + i * 2) > 0 ? 2.4 : 0.2)));
    },
  }),
  // centro de crise: parede de telas, mesas com monitores e giroflex vermelho
  crise: () => salaTematica({
    modelo: 'crise', W: 16, D: 15, H: 5, parede: pbr('concreto', [4, 2], { color: 0x6a7078 }), piso: pbr('concreto', [4, 4], { color: 0x5a5f66 }),
    lousa: 'Centro de Crise', carteiras: { fileiras: 3, colunas: 4, laptop: false }, luz: 0xd0e0ff, ceu: 0x05070c, porta: 'Sair do centro de crise',
    deco: (g, _o, atualiza, { W, D }) => {
      const tipos = ['mapa', 'graf', 'log', 'alerta', 'graf', 'mapa'] as const;
      for (let fila = 0; fila < 2; fila++) for (let col = 0; col < 6; col++) {
        if (col >= 2 && col <= 3 && fila === 0) continue;
        const tex = telaFalsa(tipos[(col + fila) % 6], 'INCIDENTE', col + fila * 7);
        const x = -6.5 + col * 2.6;
        plano(g, 2.4, 1.4, std({ color: 0x000000, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.85 }), x, 1.6 + fila * 1.6, -D / 2 + 0.05).castShadow = false;
      }
      for (let f = 0; f < 3; f++) for (let c = 0; c < 4; c++) {
        monitor(g, (c - 1.5) * 2.2 - 0.28, 0.76, -D / 2 + 3.4 + f * 2.3 - 0.15, 0.15, telaFalsa('log', '', f * 9 + c), 0.42, 0.27);
        monitor(g, (c - 1.5) * 2.2 + 0.28, 0.76, -D / 2 + 3.4 + f * 2.3 - 0.15, -0.15, telaFalsa('graf', '', f * 5 + c), 0.42, 0.27);
      }
      const giro = new THREE.SpotLight(0xff2030, 30, 18, 0.5, 0.4, 1.2);
      giro.position.set(0, 4.7, 0);
      g.add(giro, giro.target);
      const sirene = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8), std({ color: 0x400000, emissive: 0xff2030, emissiveIntensity: 2 }));
      sirene.position.set(0, 4.8, 0);
      g.add(sirene);
      atualiza.push((t) => giro.target.position.set(Math.cos(t * 3) * 6, 0, Math.sin(t * 3) * 6));
      for (const lado of [-1, 1]) janela(g, lado * (W / 2 - 0.02), 2.6, 3, 1.6, 1.8, lado < 0 ? Math.PI / 2 : -Math.PI / 2, 0x1a2a4a);
    },
  }),
  // galpão dos trens antigos com SOC improvisado: seis monitores de doação e painel de alertas
  galpao: () => salaTematica({
    modelo: 'galpao', estilo: 'industrial', W: 16, D: 18, H: 6.5, parede: pbr('tijolo', [6, 3]), piso: pbr('concreto', [5, 6], { color: 0x8a847c }),
    lousa: 'SOC do Galpão', carteiras: { fileiras: 2, colunas: 3, laptop: false }, luz: 0xe0f0ff, porta: 'Sair do galpão',
    deco: (g, obst, atualiza, { W, D }) => {
      for (let i = 0; i < 6; i++) monitor(g, -4.5 + i * 1.8, 0, -D / 2 + 1.2, 0, telaFalsa(i % 3 === 0 ? 'graf' : i % 3 === 1 ? 'log' : 'mapa', '', i * 3), 0.9, 0.55).position.y = 1.0;
      caixa(g, 11, 0.9, 0.7, madeiraEscura(), 0, 0, -D / 2 + 1.1);
      const alerta = std({ color: 0x000000, emissive: 0xffffff, emissiveMap: telaFalsa('alerta', 'ALERTA'), emissiveIntensity: 1 });
      plano(g, 2.4, 1.4, alerta, W / 2 - 0.06, 3.2, -3, 0, -Math.PI / 2).castShadow = false;
      atualiza.push((t) => (alerta.emissiveIntensity = Math.sin(t * 5) > 0 ? 1.2 : 0.35));
      // locomotiva velha no fundo
      const loco = new THREE.Group();
      loco.position.set(-W / 2 + 2.4, 0, 4);
      g.add(loco);
      const verde = std({ color: 0x2a4a3a, metalness: 0.5, roughness: 0.6 });
      caixa(loco, 2.4, 0.9, 7, metalEscuro(), 0, 0.2, 0);
      const caldeira = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 4.5, 20), verde);
      caldeira.rotation.x = Math.PI / 2;
      caldeira.position.set(0, 2, -0.8);
      loco.add(caldeira);
      caixa(loco, 2.3, 2.4, 2.2, verde, 0, 1.1, 2.3);
      cil(loco, 0.3, 0.38, 1, std({ color: 0x1a1a1a }), 0, 2.8, -2.4, 12);
      for (const z of [-2.4, -0.8, 0.8, 2.4]) for (const x of [-1.2, 1.2]) {
        const roda = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.15, 20), std({ color: 0x8a2a1a, metalness: 0.6 }));
        roda.rotation.z = Math.PI / 2;
        roda.position.set(x, 0.55, z);
        loco.add(roda);
      }
      obst.push([-W / 2 + 1, -W / 2 + 3.8, 0, 8]);
      // chaleira em cima de um banquinho
      cil(g, 0.12, 0.15, 0.22, std({ color: 0xc0c0c0, metalness: 0.9, roughness: 0.3 }), W / 2 - 1.2, 0.76, 5, 14);
      movel(g, 'painted_wooden_table', W / 2 - 1.2, 5, { larg: 1 });
    },
  }),
  // cabine de sinalização: torrinha de madeira com alavancas
  cabine: () => salaTematica({
    modelo: 'cabine', W: 7, D: 6, H: 3.4, parede: texMat(T.madeira([3, 2], '#7a2e2a'), { roughness: 0.7 }), piso: texMat(T.tabuado([2, 3])),
    lousa: 'Sinalização', luz: 0xffd8a0, porta: 'Descer da cabine',
    deco: (g, obst, atualiza, { W, D }) => {
      const cores = [0xc0392b, 0x2a5aaa, 0xd4b030, 0xc0392b, 0x2a5aaa, 0x2a2a2a, 0xc0392b, 0xd4b030];
      const alavancas: THREE.Mesh[] = [];
      for (let i = 0; i < 8; i++) {
        const a = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8), std({ color: cores[i], metalness: 0.5, roughness: 0.4 }));
        a.geometry.translate(0, 0.6, 0);
        a.position.set(-1.75 + i * 0.5, 0.25, -D / 2 + 1.5);
        a.rotation.x = i % 3 === 0 ? 0.5 : -0.25;
        g.add(a);
        alavancas.push(a);
      }
      caixa(g, 4.4, 0.25, 0.5, metalEscuro(), 0, 0, -D / 2 + 1.5);
      obst.push([-2.3, 2.3, -D / 2 + 1, -D / 2 + 2]);
      atualiza.push((t) => (alavancas[(Math.floor(t / 4) % 8)].rotation.x = 0.5 * Math.sin(t)));
      for (const lado of [-1, 1]) for (const z of [-1, 1]) janela(g, lado * (W / 2 - 0.02), 2, z, 1.4, 1.2, lado < 0 ? Math.PI / 2 : -Math.PI / 2, 0x9ab0c8);
    },
  }),
  // caixa de areia: sala isolada, sem janela, com tanque de areia e cabines de vidro
  sandbox: () => salaTematica({
    modelo: 'sandbox', estilo: 'industrial', W: 12, D: 12, H: 4, parede: pbr('concreto', [3, 1.5], { color: 0xd8d8d0 }), piso: pbr('concreto', [3, 3], { color: 0xb8b8b0 }),
    lousa: 'Caixa de Areia', luz: 0xf0f4ff, porta: 'Sair da caixa de areia',
    deco: (g, obst, _a, { W, D }) => {
      caixa(g, 3.4, 0.35, 2.4, metalEscuro(), 0, 0, 0.6);
      const areia = caixa(g, 3.2, 0.06, 2.2, std({ color: 0xe0c890, roughness: 1 }), 0, 0.33, 0.6);
      areia.castShadow = false;
      for (let i = 0; i < 6; i++) {
        const monte = new THREE.Mesh(new THREE.ConeGeometry(0.25 + (i % 3) * 0.08, 0.2, 10), std({ color: 0xd8bc80, roughness: 1 }));
        monte.position.set(-1.2 + i * 0.48, 0.48, 0.2 + (i % 2) * 0.7);
        g.add(monte);
      }
      obst.push([-1.8, 1.8, -0.7, 1.9]);
      const vidro = std({ color: 0xcfe8ff, roughness: 0.05, transparent: true, opacity: 0.22 });
      for (const lado of [-1, 1]) for (let i = 0; i < 2; i++) {
        const z = -3 + i * 3;
        const x = lado * (W / 2 - 1.1);
        caixa(g, 1.8, 2.4, 1.8, vidro, x, 0, z).castShadow = false;
        monitor(g, x, 0.76, z - 0.3, 0, telaFalsa('log', '', i * 3 + (lado > 0 ? 1 : 0)), 0.42, 0.27);
        movel(g, 'painted_wooden_table', x, z - 0.2, { larg: 1 });
        obst.push([x - 0.95, x + 0.95, z - 0.95, z + 0.95]);
      }
      const tex = T.placa('SEM REDE · SEM WI-FI · SEM CHORO', '#1a1a1a', '#ffd166', 768, 96);
      plano(g, 4, 0.5, std({ map: tex, roughness: 0.7 }), 0, 3.4, -D / 2 + 0.07).castShadow = false;
    },
  }),
  // oficina do Bem-te-vi: bancada, eletrônicos e quadro de investigação com barbante vermelho
  oficina: () => salaTematica({
    modelo: 'oficina', W: 9, D: 9, H: 3.4, parede: pbr('reboco', [3, 1.5], { color: 0xb8a890 }), piso: texMat(T.tabuado([2, 3])),
    luz: 0xffc070, porta: 'Sair da oficina',
    deco: (g, obst, _a, { W, D }) => {
      movel(g, 'painted_wooden_table', 0, -D / 2 + 1, { larg: 2.6 });
      movel(g, 'desk_lamp_arm_01', -0.9, -D / 2 + 0.9, { alt: 0.45, y: 0.76 });
      monitor(g, 0.4, 0.76, -D / 2 + 0.85, 0, telaFalsa('log', '', 13));
      for (let i = 0; i < 5; i++) caixa(g, 0.3, 0.12, 0.25, std({ color: [0x2a6a2a, 0x2a2a6a, 0x6a2a2a][i % 3], roughness: 0.5 }), -0.6 + i * 0.32, 0.76, -D / 2 + 1.25);
      obst.push([-1.4, 1.4, -D / 2, -D / 2 + 1.5]);
      // quadro de investigação: fotos, papéis e barbante vermelho ligando tudo
      const cv = document.createElement('canvas');
      cv.width = 768;
      cv.height = 448;
      const c = cv.getContext('2d')!;
      c.fillStyle = '#a8784a';
      c.fillRect(0, 0, 768, 448);
      const pontos: [number, number][] = [];
      const r = rnd(21);
      for (let i = 0; i < 11; i++) {
        const x = 40 + r() * 660;
        const y = 30 + r() * 360;
        pontos.push([x + 35, y + 25]);
        c.fillStyle = i % 3 ? '#f2eee2' : '#d8d0c0';
        c.fillRect(x, y, 70, 50);
        c.fillStyle = '#333';
        c.font = '12px monospace';
        c.fillText(['O NULO?', 'IP 10.0.0.66', '23h47', 'quem?', 'log apagado', 'senha123', 'túnel 4'][i % 7], x + 6, y + 28);
      }
      c.strokeStyle = '#c0392b';
      c.lineWidth = 3;
      c.beginPath();
      pontos.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.stroke();
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace;
      plano(g, 3, 1.75, std({ map: tex, roughness: 1 }), -W / 2 + 0.05, 1.8, 0, 0, Math.PI / 2).castShadow = false;
      movel(g, 'steel_frame_shelves_01', W / 2 - 0.5, 0, { alt: 2, ry: -Math.PI / 2 });
      movel(g, 'Sofa_01', W / 2 - 1.1, 3, { larg: 1.8, ry: -Math.PI / 2 });
      // estante de livros, tapete, chaleira e caixas de sucata eletrônica
      movel(g, 'wooden_bookshelf_worn', -W / 2 + 0.5, 3, { alt: 2, ry: Math.PI / 2 });
      movel(g, 'book_encyclopedia_set_01', -W / 2 + 0.45, 3, { larg: 0.6, y: 1.05, ry: Math.PI / 2 });
      obst.push([-W / 2, -W / 2 + 0.9, 2.2, 3.8]);
      const tapete = plano(g, 2.4, 1.6, std({ color: 0x7a2a2a, roughness: 1 }), 0.6, 0.012, 1.2, -Math.PI / 2);
      tapete.castShadow = false;
      plano(g, 2.1, 1.3, std({ color: 0xc89a4a, roughness: 1 }), 0.6, 0.014, 1.2, -Math.PI / 2).castShadow = false;
      movel(g, 'CoffeeTable_01', 0.9, 2.9, { larg: 0.9 });
      cil(g, 0.08, 0.1, 0.16, std({ color: 0xc0c0c0, metalness: 0.9, roughness: 0.3 }), 0.9, 0.42, 2.9, 12);
      for (let i = 0; i < 4; i++) caixa(g, 0.5, 0.35, 0.4, std({ color: 0x8a6a42, roughness: 0.9 }), W / 2 - 0.5, i * 0.35, -2.4 + (i % 2) * 0.05);
      obst.push([W / 2 - 0.8, W / 2, -2.7, -2.1]);
      const fios = std({ color: 0xc0392b, roughness: 0.6 });
      for (let i = 0; i < 3; i++) {
        const f = new THREE.Mesh(new THREE.TorusGeometry(0.12 + i * 0.03, 0.012, 6, 20), [fios, std({ color: 0x2a6ad1 }), std({ color: 0xf2c94c })][i]);
        f.position.set(W / 2 - 0.5, 1.45, -2.4 + i * 0.1);
        f.rotation.x = Math.PI / 2;
        g.add(f);
      }
    },
  }),
  // viveiro: galpão com gaiolas de contenção onde as criaturas-malware brilham
  viveiro: () => salaTematica({
    modelo: 'viveiro', estilo: 'nenhum', W: 14, D: 14, H: 5, parede: texMat(T.madeira([4, 2], '#5a4a32'), { roughness: 0.8 }), piso: pbr('chao_mata', [4, 4]),
    lousa: 'Criaturas-Malware', luz: 0xe0ffd0, porta: 'Sair do viveiro',
    deco: (g, obst, atualiza, { W }) => {
      const vidro = std({ color: 0xcfffe8, roughness: 0.05, transparent: true, opacity: 0.2 });
      const ferro = metalEscuro();
      const cores = [0x7dff9a, 0xff6ec7, 0x6ef2ff, 0xffd166, 0xc88aff, 0xff8a5a];
      for (const lado of [-1, 1]) for (let i = 0; i < 3; i++) {
        const x = lado * (W / 2 - 1.3);
        const z = -3.5 + i * 3.2;
        caixa(g, 1.8, 0.2, 1.8, ferro, x, 0, z);
        caixa(g, 1.7, 1.7, 1.7, vidro, x, 0.2, z).castShadow = false;
        const cor = cores[(i + (lado > 0 ? 3 : 0)) % 6];
        const bicho = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 1), std({ color: cor, emissive: cor, emissiveIntensity: 1.2, roughness: 0.4 }));
        bicho.position.set(x, 0.9, z);
        g.add(bicho);
        const f = i * 1.3 + lado;
        atualiza.push((t) => {
          bicho.position.y = 0.9 + Math.sin(t * 2 + f) * 0.25;
          bicho.rotation.set(t * 0.8 + f, t * 1.1, 0);
        });
        const tex = T.placa(['WORM', 'TROJAN', 'ROOTKIT', 'BOTNET', 'RANSOM', 'KEYLOGGER'][(i + (lado > 0 ? 3 : 0)) % 6], '#1a120c', '#e8c66a', 256, 64);
        plano(g, 0.8, 0.2, std({ map: tex }), x - lado * 0.88, 1.95, z, 0, lado < 0 ? Math.PI / 2 : -Math.PI / 2).castShadow = false;
        obst.push([x - 1, x + 1, z - 1, z + 1]);
      }
      for (let i = 0; i < 3; i++) barril(g, -W / 2 + 1.2 + i * 0.8, 5.6, 0.8);
      // vigas rústicas, plantas, trepadeira e lampiões de lata: viveiro e não depósito
      const viga = texMat(T.madeira([3, 1], '#3e2614'), { roughness: 0.8 });
      for (let z = -5.5; z <= 5.5; z += 2.75) caixa(g, W, 0.3, 0.3, viga, 0, 4.7, z).castShadow = false;
      const folha = std({ color: 0x2f6a32, roughness: 1 });
      const folhaClara = std({ color: 0x5a9a3a, roughness: 1 });
      for (const [x, z] of [[-W / 2 + 0.7, -6.2], [W / 2 - 0.7, -6.2], [-W / 2 + 0.7, 6], [W / 2 - 0.7, 6], [W / 2 - 0.8, 1.6], [-W / 2 + 0.8, 1.6]]) {
        movel(g, 'potted_plant_01', x, z, { alt: 1.3 + ((x * 7 + z) % 3 + 3) % 3 * 0.25 });
        obst.push([x - 0.4, x + 0.4, z - 0.4, z + 0.4]);
      }
      // trepadeira descendo das vigas
      for (let i = 0; i < 28; i++) {
        const x = -W / 2 + 0.5 + (i * 2.37) % (W - 1);
        const z = -5.5 + Math.floor(i / 7) * 2.75 + 0.18;
        const comp = 0.6 + ((i * 13) % 7) * 0.18;
        cil(g, 0.012, 0.012, comp, std({ color: 0x3a5a2a }), x, 4.55 - comp, z, 4);
        for (let k = 0; k < 4; k++) {
          const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), k % 2 ? folha : folhaClara);
          f.position.set(x + (k % 2 ? 0.05 : -0.05), 4.55 - (comp * (k + 1)) / 5, z);
          g.add(f);
        }
      }
      for (const x of [-3.5, 3.5]) for (const z of [-3, 3]) {
        cil(g, 0.01, 0.01, 0.8, std({ color: 0x111111 }), x, 3.9, z, 4);
        movel(g, 'wooden_lantern_01', x, z, { alt: 0.4, y: 3.5 });
      }
    },
  }),
  // loja de laboratório do torneio: bancadas com a loja falsa nas telas e a autorização colada na parede
  lojalab: () => salaTematica({
    modelo: 'lojalab', W: 13, D: 14, H: 4.4, parede: pbr('reboco', [3, 1.5], { color: 0xdfe6e0 }), piso: pbr('concreto', [4, 4], { color: 0x9aa09a }),
    lousa: 'Empório Fictício da Serra', carteiras: { fileiras: 3, colunas: 4, laptop: false }, luz: 0xf0f4ff, porta: 'Sair da loja de laboratório',
    deco: (g, _o, atualiza, { W, D }) => {
      for (let f = 0; f < 3; f++) for (let c = 0; c < 4; c++) monitor(g, (c - 1.5) * 2.2, 0.76, -D / 2 + 3.4 + f * 2.3 - 0.15, 0, telaFalsa('slide', 'PÃO DE QUEIJO R$ 0,00', f * 4 + c));
      const termo = T.placa('AUTORIZADO PARA TESTE · ESCOPO: SÓ ESTA LOJA', '#f4f1ea', '#1a1a2e', 1024, 128);
      plano(g, 5, 0.62, std({ map: termo, roughness: 0.9 }), -W / 2 + 0.06, 2.9, 0, 0, Math.PI / 2).castShadow = false;
      const aviso = std({ color: 0x000000, emissive: 0xffffff, emissiveMap: telaFalsa('alerta', 'LABORATÓRIO'), emissiveIntensity: 0.8 });
      plano(g, 1.8, 1.1, aviso, W / 2 - 0.06, 2.6, -2, 0, -Math.PI / 2).castShadow = false;
      atualiza.push((t) => (aviso.emissiveIntensity = 0.6 + Math.sin(t * 2) * 0.2));
    },
  }),
  // alojamento das escolas visitantes: redes, beliches e a cuia na janela
  alojamento: () => salaTematica({
    modelo: 'alojamento', W: 10, D: 11, H: 4, parede: pbr('pedra', [3, 2]), piso: pbr('assoalho', [3, 3]),
    luz: 0xffd6a0, porta: 'Sair do alojamento',
    deco: (g, obst, atualiza, { W, D }) => {
      const cores = [0xc0392b, 0xf2c45a, 0x2e7dd1, 0x2e8b57];
      const redes: THREE.Mesh[] = [];
      for (let i = 0; i < 3; i++) {
        const z = -3.5 + i * 2.6;
        const rede = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 2.4, 16, 1, true, Math.PI, Math.PI), std({ color: cores[i], roughness: 1, side: THREE.DoubleSide }));
        rede.rotation.z = Math.PI / 2;
        rede.position.set(-W / 2 + 1.5, 1.3, z);
        g.add(rede);
        redes.push(rede);
        for (const s of [-1, 1]) cil(g, 0.02, 0.02, 1.2, std({ color: 0xd8c8a8 }), -W / 2 + 1.5 + s * 1.3, 1.3, z, 6);
        obst.push([-W / 2, -W / 2 + 2.8, z - 0.7, z + 0.7]);
      }
      atualiza.push((t) => redes.forEach((r, i) => (r.rotation.x = Math.sin(t * 0.8 + i) * 0.08)));
      for (const z of [-3.2, 0.6]) {
        movel(g, 'GothicBed_01', W / 2 - 1.1, z, { larg: 2.1, ry: -Math.PI / 2 });
        obst.push([W / 2 - 2.2, W / 2, z - 0.7, z + 0.7]);
      }
      janela(g, 0, 2.2, -D / 2 + 0.02, 1.6, 1.8, 0, 0x9aa8c0);
      // cuia de chimarrão no peitoril
      cil(g, 0.07, 0.05, 0.12, std({ color: 0x8a5a2a, roughness: 0.7 }), 0.4, 1.3, -D / 2 + 0.15, 12);
      cil(g, 0.006, 0.006, 0.2, std({ color: 0xc0c0c0, metalness: 0.9 }), 0.43, 1.38, -D / 2 + 0.15, 6);
      caixa(g, 1.8, 0.06, 0.25, texMat(T.madeira([1, 1], '#5a3a22')), 0, 1.24, -D / 2 + 0.15);
      movel(g, 'Barrel_01', 2.6, 3.8, { alt: 0.7 });
      // tapete de chita, baús ao pé das camas e varal com bandeirinhas das escolas visitantes
      plano(g, 3, 2, std({ color: 0xe0503a, roughness: 1 }), 0.4, 0.012, 1.2, -Math.PI / 2).castShadow = false;
      for (let i = 0; i < 12; i++) {
        const flor = new THREE.Mesh(new THREE.CircleGeometry(0.16, 10), std({ color: [0xffd166, 0x2e7dd1, 0xffffff][i % 3], roughness: 1 }));
        flor.rotation.x = -Math.PI / 2;
        flor.position.set(-0.8 + (i % 4) * 0.8, 0.016, 0.6 + Math.floor(i / 4) * 0.6);
        g.add(flor);
      }
      for (const z of [-3.2, 0.6]) movel(g, 'treasure_chest', W / 2 - 2.6, z, { larg: 0.8, ry: -Math.PI / 2 });
      const cores2 = [0x7cc5db, 0xe0b45a, 0xc0392b, 0x2e8b57];
      for (let i = 0; i < 14; i++) {
        const bd = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.24, 3), std({ color: cores2[i % 4], roughness: 1, side: THREE.DoubleSide }));
        bd.rotation.x = Math.PI;
        bd.position.set(-W / 2 + 1 + i * ((W - 2) / 13), 3.2 - Math.sin((i / 13) * Math.PI) * 0.35, 3.5);
        g.add(bd);
      }
      movel(g, 'wooden_bookshelf_worn', -W / 2 + 0.45, 4, { alt: 1.9, ry: Math.PI / 2 });
      obst.push([-W / 2, -W / 2 + 0.8, 3.2, 4.8]);
    },
  }),
  // sala da arbitragem: o servidor do placar, três monitores, o livro de ocorrências e a cafeteira
  arbitragem: () => salaTematica({
    modelo: 'arbitragem', W: 8, D: 8, H: 3.4, parede: pbr('reboco', [3, 1.5], { color: 0xcfc8bc }), piso: pbr('assoalho', [3, 3]),
    lousa: 'Livro de Ocorrências', luz: 0xe8f0ff, porta: 'Voltar ao palco',
    deco: (g, obst, atualiza, { W, D }) => {
      caixa(g, 3.4, 0.76, 0.9, madeiraEscura(), 0, 0, -D / 2 + 1.4);
      obst.push([-1.8, 1.8, -D / 2 + 0.9, -D / 2 + 1.9]);
      (['graf', 'log', 'mapa'] as const).forEach((tp, i) => monitor(g, -1.1 + i * 1.1, 0.76, -D / 2 + 1.25, 0, telaFalsa(tp, '', i + 20), 0.5, 0.32));
      const rack = caixa(g, 0.7, 1.8, 0.7, std({ color: 0x1a1c20, metalness: 0.6, roughness: 0.4 }), W / 2 - 0.6, 0, -D / 2 + 0.6);
      void rack;
      obst.push([W / 2 - 1, W / 2, -D / 2, -D / 2 + 1]);
      const led = std({ color: 0x000000, emissive: 0x33ff55, emissiveIntensity: 2 });
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.01), led);
      p.position.set(W / 2 - 0.6, 1.4, -D / 2 + 0.96);
      g.add(p);
      atualiza.push((t) => (led.emissiveIntensity = Math.sin(t * 7) > 0 ? 2.4 : 0.2));
      // livro de ocorrências aberto e a cafeteira da Nanda
      caixa(g, 0.42, 0.04, 0.3, std({ color: 0xf2eee2 }), 1.2, 0.76, -D / 2 + 1.6);
      caixa(g, 0.2, 0.3, 0.2, std({ color: 0x1c1c1c, metalness: 0.4 }), -1.5, 0.76, -D / 2 + 1.1);
    },
  }),
  // frigorífico abandonado que o Nulo virou data center: ganchos no teto, cortina de tiras e racks no lugar das carnes
  frigorifico: () => salaTematica({
    modelo: 'frigorifico', estilo: 'industrial', W: 12, D: 16, H: 4.2, parede: pbr('concreto', [4, 2], { color: 0xb8c8d8 }), piso: pbr('concreto', [4, 6], { color: 0x8a96a2 }),
    luz: 0xbfe0ff, ceu: 0x0a1018, neblina: 0.05, porta: 'Sair do frigorífico',
    deco: (g, obst, atualiza, { W, D, H }) => {
      const aco = std({ color: 0x9aa4ae, metalness: 0.8, roughness: 0.35 });
      for (const x of [-3, 3]) caixa(g, 0.1, 0.1, D - 2, aco, x, H - 0.4, 0);
      for (const x of [-3, 3]) for (let z = -6; z <= 6; z += 1.5) {
        const gancho = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.012, 6, 12, Math.PI * 1.4), aco);
        gancho.position.set(x, H - 0.75, z);
        g.add(gancho);
        cil(g, 0.008, 0.008, 0.3, aco, x, H - 0.7, z, 4);
      }
      // racks clandestinos piscando onde ficavam as carnes
      const leds: THREE.MeshStandardMaterial[] = [];
      for (const x of [-W / 2 + 0.7, W / 2 - 0.7]) for (let z = -5; z <= 3; z += 2.6) {
        caixa(g, 0.9, 2, 0.9, std({ color: 0x15171c, metalness: 0.6, roughness: 0.4 }), x, 0, z);
        obst.push([x - 0.5, x + 0.5, z - 0.5, z + 0.5]);
        const l = std({ color: 0x000000, emissive: Math.random() < 0.3 ? 0xff3344 : 0x33ff66, emissiveIntensity: 2 });
        leds.push(l);
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.6, 0.5), l);
        p.position.set(x + (x < 0 ? 0.46 : -0.46), 1.2, z);
        g.add(p);
      }
      atualiza.push((t) => leds.forEach((l, i) => (l.emissiveIntensity = Math.sin(t * (4 + i)) > 0 ? 2.2 : 0.3)));
      // cortina de tiras de PVC na porta e gelo nas paredes
      for (let i = 0; i < 9; i++) plano(g, 0.22, 2.4, std({ color: 0xd8f0ff, transparent: true, opacity: 0.35, roughness: 0.1, side: THREE.DoubleSide }), -0.9 + i * 0.23, 1.2, D / 2 - 1.1).castShadow = false;
      const cadeado = caixa(g, 0.14, 0.18, 0.06, std({ color: 0xd4b030, metalness: 0.9, roughness: 0.3 }), 1.3, 1.1, D / 2 - 1.05);
      void cadeado;
    },
  }),
  // sala do coletor central: o servidor Fofoqueiro e as telas de log
  coletor: () => salaTematica({
    modelo: 'coletor', estilo: 'industrial', W: 9, D: 9, H: 3.6, parede: pbr('concreto', [3, 1.5], { color: 0x7a8088 }), piso: pbr('concreto', [3, 3], { color: 0x5a5f66 }),
    lousa: 'O Fofoqueiro', luz: 0xd0e8ff, ceu: 0x05070c, porta: 'Voltar ao data center',
    deco: (g, obst, atualiza, { W, D }) => {
      const RX = 2.9;
      const RZ = -3.3;
      caixa(g, 1, 2.2, 1, std({ color: 0x1a1c20, metalness: 0.6, roughness: 0.4 }), RX, 0, RZ);
      obst.push([RX - 0.6, RX + 0.6, RZ - 0.6, RZ + 0.6]);
      const leds: THREE.MeshStandardMaterial[] = [];
      for (let i = 0; i < 18; i++) {
        const l = std({ color: 0x000000, emissive: i % 4 ? 0x33ff55 : 0xffaa22, emissiveIntensity: 2 });
        leds.push(l);
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.01), l);
        p.position.set(RX - 0.35 + (i % 6) * 0.14, 0.4 + Math.floor(i / 6) * 0.55, RZ + 0.51);
        g.add(p);
      }
      atualiza.push((t) => leds.forEach((l, i) => (l.emissiveIntensity = Math.sin(t * (5 + i) + i) > 0.3 ? 2.4 : 0.1)));
      for (const lado of [-1, 1]) for (let i = 0; i < 2; i++) monitor(g, lado * (W / 2 - 0.5), 0.9, -2 + i * 1.6, lado < 0 ? Math.PI / 2 : -Math.PI / 2, telaFalsa('log', '', i + (lado > 0 ? 5 : 0)), 0.9, 0.55);
      for (const lado of [-1, 1]) caixa(g, 0.8, 0.9, 3.6, madeiraEscura(), lado * (W / 2 - 0.45), 0, -1.2);
      const tex = T.placa('FOFOQUEIRO · syslog', '#0b0a0e', '#6ef2ff', 512, 96);
      plano(g, 0.9, 0.17, std({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.6 }), RX, 2.0, RZ + 0.52).castShadow = false;
      void D;
    },
  }),
};

/** arquivo morto: estantes de aço com caixas, gaiolas antigas, fitas de backup ou discos de memória */
function arquivo(tipo: 'logs' | 'gaiolas' | 'fitas' | 'dumps' | 'backup'): Area {
  const frio = tipo === 'dumps' || tipo === 'backup';
  return salaTematica({
    modelo: 'arquivo_' + tipo, W: 12, D: 14, H: 4, parede: frio ? pbr('concreto', [3, 1.5], { color: 0xa0b0c0 }) : pbr('pedra', [4, 2]), piso: pbr('concreto', [3, 3], { color: 0x8a8a88 }),
    lousa: tipo === 'dumps' ? 'Galeria dos Dumps' : tipo === 'backup' ? 'Cofre de Backup' : undefined, luz: frio ? 0xb8d8ff : 0xffc070, ceu: 0x050508, neblina: frio ? 0.02 : 0.035,
    porta: tipo === 'fitas' || tipo === 'backup' ? 'Sair do cofre' : 'Subir a escada',
    deco: (g, obst) => {
      const papelao = std({ color: 0xb08a5a, roughness: 1 });
      const r = rnd(tipo.length * 7);
      for (const x of [-3.6, -1.2, 1.2, 3.6]) {
        for (const z of [-3, 1.2]) {
          movel(g, 'steel_frame_shelves_01', x, z, { alt: 2.2 });
          obst.push([x - 0.6, x + 0.6, z - 1.6, z + 1.6]);
          for (let n = 0; n < 4; n++) for (let k = 0; k < 3; k++) {
            const y = 0.12 + n * 0.55;
            const zz = z - 0.9 + k * 0.9;
            if (tipo === 'logs') caixa(g, 0.5, 0.32, 0.42, papelao, x, y, zz, (r() - 0.5) * 0.2);
            else if (tipo === 'fitas' || tipo === 'backup') for (let f = 0; f < 3; f++) cil(g, 0.13, 0.13, 0.04, std({ color: f % 2 ? 0x1a1a1a : 0x3a2a1a, roughness: 0.4 }), x - 0.15 + f * 0.15, y + 0.12, zz, 16).rotation.z = Math.PI / 2;
            else if (tipo === 'dumps') {
              caixa(g, 0.38, 0.06, 0.28, std({ color: 0x9aa0a8, metalness: 0.8, roughness: 0.3 }), x, y, zz);
              plano(g, 0.16, 0.05, std({ color: 0xf2eee2 }), x, y + 0.03, zz + 0.142).castShadow = false;
            } else {
              const gaiola = std({ color: 0x5a5a5a, metalness: 0.7, roughness: 0.5, wireframe: true });
              caixa(g, 0.45, 0.4, 0.45, gaiola, x, y, zz).castShadow = false;
            }
          }
        }
      }
      if (tipo === 'backup') {
        // porta redonda de caixa-forte, com as duas fechaduras (uma chave do Seu Zé, outra da Diretora)
        const aco = std({ color: 0x8a9098, metalness: 0.9, roughness: 0.3 });
        const portaCofre = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.25, 40), aco);
        portaCofre.rotation.z = Math.PI / 2;
        portaCofre.position.set(-5.85, 1.5, -3);
        g.add(portaCofre);
        const volante = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.05, 8, 24), std({ color: 0xc8a050, metalness: 0.9, roughness: 0.3 }));
        volante.rotation.y = Math.PI / 2;
        volante.position.set(-5.7, 1.5, -3);
        g.add(volante);
        for (const dz of [-0.7, 0.7]) caixa(g, 0.06, 0.16, 0.1, std({ color: 0x1a1a1a }), -5.72, 2.2, -3 + dz);
      }
      if (tipo === 'fitas') {
        // a geladeira desligada onde o Seu Zé guarda as fitas mais importantes
        caixa(g, 0.8, 1.8, 0.75, std({ color: 0xe8e4dc, roughness: 0.4 }), -5.3, 0, -5.8);
        caixa(g, 0.05, 0.5, 0.05, std({ color: 0xaaaaaa, metalness: 0.8 }), -4.95, 1.1, -5.4);
      }
    },
  });
}

/** arena das bandeiras: salão das três escolas, com palco, telão e arquibancadas */
function arena(): Area {
  const a = salaTematica({
    modelo: 'arena', W: 20, D: 22, H: 8, parede: pbr('tijolo', [6, 3]), piso: pbr('assoalho', [5, 5]),
    lousa: 'Competição Ética', carteiras: { fileiras: 2, colunas: 4, z0: -3 }, luz: 0xffe8c8, porta: 'Sair da arena',
    deco: (g, obst, atualiza, { W, D }) => {
      caixa(g, 10, 0.5, 3, madeiraEscura(), 0, 0, -D / 2 + 2.6);
      obst.push([-5, 5, -D / 2 + 1.1, -D / 2 + 4.1]);
      // as bandeiras das três escolas penduradas no alto
      const escolas: [string, string, string][] = [['PARANAPIACABA', '#2a1a4a', '#f2c45a'], ['PAMPA DIGITAL', '#19465c', '#7cc5db'], ['ACADEMIA DO SERTÃO', '#4a2a10', '#e0b45a']];
      const panos: THREE.Mesh[] = [];
      escolas.forEach(([nome, fundo, cor], i) => {
        const cv = document.createElement('canvas');
        cv.width = 256;
        cv.height = 640;
        const c = cv.getContext('2d')!;
        c.fillStyle = fundo;
        c.fillRect(0, 0, 256, 640);
        c.strokeStyle = cor;
        c.lineWidth = 10;
        c.strokeRect(14, 14, 228, 612);
        c.fillStyle = cor;
        c.font = 'bold 30px serif';
        c.textAlign = 'center';
        nome.split(' ').forEach((p, k) => c.fillText(p, 128, 260 + k * 42));
        c.beginPath();
        c.arc(128, 150, 54, 0, Math.PI * 2);
        c.fill();
        const tex = new THREE.CanvasTexture(cv);
        tex.colorSpace = THREE.SRGBColorSpace;
        const pano = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 5.5, 1, 12), std({ map: tex, side: THREE.DoubleSide, roughness: 0.9 }));
        pano.position.set(-6 + i * 6, 5, -D / 2 + 0.3);
        g.add(pano);
        panos.push(pano);
      });
      atualiza.push((t) => panos.forEach((p, i) => (p.rotation.y = Math.sin(t * 0.8 + i) * 0.05)));
      // arquibancadas laterais com lugares para a plateia
      for (const lado of [-1, 1]) for (let degrau = 0; degrau < 3; degrau++) {
        const x = lado * (W / 2 - 1 - degrau * 0.9);
        caixa(g, 0.9, 0.45 + degrau * 0.45, 12, madeiraEscura(), x, 0, 2);
        obst.push([x - 0.45, x + 0.45, -4, 8]);
      }
      for (const lado of [-1, 1]) caixa(g, 0.1, 1, 6, std({ color: 0x000000, emissive: 0xffffff, emissiveMap: telaFalsa('graf', '', lado + 3), emissiveIntensity: 0.8 }), lado * (W / 2 - 0.05), 4, -4);
    },
  });
  // a plateia senta no degrau de baixo de cada arquibancada
  a.assentos = [...(a.assentos ?? []), ...[-1, 1].flatMap((lado) => [-2, 0, 2, 4, 6].map((z) => ({ x: lado * (20 / 2 - 1), z, ry: lado < 0 ? Math.PI / 2 : -Math.PI / 2, y: 0 })))];
  return a;
}

/** rotunda das locomotivas: galpão redondo com plataforma giratória e locomotivas em raios */
function rotunda(): Area {
  const g = new THREE.Group();
  const R = 13;
  const parede = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 7, 40, 1, true), (() => { const m = pbr('tijolo', [10, 2]); m.side = THREE.BackSide; return m; })());
  parede.position.y = 3.5;
  g.add(parede);
  const chao = new THREE.Mesh(new THREE.CircleGeometry(R, 40), pbr('concreto', [6, 6], { color: 0x8a847c }));
  chao.rotation.x = -Math.PI / 2;
  chao.receiveShadow = true;
  g.add(chao);
  const teto = new THREE.Mesh(new THREE.ConeGeometry(R + 0.3, 3.5, 40, 1, true), (() => { const m = std({ color: 0x3a2a1e, roughness: 1 }); m.side = THREE.BackSide; return m; })());
  teto.position.y = 7 + 1.75;
  g.add(teto);
  // plataforma giratória no centro
  const giro = new THREE.Group();
  g.add(giro);
  cil(g, 3.2, 3.2, 0.05, metalEscuro(), 0, 0, 0, 40);
  caixa(giro, 1.6, 0.25, 6.2, texMat(T.tabuado([1, 4])), 0, 0.05, 0);
  const trilho = std({ color: 0x6a6460, metalness: 0.9, roughness: 0.35 });
  for (const dx of [-0.72, 0.72]) caixa(giro, 0.07, 0.07, 6.2, trilho, dx, 0.3, 0);
  // locomotivas dormindo em raios
  const verde = std({ color: 0x2a4a3a, metalness: 0.5, roughness: 0.6 });
  const vermelho = std({ color: 0x6a2a1a, metalness: 0.5, roughness: 0.6 });
  const obst: Area['obstaculos'] = [];
  for (let i = 0; i < 7; i++) {
    const ang = Math.PI * 0.15 + (i * Math.PI * 1.7) / 7;
    const raio = new THREE.Group();
    raio.rotation.y = ang;
    g.add(raio);
    for (const dx of [-0.72, 0.72]) caixa(raio, 0.07, 0.07, 8, trilho, dx, 0, -(R - 4.6));
    if (i % 2 === 0) {
      const cor = i % 4 ? vermelho : verde;
      caixa(raio, 2.2, 0.9, 6, metalEscuro(), 0, 0.2, -(R - 4));
      const cald = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 4, 18), cor);
      cald.rotation.x = Math.PI / 2;
      cald.position.set(0, 1.9, -(R - 4) + 0.8);
      raio.add(cald);
      caixa(raio, 2.1, 2.2, 2, cor, 0, 1.1, -(R - 4) - 2);
      cil(raio, 0.28, 0.35, 0.9, std({ color: 0x1a1a1a }), 0, 2.7, -(R - 4) + 2.4, 12);
      const cx = -Math.sin(ang) * (R - 4);
      const cz = -Math.cos(ang) * (R - 4);
      obst.push([cx - 1.8, cx + 1.8, cz - 1.8, cz + 1.8]);
    }
  }
  luzPrincipal(g, 0, 6.6, 3, 0xffe2c0, 40, new THREE.Vector3(0, 0, -2));
  lampiao(g, 0, 5.5, 0, 6, 14, 0xffc98a);
  g.add(new THREE.HemisphereLight(0xd8d0c8, 0x3a3028, 1.1));
  return {
    modelo: 'rotunda', grupo: g, entrada: { x: 0, z: 6, yaw: 0 }, palco: [{ x: -1.4, z: 4 }, { x: 1.4, z: 3.9 }, { x: 0, z: 3.5 }, { x: 2.4, z: 4.6 }],
    professor: { x: 1.6, z: 3 },
    limites: [-8, 8, -8, 9], obstaculos: obst,
    portas: [{ x: 0, z: R - 1, rotulo: 'Sair da rotunda' }], ceu: 0x1a1612, neblina: 0.02,
    atualizar: (_dt, t) => (giro.rotation.y = t * 0.08),
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
    // o baú da sua cama é o malão: dali você enfeita o seu canto
    portas: [{ x: 0, z: D / 2 - 0.5, rotulo: 'Sair do dormitório' }, { x: -2.25, z: 1.95, rotulo: 'Abrir o malão', destino: 'acao:malao' }], ceu: 0x0e0b18, neblina: 0.02,
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
    assentos: Array.from({ length: 9 }, (_, i) => -6.5 + i * 1.6).flatMap((z) => [{ x: -1.05, z: z - 0.24, ry: Math.PI }, { x: 1.05, z: z - 0.24, ry: Math.PI }]),
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
  const r = rnd(31);
  // céu em degradê com nuvens (o céu chapado deixava o campo sem profundidade)
  const cvc = document.createElement('canvas');
  cvc.width = 16;
  cvc.height = 256;
  const cc = cvc.getContext('2d')!;
  const gr = cc.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#3f78c0');
  gr.addColorStop(0.45, '#8fb8e0');
  gr.addColorStop(0.5, '#d8e6f0');
  gr.addColorStop(1, '#d8e6f0');
  cc.fillStyle = gr;
  cc.fillRect(0, 0, 16, 256);
  const ceuTex = new THREE.CanvasTexture(cvc);
  ceuTex.colorSpace = THREE.SRGBColorSpace;
  g.add(new THREE.Mesh(new THREE.SphereGeometry(260, 24, 16), new THREE.MeshBasicMaterial({ map: ceuTex, side: THREE.BackSide, fog: false })));
  const nuvem = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false, transparent: true, opacity: 0.92 });
  const nuvens: THREE.Group[] = [];
  for (let i = 0; i < 9; i++) {
    const n = new THREE.Group();
    for (let k = 0; k < 5; k++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(6 + r() * 5, 10, 8), nuvem);
      b.position.set(k * 7 - 14, r() * 3, (r() - 0.5) * 6);
      b.scale.y = 0.45;
      n.add(b);
    }
    const ang = (i / 9) * Math.PI * 2;
    n.position.set(Math.cos(ang) * 150, 70 + r() * 30, Math.sin(ang) * 150);
    g.add(n);
    nuvens.push(n);
  }
  // serra e mata em volta
  const serra = std({ color: 0x4a6a5a, roughness: 1 });
  for (let i = 0; i < 16; i++) {
    const ang = (i / 16) * Math.PI * 2;
    const m = new THREE.Mesh(new THREE.ConeGeometry(26 + r() * 20, 30 + r() * 26, 6), serra);
    m.position.set(Math.cos(ang) * 175, 8, Math.sin(ang) * 175);
    g.add(m);
  }
  const tronco = std({ color: 0x3a2a1e, roughness: 1 });
  const folhas = [std({ color: 0x2c5a2a, roughness: 1 }), std({ color: 0x3a6e30, roughness: 1 }), std({ color: 0x24482a, roughness: 1 })];
  for (let i = 0; i < 110; i++) {
    const ang = r() * Math.PI * 2;
    const d = 46 + r() * 40;
    const x = Math.cos(ang) * d * 0.9, z = Math.sin(ang) * d * 1.1;
    const h = 5 + r() * 7;
    cil(g, 0.18, 0.28, h * 0.55, tronco, x, 0, z, 6);
    const copa = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8 + r() * 2, 1), folhas[i % 3]);
    copa.position.set(x, h * 0.55 + 1.4, z);
    g.add(copa);
  }
  // gramado com faixas de corte e linhas pintadas
  plano(g, 220, 220, pbr('grama', [70, 70], { color: 0x8fd06a }), 0, 0, 0, -Math.PI / 2);
  const faixa = std({ color: 0xc8f0a0, transparent: true, opacity: 0.13, roughness: 1, depthWrite: false });
  for (let z = -32; z < 32; z += 8) plano(g, 36, 4, faixa, 0, 0.006, z + 2, -Math.PI / 2).castShadow = false;
  const cal = std({ color: 0xf4f4ec, roughness: 0.9 });
  const linha = (w: number, d: number, x: number, z: number) => (plano(g, w, d, cal, x, 0.01, z, -Math.PI / 2).castShadow = false);
  linha(36, 0.14, 0, -34);
  linha(36, 0.14, 0, 34);
  linha(0.14, 68, -18, 0);
  linha(0.14, 68, 18, 0);
  linha(36, 0.14, 0, 0);
  const circulo = new THREE.Mesh(new THREE.RingGeometry(5.9, 6.05, 64), cal);
  circulo.rotation.x = -Math.PI / 2;
  circulo.position.y = 0.011;
  g.add(circulo);
  for (const z of [-30, 30]) {
    const area = new THREE.Mesh(new THREE.RingGeometry(8.9, 9.05, 48, 1, z < 0 ? Math.PI : 0, Math.PI), cal);
    area.rotation.x = -Math.PI / 2;
    area.position.set(0, 0.011, z);
    g.add(area);
  }
  // gols: portais hexagonais de neon no alto de torres de antena treliçadas, na cor de cada lado
  const ferro = std({ color: 0x8a8f96, metalness: 0.8, roughness: 0.35 });
  const piscas: THREE.MeshStandardMaterial[] = [];
  const portais: THREE.Mesh[] = [];
  for (const z of [-30, 30]) {
    const cor = z < 0 ? 0xff4fa0 : 0x3fd7ff;
    const neon = std({ color: cor, emissive: cor, emissiveIntensity: 4, toneMapped: false });
    for (const [x, h] of [[-4, 12], [0, 15], [4, 10]] as const) {
      // torre de três pernas com travessas em diagonal
      const pernas = [0, 1, 2].map((k) => (k / 3) * Math.PI * 2 + Math.PI / 6);
      for (const a of pernas) cil(g, 0.05, 0.08, h, ferro, x + Math.cos(a) * 0.35, 0, z + Math.sin(a) * 0.35, 6);
      for (let y = 1; y < h - 1.4; y += 1.4) {
        for (let k = 0; k < 3; k++) {
          const a0 = pernas[k], a1 = pernas[(k + 1) % 3];
          const p0 = new THREE.Vector3(x + Math.cos(a0) * 0.35, y, z + Math.sin(a0) * 0.35);
          const p1 = new THREE.Vector3(x + Math.cos(a1) * 0.35, y + 1.4, z + Math.sin(a1) * 0.35);
          const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, p0.distanceTo(p1), 4), ferro);
          tr.position.copy(p0).add(p1).multiplyScalar(0.5);
          tr.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p1.clone().sub(p0).normalize());
          g.add(tr);
        }
      }
      // portal de seis lados: moldura de ferro, miolo de neon e um véu de luz
      const moldura = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.12, 6, 6), ferro);
      moldura.position.set(x, h + 1.2, z);
      moldura.rotation.z = Math.PI / 6;
      g.add(moldura);
      const miolo = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.06, 6, 6), neon);
      miolo.position.set(x, h + 1.2, z);
      miolo.rotation.z = Math.PI / 6;
      g.add(miolo);
      portais.push(miolo);
      const veu = new THREE.Mesh(new THREE.CircleGeometry(1.05, 6), std({ color: cor, emissive: cor, emissiveIntensity: 1, transparent: true, opacity: 0.18, toneMapped: false, side: THREE.DoubleSide, depthWrite: false }));
      veu.position.set(x, h + 1.2, z);
      veu.rotation.z = Math.PI / 6;
      g.add(veu);
      // luz de aviação no topo
      cil(g, 0.03, 0.03, 0.9, ferro, x, h + 1.7, z, 4);
      const pisca = std({ color: 0x330000, emissive: 0xff2a2a, emissiveIntensity: 2 });
      const bola = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), pisca);
      bola.position.set(x, h + 2.6, z);
      g.add(bola);
      piscas.push(pisca);
    }
  }
  // arquibancadas: degraus de madeira com assentos nas cores das escolas, cobertura e bandeirolas
  const madeira = texMat(T.madeira([4, 1], '#5a3a20'));
  const corAssento = COR_CASA.map((c) => std({ color: c, roughness: 0.6 }));
  const bandeirolas: THREE.Mesh[] = [];
  for (const x of [-22, 22]) {
    const s = Math.sign(x);
    for (let k = 0; k < 6; k++) {
      caixa(g, 1.1, 0.5 + k * 0.6, 50, madeira, x + s * k * 1.1, 0, 0);
      for (let b = 0; b < 4; b++) caixa(g, 0.42, 0.08, 11.6, corAssento[(b + k) % 4], x + s * (k * 1.1 + 0.25), 0.5 + k * 0.6, -18.75 + b * 12.5).castShadow = false;
    }
    caixa(g, 0.3, 5.4, 50, madeira, x + s * 6.6, 0, 0);
    // cobertura apoiada em pilares
    for (let z = -24; z <= 24; z += 8) {
      cil(g, 0.12, 0.12, 8.6, ferro, x + s * 6.6, 0, z, 8);
      cil(g, 0.1, 0.1, 6.4, ferro, x - s * 0.4, 0, z, 8);
    }
    const telh = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.14, 51), std({ color: 0x8a2a2a, roughness: 0.7 }));
    telh.position.set(x + s * 3.1, 7.5, 0);
    telh.rotation.z = s * 0.29;
    telh.castShadow = true;
    g.add(telh);
    for (let z = -24; z <= 24; z += 6) {
      cil(g, 0.03, 0.03, 2, ferro, x + s * 6.6, 8.6, z, 4);
      const bd = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.6), std({ color: COR_CASA[Math.abs(Math.round(z / 6)) % 4], side: THREE.DoubleSide, roughness: 1 }));
      bd.position.set(x + s * 6.6, 10.2, z + 0.55);
      bd.rotation.y = Math.PI / 2;
      g.add(bd);
      bandeirolas.push(bd);
    }
  }
  // lugares na arquibancada para a torcida (degraus de baixo)
  const torcida: NonNullable<Area['assentos']> = [];
  for (const x of [-22, 22]) for (let k = 0; k < 3; k++) for (let z = -18; z <= 18; z += 4.5)
    torcida.push({ x: x + Math.sign(x) * k * 1.1, z: z + k * 1.3, ry: x < 0 ? Math.PI / 2 : -Math.PI / 2, y: 0.5 + k * 0.6 - 0.45 });
  // telão do placar atrás de um dos gols, com os estandartes das escolas ao lado
  for (const x of [-5.5, 5.5]) cil(g, 0.25, 0.3, 9.4, ferro, x, 0, -40, 8);
  caixa(g, 12, 2.8, 0.6, std({ color: 0x15161a, roughness: 0.5 }), 0, 9.4, -39.9);
  const placar = T.placa('CASTELO  2  ×  1  VISITANTES', '#0b0a0e', '#ffd166', 1024, 192);
  plano(g, 11.4, 2.2, std({ map: placar, emissive: 0xffffff, emissiveMap: placar, emissiveIntensity: 0.9 }), 0, 10.8, -39.58).castShadow = false;
  COR_CASA.forEach((c, i) => {
    const x = [-10, -8, 8, 10][i];
    cil(g, 0.05, 0.05, 9, ferro, x, 0, -38, 6);
    plano(g, 1.4, 4, std({ color: c, side: THREE.DoubleSide, roughness: 1 }), x + 0.75, 6.6, -38);
  });
  // torre do juiz no meio da lateral
  caixa(g, 1.6, 4, 1.6, madeira, -19.3, 0, 0);
  caixa(g, 2.2, 0.1, 2.2, madeira, -19.3, 4, 0);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) cil(g, 0.04, 0.04, 1.6, ferro, -19.3 + dx, 4, dz, 4);
  caixa(g, 2.3, 0.12, 2.3, std({ color: 0x8a2a2a }), -19.3, 5.6, 0);
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
    // a Bia, goleira, espera no campo para chamar para um amistoso
    gente: [{ id: 'bia', x: 1.2, z: 11.9, ry: -0.5 }],
    assentos: torcida,
    modelo: 'campo', grupo: g, entrada: { x: 0, z: 14, yaw: 0 }, palco: [{ x: -1.2, z: 11.6 }, { x: 1.2, z: 11.4 }, { x: 0, z: 11 }, { x: -2.4, z: 12.4 }],
    limites: [-18, 18, -34, 34], obstaculos: [[-20.2, -18.4, -0.9, 0.9]],
    portas: [{ x: 0, z: 33, rotulo: 'Voltar ao castelo' }], ceu: 0xd8e6f0, neblina: 0.006,
    atualizar: (_dt, t) => {
      flag.position.set(Math.sin(t * 1.3) * 8, 7 + Math.sin(t * 2.1) * 3, Math.cos(t * 0.9) * 12);
      piscas.forEach((p, i) => (p.emissiveIntensity = Math.sin(t * 3 + i * 0.5) > 0.6 ? 3 : 0.2));
      portais.forEach((p, i) => (p.rotation.z = Math.PI / 6 + Math.sin(t * 0.8 + i) * 0.05));
      bandeirolas.forEach((b, i) => (b.rotation.y = Math.PI / 2 + Math.sin(t * 2.2 + i) * 0.35));
      nuvens.forEach((n, i) => (n.rotation.y = t * 0.004 * (i % 2 ? 1 : -1)));
    },
  };
}

// ---------------------------------------------------------------- escolha do modelo por lugar

export function modeloDoLugar(l: Lugar | undefined): string {
  if (!l) return 'patio';
  const fixo: Record<string, string> = {
    a1_sala_persuasao: 'persuasao', a2_casa_maquinas: 'maquinas', a2_sala_comutacao: 'comutacao', a3_sala_rastros: 'rastros', a5_sala_sinergia: 'sinergia',
    a6_lab_reverso: 'reverso', a2_tuneis: 'tunel', a7_centro_crise: 'crise', a5_galpao: 'galpao', a5_cabine_sinais: 'cabine', a6_caixa_areia: 'sandbox',
    a7_oficina: 'oficina', a3_sala_coletor: 'coletor', a3_arquivo_morto: 'arquivo_logs', a6_arquivo_morto: 'arquivo_gaiolas', a3_cofre_fitas: 'arquivo_fitas',
    a6_galeria_dumps: 'arquivo_dumps', a4_loja_lab: 'lojalab', a4_alojamento: 'alojamento', a4_sala_arbitragem: 'arbitragem', a7_cofre_backup: 'arquivo_backup', a7_instalacao: 'frigorifico', a4_arena: 'arena', a5_rotunda: 'rotunda', viveiro: 'viveiro',
    vila: 'vila', vila_vagao: 'vagao', vila_doceria: 'loja_doceria', vila_teclados: 'loja_teclados', vila_livraria: 'loja_livraria', vila_correio: 'loja_correio', vila_pegadinhas: 'loja_pegadinhas',
    a1_clube_duelos: 'clube', sala_diretora: 'gabinete', a1_pombal: 'pombal', a2_torre_relogio: 'relogio', a1_galeria_formandos: 'galeria', refeitorio: 'salao', dormitorio: 'dormitorio', lab_terminal: 'aula', biblioteca: 'biblioteca', datacenter: 'datacenter',
    casa_vo: 'casa', estacao: 'trem', santa_ifigenia: 'cidade', cripta: 'masmorra', torre_redes: 'torre',
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
    case 'arena': return arena();
    case 'rotunda': return rotunda();
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
    default:
      if (TEMAS[modelo]) return TEMAS[modelo]();
      if (modelo.startsWith('arquivo_')) return arquivo(modelo.slice(8) as 'logs' | 'gaiolas' | 'fitas' | 'dumps' | 'backup');
      return sala('aula');
  }
}

export function aplicarAmbiente(a: Area) {
  M.cena.background = new THREE.Color(a.ceu);
  M.cena.fog = new THREE.FogExp2(a.ceu, a.neblina);
}
