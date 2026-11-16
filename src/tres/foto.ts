// "Fotos" dos personagens tiradas do próprio modelo 3D, para os menus usarem o mesmo visual do jogo.
import * as THREE from 'three';
import { Humano } from './humanos';

const LARG = 256;
const ALT = 300;
let r: THREE.WebGLRenderer | null = null;
const cena = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(26, LARG / ALT, 0.05, 20);
const cache = new Map<string, Promise<string>>();
let fila: Promise<unknown> = Promise.resolve();

function preparar() {
  if (r) return r;
  r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.setSize(LARG, ALT);
  r.setPixelRatio(1);
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.25;
  cena.add(new THREE.HemisphereLight(0xfff4e6, 0x3a3048, 1.3));
  const chave = new THREE.DirectionalLight(0xffe6c8, 2.2);
  chave.position.set(1.2, 2.2, 2.5);
  cena.add(chave);
  const recorte = new THREE.DirectionalLight(0x9ab8ff, 1.2);
  recorte.position.set(-2, 2, -1.5);
  cena.add(recorte);
  return r;
}

/** foto de rosto e ombros; a mesma chave devolve a mesma foto */
export function foto(id: string, tinta?: number, corpoInteiro = false): Promise<string> {
  const chave = `${id}|${tinta ?? ''}|${corpoInteiro ? 1 : 0}`;
  let p = cache.get(chave);
  if (p) return p;
  p = (fila = fila.then(async () => {
    const rr = preparar();
    const h = new Humano(id, tinta);
    await Promise.race([h.pronto, new Promise((ok) => setTimeout(ok, 10000))]);
    h.tocar('parado', 0);
    h.update(0.6);
    cena.add(h.raiz);
    h.raiz.updateMatrixWorld(true);
    const rosto = h.cabeca();
    if (corpoInteiro) {
      const topo = rosto.y + 0.14;
      cam.position.set(0, topo * 0.52, topo * 2.5);
      cam.lookAt(0, topo * 0.5, 0);
    } else {
      cam.position.set(rosto.x + 0.08, rosto.y + 0.02, rosto.z + 0.78);
      cam.lookAt(rosto.x, rosto.y - 0.06, rosto.z);
    }
    rr.render(cena, cam);
    const url = rr.domElement.toDataURL('image/png');
    h.raiz.removeFromParent();
    return url;
  })) as Promise<string>;
  cache.set(chave, p);
  return p;
}

/** <img> que aparece assim que a foto fica pronta */
export function imgFoto(id: string, classe = 'foto', tinta?: number, corpoInteiro = false): HTMLImageElement {
  const img = document.createElement('img');
  img.className = `${classe} carregando`;
  img.alt = '';
  foto(id, tinta, corpoInteiro).then((u) => {
    img.src = u;
    img.classList.remove('carregando');
  });
  return img;
}
