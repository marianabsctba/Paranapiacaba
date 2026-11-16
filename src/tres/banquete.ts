// Banquete do refeitório: velas flutuando no teto e comida brasileira nas mesas.
// Tudo instanciado (uma malha por tipo) para pesar pouco no celular.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

function rnd(semente: number) {
  let s = semente >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
const e = new THREE.Euler();
const v = new THREE.Vector3();
const esc = new THREE.Vector3();

function instancias(geo: THREE.BufferGeometry, mat: THREE.Material, pontos: { x: number; y: number; z: number; s?: number; ry?: number; rx?: number }[]) {
  const im = new THREE.InstancedMesh(geo, mat, pontos.length);
  pontos.forEach((p, i) => {
    q.setFromEuler(e.set(p.rx ?? 0, p.ry ?? 0, 0));
    m4.compose(v.set(p.x, p.y, p.z), q, esc.setScalar(p.s ?? 1));
    im.setMatrixAt(i, m4);
  });
  im.castShadow = true;
  im.receiveShadow = true;
  return im;
}

/** brilho redondo que some nas bordas (sem o quadrado do plano aparecer) */
function brilhoRedondo(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.35, 'rgba(255,255,255,0.35)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/** velas flutuando entre yMin e yMax sobre a área [x0,x1]x[z0,z1]; devolve a animação */
export function velasFlutuantes(g: THREE.Object3D, x0: number, x1: number, z0: number, z1: number, yMin: number, yMax: number, n = 140) {
  const r = rnd(77);
  const base = Array.from({ length: n }, () => ({ x: x0 + r() * (x1 - x0), y: yMin + r() * (yMax - yMin), z: z0 + r() * (z1 - z0), f: r() * 6.28, s: 0.8 + r() * 0.5 }));
  const cera = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.04, 0.32, 10), new THREE.MeshStandardMaterial({ color: 0xf3ead8, roughness: 0.6, emissive: 0x3a2a10, emissiveIntensity: 0.3 }), n);
  const chama = new THREE.InstancedMesh(new THREE.ConeGeometry(0.022, 0.07, 8), new THREE.MeshBasicMaterial({ color: 0xffc46a }), n);
  const halo = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.28, 0.28), new THREE.MeshBasicMaterial({ map: brilhoRedondo(), color: 0xffb04a, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }), n);
  g.add(cera, chama, halo);
  // luz quente vinda das velas (poucas luzes, cobrindo o salão)
  for (let z = z0 + 3; z < z1; z += 8) {
    const l = new THREE.PointLight(0xffb066, 6, 14, 1.4);
    l.position.set((x0 + x1) / 2, yMin, z);
    g.add(l);
  }
  const cam = new THREE.Vector3();
  const olhar = new THREE.Matrix4();
  return (_dt: number, t: number, camera?: THREE.Camera) => {
    if (camera) camera.getWorldPosition(cam);
    base.forEach((b, i) => {
      const y = b.y + Math.sin(t * 0.7 + b.f) * 0.08;
      m4.compose(v.set(b.x, y, b.z), q.identity(), esc.setScalar(b.s));
      cera.setMatrixAt(i, m4);
      const tremor = 1 + Math.sin(t * 13 + b.f * 3) * 0.12;
      m4.compose(v.set(b.x, y + 0.2 * b.s, b.z), q.identity(), esc.set(b.s, b.s * tremor, b.s));
      chama.setMatrixAt(i, m4);
      // o halo sempre de frente para a câmera
      q.setFromRotationMatrix(olhar.lookAt(cam, v.set(b.x, y + 0.2 * b.s, b.z), THREE.Object3D.DEFAULT_UP));
      m4.compose(v, q, esc.setScalar(b.s * tremor));
      halo.setMatrixAt(i, m4);
    });
    cera.instanceMatrix.needsUpdate = true;
    chama.instanceMatrix.needsUpdate = true;
    halo.instanceMatrix.needsUpdate = true;
  };
}

/**
 * Comida em mesas compridas. mesas = lista de mesas (centro x, z inicial, z final, altura do tampo).
 * As mesas correm ao longo do eixo z.
 */
export function comida(g: THREE.Object3D, mesas: { x: number; z0: number; z1: number; y: number }[]) {
  const r = rnd(31);
  const pratos: { x: number; y: number; z: number }[] = [];
  const copos: { x: number; y: number; z: number }[] = [];
  const paes: { x: number; y: number; z: number; s: number }[] = [];
  const coxinhas: { x: number; y: number; z: number; ry: number; rx: number }[] = [];
  const brigadeiros: { x: number; y: number; z: number }[] = [];
  const travessas: { x: number; y: number; z: number }[] = [];
  const bolos: { x: number; y: number; z: number }[] = [];
  const panelas: { x: number; y: number; z: number }[] = [];
  const jarras: { x: number; y: number; z: number }[] = [];
  for (const m of mesas) {
    for (let z = m.z0 + 0.3; z < m.z1 - 0.2; z += 0.62) {
      for (const lado of [-1, 1]) {
        pratos.push({ x: m.x + lado * 0.32, y: m.y + 0.01, z });
        copos.push({ x: m.x + lado * 0.22, y: m.y, z: z + 0.2 });
      }
    }
    // no meio da mesa, travessas que se alternam
    let k = 0;
    for (let z = m.z0 + 0.6; z < m.z1 - 0.4; z += 1.1, k++) {
      const tipo = k % 5;
      travessas.push({ x: m.x, y: m.y + 0.01, z });
      if (tipo === 0) for (let i = 0; i < 9; i++) paes.push({ x: m.x + (r() - 0.5) * 0.24, y: m.y + 0.05 + (i > 5 ? 0.04 : 0), z: z + (r() - 0.5) * 0.24, s: 0.9 + r() * 0.25 });
      if (tipo === 1) for (let i = 0; i < 7; i++) coxinhas.push({ x: m.x + (r() - 0.5) * 0.22, y: m.y + 0.06, z: z + (r() - 0.5) * 0.22, ry: r() * 6, rx: (r() - 0.5) * 0.15 });
      if (tipo === 2) for (let i = 0; i < 12; i++) brigadeiros.push({ x: m.x + (r() - 0.5) * 0.24, y: m.y + 0.035, z: z + (r() - 0.5) * 0.24 });
      if (tipo === 3) bolos.push({ x: m.x, y: m.y + 0.02, z });
      if (tipo === 4) panelas.push({ x: m.x, y: m.y + 0.02, z });
      if (k % 2 === 0) jarras.push({ x: m.x + 0.12, y: m.y, z: z + 0.5 });
    }
  }
  const louca = new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.25 });
  const pratoGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.018, 24);
  const travGeo = new THREE.CylinderGeometry(0.2, 0.18, 0.03, 28);
  g.add(
    instancias(pratoGeo, louca, pratos),
    instancias(travGeo, new THREE.MeshStandardMaterial({ color: 0xc9c2b4, roughness: 0.3, metalness: 0.3 }), travessas),
    instancias(new THREE.CylinderGeometry(0.035, 0.03, 0.11, 14).translate(0, 0.055, 0), new THREE.MeshStandardMaterial({ color: 0xcfd8e0, roughness: 0.05, transparent: true, opacity: 0.55 }), copos),
    // pão de queijo: bolinha dourada achatada
    instancias(new THREE.SphereGeometry(0.035, 12, 10).scale(1, 0.8, 1), new THREE.MeshStandardMaterial({ color: 0xe0b45a, roughness: 0.85 }), paes),
    // coxinha: gota dourada
    instancias(mergeGeometries([new THREE.ConeGeometry(0.03, 0.08, 12, 1, true).translate(0, 0.05, 0), new THREE.SphereGeometry(0.034, 12, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2).translate(0, 0.01, 0)]), new THREE.MeshStandardMaterial({ color: 0xc98a3a, roughness: 0.9 }), coxinhas),
    // brigadeiro: bolinha escura com granulado (aspereza alta)
    instancias(new THREE.SphereGeometry(0.018, 10, 8), new THREE.MeshStandardMaterial({ color: 0x3a2214, roughness: 0.95 }), brigadeiros),
    // bolo de fubá
    instancias(new THREE.CylinderGeometry(0.13, 0.13, 0.09, 24).translate(0, 0.045, 0), new THREE.MeshStandardMaterial({ color: 0xe8c66a, roughness: 0.9 }), bolos),
    // panela de feijão
    instancias(new THREE.CylinderGeometry(0.16, 0.14, 0.08, 24).translate(0, 0.04, 0), new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 0.75, metalness: 0 }), panelas),
    instancias(new THREE.CircleGeometry(0.15, 24).rotateX(-Math.PI / 2).translate(0, 0.075, 0), new THREE.MeshStandardMaterial({ color: 0x3a1f16, roughness: 0.7 }), panelas),
    // jarra de suco de laranja
    instancias(new THREE.CylinderGeometry(0.06, 0.07, 0.22, 16).translate(0, 0.11, 0), new THREE.MeshStandardMaterial({ color: 0xff9a2a, roughness: 0.15, transparent: true, opacity: 0.85 }), jarras),
  );
}
