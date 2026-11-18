// Materiais fotográficos (texturas CC0 do Poly Haven convertidas para WebP em public/ambiente/texturas).
import * as THREE from 'three';
import { rastrear } from './carga';

const BASE = `${import.meta.env.BASE_URL}ambiente/texturas/`;
const ARM = new Set(['leafy_grass', 'medieval_red_brick', 'old_wood_floor']);
const tl = new THREE.TextureLoader();
const cache = new Map<string, THREE.Texture>();
// uma imagem por arquivo; cada repetição é uma cópia leve que divide a mesma imagem (sobe para a placa de vídeo uma vez só)
const imagens = new Map<string, { t: THREE.Texture; copias: THREE.Texture[]; pronta: boolean }>();

function tex(arquivo: string, rep: [number, number], cor: boolean): THREE.Texture {
  const chave = `${arquivo}|${rep.join('x')}`;
  let t = cache.get(chave);
  if (!t) {
    let im = imagens.get(arquivo);
    if (!im) {
      let fim!: () => void;
      rastrear(new Promise<void>((r) => (fim = r)));
      const nova = { t: null as unknown as THREE.Texture, copias: [] as THREE.Texture[], pronta: false };
      nova.t = tl.load(
        BASE + arquivo + '.webp?v=' + __VERSAO__,
        () => {
          nova.pronta = true;
          nova.copias.forEach((c) => (c.needsUpdate = true));
          fim();
        },
        undefined,
        () => fim(),
      );
      imagens.set(arquivo, nova);
      im = nova;
    }
    t = im.t.clone();
    if (im.pronta) t.needsUpdate = true;
    else im.copias.push(t);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rep[0], rep[1]);
    t.anisotropy = 8;
    if (cor) t.colorSpace = THREE.SRGBColorSpace;
    cache.set(chave, t);
  }
  return t;
}

export type Superficie = 'tijolo' | 'pedra' | 'reboco' | 'assoalho' | 'paralelepipedo' | 'telhado' | 'chao_mata' | 'grama' | 'concreto';
const ID: Record<Superficie, string> = {
  tijolo: 'medieval_red_brick',
  pedra: 'castle_brick_07',
  reboco: 'beige_wall_001',
  assoalho: 'old_wood_floor',
  paralelepipedo: 'cobblestone_floor_04',
  telhado: 'red_slate_roof_tiles_01',
  chao_mata: 'forest_ground_04',
  grama: 'leafy_grass',
  concreto: 'concrete_wall_003',
};

/** baixa todas as texturas de superfície de uma vez (em segundo plano, logo depois da tela inicial) */
export function preCarregarTexturas() {
  for (const id of Object.values(ID)) {
    tex(`${id}_cor`, [1, 1], true);
    tex(`${id}_normal`, [1, 1], false);
    tex(`${id}_${ARM.has(id) ? 'arm' : 'aspereza'}`, [1, 1], false);
  }
}

/** material com cor, relevo (normal) e aspereza; rep = quantas vezes a textura repete na superfície */
export function pbr(s: Superficie, rep: [number, number], extra: THREE.MeshStandardMaterialParameters = {}): THREE.MeshStandardMaterial {
  const id = ID[s];
  return new THREE.MeshStandardMaterial({
    map: tex(`${id}_cor`, rep, true),
    normalMap: tex(`${id}_normal`, rep, false),
    roughnessMap: tex(`${id}_${ARM.has(id) ? 'arm' : 'aspereza'}`, rep, false),
    roughness: 1,
    metalness: 0,
    ...extra,
  });
}
