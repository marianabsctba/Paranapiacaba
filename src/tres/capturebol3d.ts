// Partida de Capturebol no campo 3D: jogadores em vassouras-drone, Bolas de Spam, pacotes nos aros e a Flag Dourada.
import * as THREE from 'three';
import { M } from './motor3d';
import { Humano } from './humanos';

const std = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o);

/** vassoura-drone: cabo de madeira, cerdas e quatro hélices acesas */
function vassoura(cor: number): THREE.Group {
  const g = new THREE.Group();
  const cabo = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.8, 8), std({ color: 0x6a4424, roughness: 0.7 }));
  cabo.rotation.x = Math.PI / 2;
  g.add(cabo);
  const cerdas = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 10), std({ color: 0xc8a050, roughness: 1 }));
  cerdas.rotation.x = -Math.PI / 2;
  cerdas.position.z = 1.15;
  g.add(cerdas);
  const luz = std({ color: 0x111111, emissive: cor, emissiveIntensity: 1.6 });
  for (const [x, z] of [[-0.25, -0.5], [0.25, -0.5], [-0.25, 0.6], [0.25, 0.6]]) {
    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 12), luz);
    h.position.set(x, -0.06, z);
    g.add(h);
  }
  return g;
}

interface Voador {
  h: Humano;
  base: THREE.Group;
  fase: number;
  raio: number;
  alt: number;
  lado: number; // 1 = seu time, -1 = adversário
}

export interface Campo3D {
  flagAtiva: boolean;
  flag: THREE.Object3D;
  distanciaFlag(): number;
  mostrarFlag(): void;
  pacote(meu: boolean, entra: boolean): Promise<void>;
  spam(): Promise<boolean>; // true se acertou você
  encerrar(): void;
}

export function montarPartida(minhaCor: number, outraCor: number): Campo3D {
  const g = new THREE.Group();
  M.cena.add(g);
  const voadores: Voador[] = [];
  const ids = [['tati', 'caua', 'jonas'], ['aluno1', 'aluno2', 'aluno3']];
  ids.forEach((time, k) => time.forEach((id, i) => {
    const lado = k === 0 ? 1 : -1;
    const cor = lado > 0 ? minhaCor : outraCor;
    const base = new THREE.Group();
    g.add(base);
    const v = vassoura(cor);
    base.add(v);
    const h = new Humano(id, cor);
    h.sentado = true;
    h.raiz.position.set(0, -0.48, -0.15);
    h.raiz.userData.travado = true;
    base.add(h.raiz);
    h.pronto.then(() => h.tocar('parado', 0));
    voadores.push({ h, base, fase: i * 2.1 + k * 1.3, raio: 6 + i * 3, alt: 6 + i * 2.5, lado });
  }));
  // Flag Dourada: bolinha com asas que zumbe pelo campo
  const flag = new THREE.Group();
  const bola = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), std({ color: 0xffd700, emissive: 0xffaa00, emissiveIntensity: 1.6, metalness: 1, roughness: 0.25 }));
  flag.add(bola);
  const asas: THREE.Mesh[] = [];
  for (const s of [-1, 1]) {
    const asa = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.22), std({ color: 0xfff6d0, emissive: 0xffe9a0, emissiveIntensity: 0.6, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
    asa.position.x = s * 0.32;
    flag.add(asa);
    asas.push(asa);
  }
  const brilhoFlag = new THREE.PointLight(0xffcc33, 4, 6, 1.5);
  flag.add(brilhoFlag);
  flag.visible = false;
  g.add(flag);
  let flagAtiva = false;
  let flagT = 0;
  const flagCentro = new THREE.Vector3(0, 7, 0);

  const animacoes = new Set<(dt: number) => boolean>();
  let t = 0;
  const tick = (dt: number) => {
    t += dt;
    for (const v of voadores) {
      const a = t * (0.35 + v.raio * 0.012) + v.fase;
      const x = Math.sin(a) * v.raio;
      const z = Math.cos(a * 0.8) * (v.raio + 8) * 0.9 - v.lado * 4;
      const y = v.alt + Math.sin(t * 1.3 + v.fase) * 0.8;
      const ant = v.base.position.clone();
      v.base.position.set(x, y, z);
      const d = v.base.position.clone().sub(ant);
      if (d.lengthSq() > 1e-6) v.base.rotation.y = Math.atan2(-d.x, -d.z);
      v.base.rotation.z = Math.sin(t * 1.3 + v.fase) * 0.15;
      v.h.update(dt);
    }
    if (flagAtiva) {
      flagT += dt;
      // a flag foge em zigue-zague e acelera quando você chega perto
      const perto = flag.position.distanceTo(M.camera.position) < 8 ? 1.6 : 1;
      flagCentro.x += Math.sin(flagT * 0.7) * dt * 3 * perto;
      flagCentro.z += Math.cos(flagT * 0.5) * dt * 4 * perto;
      flagCentro.x = Math.max(-15, Math.min(15, flagCentro.x));
      flagCentro.z = Math.max(-28, Math.min(28, flagCentro.z));
      flag.position.set(flagCentro.x + Math.sin(flagT * 3.1) * 1.5, flagCentro.y + Math.sin(flagT * 2.3) * 1.6, flagCentro.z + Math.cos(flagT * 2.7) * 1.5);
      asas.forEach((a, i) => (a.rotation.y = Math.sin(t * 40) * 0.9 * (i ? 1 : -1)));
    }
    for (const f of [...animacoes]) if (!f(dt)) animacoes.delete(f);
  };
  M.atualizar.add(tick);

  /** bola voando de um ponto a outro em arco */
  const voar = (de: THREE.Vector3, ate: () => THREE.Vector3, dur: number, mat: THREE.Material, raio: number): Promise<THREE.Vector3> =>
    new Promise((fim) => {
      const b = new THREE.Mesh(new THREE.SphereGeometry(raio, 14, 12), mat);
      b.position.copy(de);
      g.add(b);
      let u = 0;
      animacoes.add((dt) => {
        u += dt / dur;
        const alvo = ate();
        const p = de.clone().lerp(alvo, Math.min(1, u));
        p.y += Math.sin(Math.min(1, u) * Math.PI) * 2;
        b.position.copy(p);
        if (u >= 1) {
          b.removeFromParent();
          fim(alvo.clone());
          return false;
        }
        return true;
      });
    });

  return {
    get flagAtiva() {
      return flagAtiva;
    },
    flag,
    distanciaFlag: () => (flagAtiva ? flag.position.distanceTo(M.camera.position) : Infinity),
    mostrarFlag() {
      flagAtiva = true;
      flag.visible = true;
      flagCentro.set((Math.random() - 0.5) * 20, 6 + Math.random() * 4, (Math.random() - 0.5) * 30);
    },
    async pacote(meu, entra) {
      // o pacote sai de um atacante do time e vai para o aro do outro lado
      const atacante = voadores.find((v) => v.lado === (meu ? 1 : -1))!;
      const aroZ = meu ? -30 : 30;
      const aroX = [-4, 0, 4][Math.floor(Math.random() * 3)];
      const aroY = aroX === 0 ? 16.2 : aroX < 0 ? 13.2 : 11.2;
      const destino = entra ? new THREE.Vector3(aroX, aroY, aroZ) : new THREE.Vector3(aroX + 3, aroY - 4, aroZ * 0.85);
      const mat = std({ color: meu ? minhaCor : outraCor, emissive: meu ? minhaCor : outraCor, emissiveIntensity: 0.8 });
      await voar(atacante.base.position.clone(), () => destino, 1.6, mat, 0.25);
    },
    async spam() {
      // a Bola de Spam sai de um adversário e mira onde você estava; desviar é sair do lugar
      const de = voadores.filter((v) => v.lado < 0)[Math.floor(Math.random() * 3)].base.position.clone();
      const mira = M.camera.position.clone();
      const mat = std({ color: 0xc0182a, emissive: 0xff2a3a, emissiveIntensity: 1.2, roughness: 0.4 });
      const chegou = await voar(de, () => mira, 2.4, mat, 0.32);
      return chegou.distanceTo(M.camera.position) < 2.2;
    },
    encerrar() {
      M.atualizar.delete(tick);
      g.removeFromParent();
    },
  };
}
