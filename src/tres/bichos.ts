// Bichos do castelo feitos no código, com anatomia e animação própria:
// Bitu (gato preto), Pomba Edite, o Capacete Classificador, o Siri da Caixa de Areia e criaturas genéricas.
import * as THREE from 'three';
import { PERSONAGENS } from '../conteudo/index';

export interface Bicho {
  grupo: THREE.Group;
  altura: number;
  animar: (t: number, falando: boolean) => void;
}

const mat = (cor: number, o: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color: cor, roughness: 0.75, ...o });

function malha(pai: THREE.Object3D, geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) {
  const me = new THREE.Mesh(geo, m);
  me.position.set(x, y, z);
  me.castShadow = true;
  me.receiveShadow = true;
  pai.add(me);
  return me;
}

/** cápsula alongada no eixo z */
const capsula = (r: number, comp: number, seg = 16) => new THREE.CapsuleGeometry(r, comp, 8, seg).rotateX(Math.PI / 2);

function gato(): Bicho {
  const g = new THREE.Group();
  const pelo = mat(0x141416, { roughness: 0.55, sheen: 1 } as THREE.MeshStandardMaterialParameters);
  const rosa = mat(0xd98a9a, { roughness: 0.6 });
  const corpo = new THREE.Group();
  g.add(corpo);
  const tronco = malha(corpo, capsula(0.11, 0.26), pelo, 0, 0.24, 0);
  tronco.scale.set(1, 0.95, 1);
  malha(corpo, new THREE.SphereGeometry(0.115, 20, 14), pelo, 0, 0.22, -0.13).scale.set(1.05, 1, 1.1);
  // patas
  for (const [x, z] of [[-0.06, 0.13], [0.06, 0.13], [-0.065, -0.14], [0.065, -0.14]]) {
    malha(corpo, new THREE.CapsuleGeometry(0.028, 0.14, 4, 8), pelo, x, 0.09, z);
    malha(corpo, new THREE.SphereGeometry(0.032, 10, 8), pelo, x, 0.02, z + 0.012).scale.set(1, 0.6, 1.3);
  }
  // cabeça
  const cabeca = new THREE.Group();
  cabeca.position.set(0, 0.36, 0.2);
  corpo.add(cabeca);
  malha(cabeca, new THREE.SphereGeometry(0.085, 24, 18), pelo).scale.set(1.12, 0.95, 1);
  malha(cabeca, new THREE.SphereGeometry(0.045, 16, 12), pelo, 0, -0.025, 0.06).scale.set(1.3, 0.8, 1);
  for (const lado of [-1, 1]) {
    const orelha = malha(cabeca, new THREE.ConeGeometry(0.036, 0.075, 4), pelo, lado * 0.052, 0.085, -0.005);
    orelha.rotation.set(-0.1, Math.PI / 4, lado * -0.25);
    const dentro = malha(cabeca, new THREE.ConeGeometry(0.022, 0.05, 4), rosa, lado * 0.05, 0.08, 0.012);
    dentro.rotation.set(-0.1, Math.PI / 4, lado * -0.25);
    const olho = malha(cabeca, new THREE.SphereGeometry(0.018, 14, 10), mat(0xe8d44d, { emissive: 0x6a5a00, emissiveIntensity: 0.6, roughness: 0.15 }), lado * 0.034, 0.012, 0.072);
    olho.scale.set(1, 1.15, 0.6);
    malha(cabeca, new THREE.BoxGeometry(0.005, 0.026, 0.004), mat(0x050505), lado * 0.034, 0.012, 0.083);
    for (const k of [-1, 0, 1]) {
      const bigode = malha(cabeca, new THREE.CylinderGeometry(0.0012, 0.0012, 0.09, 3), mat(0xdddddd), lado * 0.07, -0.03 + k * 0.008, 0.075);
      bigode.rotation.z = Math.PI / 2 + k * 0.12 * lado;
    }
  }
  malha(cabeca, new THREE.SphereGeometry(0.009, 8, 6), rosa, 0, -0.012, 0.098);
  // rabo em curva
  const curva = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.26, -0.24), new THREE.Vector3(0, 0.34, -0.36), new THREE.Vector3(0.04, 0.5, -0.4), new THREE.Vector3(0.08, 0.58, -0.32)]);
  const rabo = malha(corpo, new THREE.TubeGeometry(curva, 20, 0.02, 8), pelo);
  rabo.geometry.translate(0, -0.26, 0.24);
  rabo.position.set(0, 0.26, -0.24);
  return {
    grupo: g,
    altura: 0.45,
    animar: (t) => {
      tronco.scale.y = 0.95 + Math.sin(t * 2.2) * 0.02;
      rabo.rotation.z = Math.sin(t * 1.3) * 0.35;
      rabo.rotation.x = Math.sin(t * 0.9) * 0.12;
      cabeca.rotation.y = Math.sin(t * 0.4) * 0.35;
      cabeca.rotation.x = Math.sin(t * 0.7) * 0.06;
    },
  };
}

function pomba(): Bicho {
  const g = new THREE.Group();
  const cinza = mat(0x8c919c, { roughness: 0.8 });
  const escuro = mat(0x55596a, { roughness: 0.8 });
  const pescocoMat = new THREE.MeshStandardMaterial({ color: 0x4a7a6a, roughness: 0.35, metalness: 0.4, emissive: 0x2a1a3a, emissiveIntensity: 0.35 });
  // poleiro
  malha(g, new THREE.CylinderGeometry(0.02, 0.025, 1.0, 8), mat(0x5d3a1a), 0, 0.5, 0);
  malha(g, new THREE.CylinderGeometry(0.018, 0.018, 0.3, 8).rotateZ(Math.PI / 2), mat(0x5d3a1a), 0, 1.0, 0);
  const ave = new THREE.Group();
  ave.position.set(0, 1.03, 0);
  g.add(ave);
  const corpo = malha(ave, new THREE.SphereGeometry(0.075, 20, 16), cinza, 0, 0.07, 0);
  corpo.scale.set(0.95, 0.9, 1.35);
  // asas com as duas faixas escuras
  for (const lado of [-1, 1]) {
    const asa = malha(ave, new THREE.SphereGeometry(0.06, 16, 10), escuro, lado * 0.05, 0.08, -0.02);
    asa.scale.set(0.35, 0.75, 1.5);
    for (const f of [0, 1]) malha(ave, new THREE.BoxGeometry(0.006, 0.012, 0.05), mat(0x222222), lado * 0.071, 0.065 + f * 0.022, -0.02);
  }
  const rabo = malha(ave, new THREE.BoxGeometry(0.07, 0.012, 0.09), escuro, 0, 0.06, -0.13);
  rabo.rotation.x = 0.25;
  const cabeca = new THREE.Group();
  cabeca.position.set(0, 0.15, 0.07);
  ave.add(cabeca);
  malha(cabeca, new THREE.CylinderGeometry(0.03, 0.045, 0.07, 14), pescocoMat, 0, -0.03, -0.01);
  malha(cabeca, new THREE.SphereGeometry(0.035, 16, 12), cinza, 0, 0.015, 0);
  const bico = malha(cabeca, new THREE.ConeGeometry(0.008, 0.03, 8), mat(0x2a2a2a), 0, 0.01, 0.045);
  bico.rotation.x = Math.PI / 2;
  malha(cabeca, new THREE.SphereGeometry(0.008, 8, 6), mat(0xf2f2f2), 0, 0.018, 0.033);
  for (const lado of [-1, 1]) malha(cabeca, new THREE.SphereGeometry(0.007, 8, 6), mat(0xd9541e, { emissive: 0x6a1a00, emissiveIntensity: 0.4 }), lado * 0.024, 0.02, 0.018);
  for (const lado of [-1, 1]) malha(ave, new THREE.CylinderGeometry(0.005, 0.005, 0.04, 6), mat(0xd77a8a), lado * 0.025, 0.0, 0.01);
  return {
    grupo: g,
    altura: 1.25,
    animar: (t, falando) => {
      // o vai e vem de cabeça de pombo
      cabeca.position.z = 0.07 + Math.max(0, Math.sin(t * (falando ? 7 : 3))) * 0.025;
      cabeca.rotation.y = Math.sin(t * 0.8) * 0.4;
      corpo.scale.y = 0.9 + Math.sin(t * 2) * 0.015;
    },
  };
}

function capacete(): Bicho {
  const g = new THREE.Group();
  const madeira = mat(0x6b4426, { roughness: 0.7 });
  // banquinho de três pés
  malha(g, new THREE.CylinderGeometry(0.22, 0.22, 0.05, 24), madeira, 0, 0.6, 0);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const pe = malha(g, new THREE.CylinderGeometry(0.02, 0.025, 0.62, 8), madeira, Math.cos(a) * 0.15, 0.3, Math.sin(a) * 0.15);
    pe.rotation.set(Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12);
  }
  const cap = new THREE.Group();
  cap.position.y = 0.625;
  g.add(cap);
  const amarelo = mat(0xf2c12e, { roughness: 0.35 });
  malha(cap, new THREE.SphereGeometry(0.17, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), amarelo).scale.set(1, 0.95, 1.15);
  malha(cap, new THREE.CylinderGeometry(0.235, 0.235, 0.018, 32), amarelo, 0, 0.005, 0.03).scale.set(1, 1, 1.12);
  malha(cap, new THREE.BoxGeometry(0.03, 0.02, 0.36), mat(0xd9a90e), 0, 0.155, 0);
  const tela = malha(cap, new THREE.BoxGeometry(0.16, 0.05, 0.02), mat(0x111111, { roughness: 0.2 }), 0, 0.06, 0.18);
  tela.rotation.x = -0.35;
  const olhos: THREE.Mesh[] = [];
  for (const lado of [-1, 1]) {
    const o = malha(cap, new THREE.SphereGeometry(0.012, 10, 8), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x7df9ff, emissiveIntensity: 3 }), lado * 0.035, 0.068, 0.192);
    olhos.push(o);
  }
  return {
    grupo: g,
    altura: 0.85,
    animar: (t, falando) => {
      const piscar = Math.sin(t * 0.9) > 0.97 ? 0.05 : 1;
      olhos.forEach((o) => {
        o.scale.y = piscar;
        (o.material as THREE.MeshStandardMaterial).emissiveIntensity = falando ? 2 + Math.abs(Math.sin(t * 14)) * 3 : 2.5;
      });
      cap.rotation.z = Math.sin(t * 0.6) * 0.03;
      cap.position.y = 0.625 + (falando ? Math.abs(Math.sin(t * 8)) * 0.008 : 0);
    },
  };
}

function siri(): Bicho {
  const g = new THREE.Group();
  const casca = mat(0xd2552a, { roughness: 0.5 });
  const corpo = malha(g, new THREE.SphereGeometry(0.16, 24, 14), casca, 0, 0.14, 0);
  corpo.scale.set(1.35, 0.5, 1);
  const pernas: THREE.Mesh[] = [];
  for (const lado of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const p = malha(g, new THREE.CylinderGeometry(0.012, 0.008, 0.2, 6), casca, lado * 0.2, 0.08, -0.06 + i * 0.06);
      p.rotation.z = lado * 1.0;
      pernas.push(p);
    }
    const garra = malha(g, new THREE.SphereGeometry(0.05, 14, 10), casca, lado * 0.2, 0.2, 0.16);
    garra.scale.set(1, 0.7, 1.4);
    malha(g, new THREE.CylinderGeometry(0.008, 0.008, 0.1, 6), casca, lado * 0.05, 0.22, 0.1);
    malha(g, new THREE.SphereGeometry(0.018, 10, 8), mat(0x111111, { roughness: 0.1 }), lado * 0.05, 0.28, 0.1);
  }
  return { grupo: g, altura: 0.35, animar: (t) => pernas.forEach((p, i) => (p.rotation.x = Math.sin(t * 6 + i) * 0.2)) };
}

function criatura(id: string): Bicho {
  const p = PERSONAGENS.get(id);
  const cor = new THREE.Color(p?.roupa ?? '#7a5cff').getHex();
  const g = new THREE.Group();
  const corpo = malha(g, new THREE.SphereGeometry(0.3, 32, 20), new THREE.MeshPhysicalMaterial({ color: cor, roughness: 0.2, transmission: 0.3, thickness: 0.5, emissive: cor, emissiveIntensity: 0.25 }), 0, 0.7, 0);
  for (const lado of [-1, 1]) {
    malha(corpo, new THREE.SphereGeometry(0.07, 14, 10), mat(0xffffff, { roughness: 0.1 }), lado * 0.11, 0.08, 0.24);
    malha(corpo, new THREE.SphereGeometry(0.035, 10, 8), mat(0x111111), lado * 0.11, 0.08, 0.3);
  }
  return {
    grupo: g,
    altura: 1.05,
    animar: (t) => {
      corpo.position.y = 0.7 + Math.sin(t * 1.6) * 0.06;
      corpo.scale.set(1 + Math.sin(t * 3) * 0.03, 1.15 - Math.sin(t * 3) * 0.03, 1);
    },
  };
}

export function criarBicho(id: string): Bicho {
  const nome = `${id} ${PERSONAGENS.get(id)?.nome ?? ''}`;
  if (id === 'bitu' || /gato/i.test(nome)) return gato();
  if (id === 'chapeu') return capacete();
  if (/edite|pomb/i.test(nome)) return pomba();
  if (/siri/i.test(nome)) return siri();
  return criatura(id);
}
