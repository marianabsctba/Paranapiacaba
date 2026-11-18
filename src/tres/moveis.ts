// Móveis 3D de verdade (modelos CC0 do Poly Haven, comprimidos em public/ambiente/moveis).
// Cada móvel é escalado para a medida pedida e apoiado no chão; aparece assim que termina de carregar.
import * as THREE from 'three';
import { L } from './humanos';
import { rastrear } from './carga';

const BASE = `${import.meta.env.BASE_URL}ambiente/moveis/`;
const cache = new Map<string, Promise<THREE.Object3D | null>>();

export type Movel =
  | 'SchoolDesk_01' | 'SchoolChair_01' | 'classic_laptop' | 'wooden_bookshelf_worn' | 'book_encyclopedia_set_01'
  | 'GothicBed_01' | 'treasure_chest' | 'ClassicNightstand_01' | 'Chandelier_01' | 'street_lamp_01'
  | 'vintage_grandfather_clock_01' | 'Sofa_01' | 'Television_01' | 'CoffeeTable_01' | 'potted_plant_01'
  | 'WoodenTable_02' | 'painted_wooden_bench' | 'wooden_lantern_01' | 'desk_lamp_arm_01' | 'Barrel_01'
  | 'steel_frame_shelves_01' | 'wooden_candlestick' | 'dining_table' | 'painted_wooden_table';

function carregar(id: Movel) {
  let p = cache.get(id);
  if (!p) {
    p = L()
      .loadAsync(BASE + id + '.glb?v=' + __VERSAO__)
      .then((g) => {
        g.scene.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) {
            m.castShadow = true;
            m.receiveShadow = true;
            // a geometria fica no cache e serve a todas as salas: trocar de lugar não a descarta
            m.userData.compartilhado = true;
          }
        });
        return g.scene;
      })
      .catch(() => null);
    cache.set(id, p);
  }
  return p;
}

export interface Medida {
  ry?: number; // giro em radianos
  y?: number; // altura da base (para pendurar, apoiar em mesa)
  alt?: number; // altura final em metros
  larg?: number; // maior lado no chão, em metros (usado se não houver alt)
  pendurado?: boolean; // apoia pelo topo (lustre)
}

export function movel(g: THREE.Object3D, id: Movel, x: number, z: number, m: Medida = {}): THREE.Group {
  const ancora = new THREE.Group();
  ancora.position.set(x, m.y ?? 0, z);
  ancora.rotation.y = m.ry ?? 0;
  g.add(ancora);
  rastrear(carregar(id)).then((orig) => {
    if (!orig || !ancora.parent) return;
    const c = orig.clone(true);
    const caixa = new THREE.Box3().setFromObject(c);
    const tam = caixa.getSize(new THREE.Vector3());
    const k = m.alt ? m.alt / tam.y : m.larg ? m.larg / Math.max(tam.x, tam.z) : 1;
    c.scale.setScalar(k);
    const centro = caixa.getCenter(new THREE.Vector3());
    c.position.set(-centro.x * k, m.pendurado ? -caixa.max.y * k : -caixa.min.y * k, -centro.z * k);
    ancora.add(c);
  });
  return ancora;
}

/**
 * Muitas cópias do mesmo móvel desenhadas de uma vez só (uma InstancedMesh por peça do modelo).
 * Mesma medida para todas; cada posição pode ter giro e altura próprios.
 */
export function repetir(g: THREE.Object3D, id: Movel, posicoes: { x: number; z: number; ry?: number; y?: number }[], m: Medida = {}, sombra = true): void {
  if (!posicoes.length) return;
  const grupo = new THREE.Group();
  g.add(grupo);
  rastrear(carregar(id)).then((orig) => {
    if (!orig || !grupo.parent) return;
    const base = orig.clone(true);
    const caixa = new THREE.Box3().setFromObject(base);
    const tam = caixa.getSize(new THREE.Vector3());
    const k = m.alt ? m.alt / tam.y : m.larg ? m.larg / Math.max(tam.x, tam.z) : 1;
    const centro = caixa.getCenter(new THREE.Vector3());
    // matriz que escala e apoia o modelo no chão, centrado
    const ajuste = new THREE.Matrix4().makeTranslation(-centro.x * k, m.pendurado ? -caixa.max.y * k : -caixa.min.y * k, -centro.z * k).multiply(new THREE.Matrix4().makeScale(k, k, k));
    base.updateMatrixWorld(true);
    const lugar = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const eixoY = new THREE.Vector3(0, 1, 0);
    base.traverse((o) => {
      const malha = o as THREE.Mesh;
      if (!malha.isMesh) return;
      const im = new THREE.InstancedMesh(malha.geometry, malha.material, posicoes.length);
      const local = new THREE.Matrix4().multiplyMatrices(ajuste, malha.matrixWorld);
      posicoes.forEach((p, i) => {
        q.setFromAxisAngle(eixoY, p.ry ?? m.ry ?? 0);
        lugar.compose(new THREE.Vector3(p.x, p.y ?? m.y ?? 0, p.z), q, new THREE.Vector3(1, 1, 1));
        im.setMatrixAt(i, new THREE.Matrix4().multiplyMatrices(lugar, local));
      });
      im.userData.compartilhado = true;
      im.castShadow = sombra;
      im.receiveShadow = true;
      im.computeBoundingSphere();
      grupo.add(im);
    });
  });
}

export const TODOS_MOVEIS: Movel[] = [
  'SchoolDesk_01', 'SchoolChair_01', 'classic_laptop', 'wooden_bookshelf_worn', 'book_encyclopedia_set_01', 'GothicBed_01', 'treasure_chest',
  'ClassicNightstand_01', 'Chandelier_01', 'street_lamp_01', 'vintage_grandfather_clock_01', 'Sofa_01', 'Television_01', 'CoffeeTable_01',
  'potted_plant_01', 'WoodenTable_02', 'painted_wooden_bench', 'wooden_lantern_01', 'desk_lamp_arm_01', 'Barrel_01', 'steel_frame_shelves_01',
  'wooden_candlestick', 'dining_table', 'painted_wooden_table',
];

export function preCarregarMoveis(ids: Movel[] = TODOS_MOVEIS) {
  ids.forEach(carregar);
}
