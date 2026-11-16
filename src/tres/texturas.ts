// Texturas procedurais em canvas: tijolo inglês da vila, pedra, madeira, ladrilho, lousa.
// Cada textura vem com um mapa de relevo derivado dela (bumpMap), barato e convincente.
import * as THREE from 'three';

type Desenho = (g: CanvasRenderingContext2D, w: number, h: number, r: () => number) => void;
const cache = new Map<string, { map: THREE.Texture; bump: THREE.Texture }>();

function aleatorio(semente: number) {
  let s = semente >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function ruido(g: CanvasRenderingContext2D, w: number, h: number, r: () => number, forca: number, n = 9000) {
  for (let i = 0; i < n; i++) {
    const v = Math.floor(r() * 255);
    g.fillStyle = `rgba(${v},${v},${v},${forca})`;
    g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
}

function fazer(nome: string, lado: number, desenho: Desenho, repetir: [number, number] = [1, 1]) {
  const chave = `${nome}:${repetir.join('x')}`;
  const c = cache.get(chave);
  if (c) return c;
  const cv = document.createElement('canvas');
  cv.width = cv.height = lado;
  const g = cv.getContext('2d')!;
  desenho(g, lado, lado, aleatorio(nome.length * 7919 + lado));
  const map = new THREE.CanvasTexture(cv);
  map.colorSpace = THREE.SRGBColorSpace;
  // relevo: versão em tons de cinza do próprio desenho
  const cb = document.createElement('canvas');
  cb.width = cb.height = lado;
  const gb = cb.getContext('2d')!;
  gb.filter = 'grayscale(1) contrast(1.4)';
  gb.drawImage(cv, 0, 0);
  const bump = new THREE.CanvasTexture(cb);
  for (const t of [map, bump]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...repetir);
    t.anisotropy = 8;
  }
  const r = { map, bump };
  cache.set(chave, r);
  return r;
}

export const tijolo = (rep: [number, number] = [4, 2]) =>
  fazer('tijolo', 512, (g, w, h, r) => {
    g.fillStyle = '#5a3a2e';
    g.fillRect(0, 0, w, h);
    const lin = 16;
    const alt = h / lin;
    for (let y = 0; y < lin; y++) {
      const larg = w / 4;
      const desl = y % 2 ? larg / 2 : 0;
      for (let x = -1; x < 5; x++) {
        const base = [[138, 62, 42], [122, 52, 36], [150, 74, 50], [110, 48, 38], [128, 66, 48]][Math.floor(r() * 5)];
        const v = (r() - 0.5) * 24;
        g.fillStyle = `rgb(${base[0] + v},${base[1] + v * 0.6},${base[2] + v * 0.5})`;
        g.fillRect(x * larg + desl + 3, y * alt + 3, larg - 6, alt - 6);
      }
    }
    ruido(g, w, h, r, 0.12);
  }, rep);

export const pedra = (rep: [number, number] = [3, 3]) =>
  fazer('pedra', 512, (g, w, h, r) => {
    g.fillStyle = '#3c3a3f';
    g.fillRect(0, 0, w, h);
    const lin = 6;
    for (let y = 0; y < lin; y++) {
      let x = -r() * 60;
      while (x < w) {
        const lw = 60 + r() * 90;
        const c = 80 + r() * 40;
        g.fillStyle = `rgb(${c},${c - 4},${c + 6})`;
        g.fillRect(x + 3, y * (h / lin) + 3, lw - 6, h / lin - 6);
        x += lw;
      }
    }
    ruido(g, w, h, r, 0.18, 14000);
  }, rep);

export const paralelepipedo = (rep: [number, number] = [12, 12]) =>
  fazer('paralelepipedo', 256, (g, w, h, r) => {
    g.fillStyle = '#26262a';
    g.fillRect(0, 0, w, h);
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 8; x++) {
        const c = 70 + r() * 35;
        g.fillStyle = `rgb(${c},${c},${c + 4})`;
        g.beginPath();
        g.roundRect(x * 32 + 2 + (y % 2) * 16, y * 32 + 2, 28, 28, 6);
        g.fill();
      }
    ruido(g, w, h, r, 0.15, 3000);
  }, rep);

export const madeira = (rep: [number, number] = [2, 2], tom = '#6b4528') =>
  fazer('madeira' + tom, 512, (g, w, h, r) => {
    g.fillStyle = tom;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) {
      g.strokeStyle = `rgba(${r() > 0.5 ? '0,0,0' : '255,220,170'},${0.05 + r() * 0.08})`;
      g.lineWidth = 1 + r() * 3;
      const y = r() * h;
      g.beginPath();
      g.moveTo(0, y);
      for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 4 + (r() - 0.5) * 3);
      g.stroke();
    }
  }, rep);

export const tabuado = (rep: [number, number] = [6, 6]) =>
  fazer('tabuado', 512, (g, w, h, r) => {
    g.fillStyle = '#4a2f1c';
    g.fillRect(0, 0, w, h);
    const n = 8;
    for (let i = 0; i < n; i++) {
      const c = [92, 62, 38].map((v) => v + (r() - 0.5) * 30);
      g.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
      g.fillRect(0, i * (h / n) + 2, w, h / n - 4);
      for (let k = 0; k < 18; k++) {
        g.strokeStyle = `rgba(0,0,0,${0.05 + r() * 0.08})`;
        g.beginPath();
        const y = i * (h / n) + 4 + r() * (h / n - 8);
        g.moveTo(0, y);
        g.lineTo(w, y + (r() - 0.5) * 6);
        g.stroke();
      }
      g.fillStyle = '#2a1a10';
      g.fillRect(r() * w, i * (h / n), 3, h / n);
    }
  }, rep);

export const ladrilho = (rep: [number, number] = [8, 8]) =>
  fazer('ladrilho', 256, (g, w, h) => {
    // ladrilho hidráulico de casa de vó
    for (let y = 0; y < 2; y++)
      for (let x = 0; x < 2; x++) {
        const ox = x * 128;
        const oy = y * 128;
        g.fillStyle = '#e8dcc4';
        g.fillRect(ox, oy, 128, 128);
        g.fillStyle = '#2f6b6b';
        g.beginPath();
        g.moveTo(ox + 64, oy + 8);
        g.lineTo(ox + 120, oy + 64);
        g.lineTo(ox + 64, oy + 120);
        g.lineTo(ox + 8, oy + 64);
        g.fill();
        g.fillStyle = '#b5523b';
        g.beginPath();
        g.arc(ox + 64, oy + 64, 22, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = '#00000030';
        g.strokeRect(ox, oy, 128, 128);
      }
  }, rep);

export const telhado = (rep: [number, number] = [6, 3]) =>
  fazer('telhado', 256, (g, w, h, r) => {
    g.fillStyle = '#2a1d1a';
    g.fillRect(0, 0, w, h);
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 8; x++) {
        const c = 60 + r() * 30;
        g.fillStyle = `rgb(${c + 30},${c * 0.6},${c * 0.5})`;
        g.fillRect(x * 32 + (y % 2) * 16, y * 32, 30, 28);
      }
  }, rep);

export const grama = (rep: [number, number] = [20, 20]) =>
  fazer('grama', 256, (g, w, h, r) => {
    g.fillStyle = '#2e5a2a';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 5000; i++) {
      const c = r();
      g.strokeStyle = `rgb(${40 + c * 40},${80 + c * 60},${30 + c * 30})`;
      const x = r() * w;
      const y = r() * h;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + (r() - 0.5) * 3, y - 3 - r() * 4);
      g.stroke();
    }
  }, rep);

export const tecido = (cor: string, rep: [number, number] = [2, 2]) =>
  fazer('tecido' + cor, 128, (g, w, h, r) => {
    g.fillStyle = cor;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < w; i += 2) {
      g.fillStyle = `rgba(0,0,0,${0.04 + r() * 0.05})`;
      g.fillRect(i, 0, 1, h);
      g.fillRect(0, i, w, 1);
    }
  }, rep);

/** lousa escrita a giz: não fica no cache, cada aula escreve a sua */
export function lousa(titulo: string, linhas: string[]): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = 1024;
  cv.height = 512;
  const g = cv.getContext('2d')!;
  g.fillStyle = '#1f3a2c';
  g.fillRect(0, 0, 1024, 512);
  const r = aleatorio(titulo.length);
  for (let i = 0; i < 40; i++) {
    g.fillStyle = `rgba(255,255,255,${0.02 + r() * 0.03})`;
    g.beginPath();
    g.ellipse(r() * 1024, r() * 512, 80 + r() * 120, 20 + r() * 30, r() * 3, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = '#f2f0e6';
  g.font = 'bold 44px "Nunito", sans-serif';
  g.fillText(titulo.slice(0, 40), 40, 70);
  g.font = '30px "JetBrains Mono", monospace';
  let y = 130;
  for (const l of linhas) {
    const palavras = l.split(' ');
    let atual = '';
    for (const p of palavras) {
      if (g.measureText(atual + p).width > 940) {
        g.fillText(atual, 40, y);
        y += 40;
        atual = '';
      }
      atual += p + ' ';
      if (y > 480) break;
    }
    if (y <= 480) g.fillText(atual, 40, y);
    y += 52;
    if (y > 480) break;
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** placa com texto (letreiro, nome de sala) */
export function placa(texto: string, fundo = '#2a1a10', cor = '#f2c45a', larg = 512, alt = 128): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = larg;
  cv.height = alt;
  const g = cv.getContext('2d')!;
  g.fillStyle = fundo;
  g.fillRect(0, 0, larg, alt);
  g.strokeStyle = cor;
  g.lineWidth = 6;
  g.strokeRect(8, 8, larg - 16, alt - 16);
  g.fillStyle = cor;
  g.font = `bold ${Math.floor(alt * 0.36)}px "Cinzel", serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(texto, larg / 2, alt / 2, larg - 40);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
