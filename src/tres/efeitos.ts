// Efeitos 3D dos feitiços da varinha: cada família de comando faz alguma coisa aparecer no castelo.
import * as THREE from 'three';
import { M } from './motor3d';
import { C } from './cena3d';
import { J } from './jogador';
import * as Som from '../motor/som';

export type Familia = 'revelar' | 'rede' | 'identidade' | 'cripto' | 'logs' | 'sudo' | 'faisca';

// a primeira palavra do comando decide a família do efeito
const FAMILIAS: [RegExp, Familia][] = [
  [/^(ls|dir|find|tree|file|strings|grep|cat|less|head|xxd|readelf|rabin2|pwd|man|Get-ChildItem|yara|upx)$/i, 'revelar'],
  [/^(ping|traceroute|tracert|nmap|ss|netstat|ip|ifconfig|nslookup|dig|curl|wget|nc|tshark|tcpdump|nmcli|ssh|arp|route|suricata)$/i, 'rede'],
  [/^(whoami|id|groups|klist|Get-ADUser|Get-ADGroupMember|nltest|net|gpresult|usermod)$/i, 'identidade'],
  [/^(sha256sum|md5sum|sha1sum|openssl|gpg|Get-FileHash|hashcat|base64)$/i, 'cripto'],
  [/^(journalctl|tail|Get-WinEvent|wevtutil|dmesg|last|lastb|sigma|wc|sort|uniq|awk|cut|vol)$/i, 'logs'],
  [/^sudo$/i, 'sudo'],
];

export function familiaDe(comando: string): Familia {
  const b = comando.trim().split(/\s+/)[0] ?? '';
  for (const [re, f] of FAMILIAS) if (re.test(b)) return f;
  return 'faisca';
}

const tmp = new THREE.Vector3();

/** de onde sai o feitiço: um pouco abaixo e à direita da câmera, como se fosse a mão com a varinha */
function ponta(): THREE.Vector3 {
  const d = new THREE.Vector3(-Math.sin(J.yaw), 0, -Math.cos(J.yaw));
  const lado = new THREE.Vector3(Math.cos(J.yaw), 0, -Math.sin(J.yaw));
  return new THREE.Vector3(J.pos.x, J.pos.y + J.olho - 0.2, J.pos.z).addScaledVector(d, 0.55).addScaledVector(lado, 0.22);
}

/** ponto à frente de quem lança, pela direção do jogador (não depende de a câmera já ter atualizado) */
function frente(dist: number, alt = 0): THREE.Vector3 {
  const d = tmp.set(-Math.sin(J.yaw), 0, -Math.cos(J.yaw));
  return new THREE.Vector3(J.pos.x, J.pos.y + J.olho + alt, J.pos.z).addScaledVector(d, dist);
}

/** brilho redondo para as faíscas (sem textura, o ponto vira quadradinho) */
let texBrilho: THREE.CanvasTexture | null = null;
function brilho(): THREE.CanvasTexture {
  if (texBrilho) return texBrilho;
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const c = cv.getContext('2d')!;
  const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.35, 'rgba(255,255,255,0.7)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = gr;
  c.fillRect(0, 0, 64, 64);
  texBrilho = new THREE.CanvasTexture(cv);
  return texBrilho;
}

/** anima por tantos segundos e depois tira da cena */
function animar(obj: THREE.Object3D, dur: number, f: (u: number, t: number) => void) {
  M.cena.add(obj);
  const t0 = performance.now();
  const passo = () => {
    const t = (performance.now() - t0) / 1000;
    const u = Math.min(1, t / dur);
    f(u, t);
    if (u >= 1) {
      M.atualizar.delete(passo);
      obj.removeFromParent();
      obj.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | undefined;
        mat?.dispose();
      });
    }
  };
  M.atualizar.add(passo);
}

function textoSprite(texto: string, cor: string, alt = 0.35): THREE.Sprite {
  const cv = document.createElement('canvas');
  cv.width = 512;
  cv.height = 128;
  const c = cv.getContext('2d')!;
  c.font = 'bold 54px "Cinzel", serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.shadowColor = cor;
  c.shadowBlur = 24;
  c.fillStyle = cor;
  c.fillText(texto, 256, 64, 490);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, toneMapped: false }));
  s.scale.set(alt * 4, alt, 1);
  return s;
}

/** faíscas que saem da varinha */
function faiscas(cor: number, quantas = 40, origem = ponta(), alcance = 1.6) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(quantas * 3);
  const vel: THREE.Vector3[] = [];
  const dir = new THREE.Vector3(-Math.sin(J.yaw), 0.15, -Math.cos(J.yaw));
  for (let i = 0; i < quantas; i++) {
    pos.set([origem.x, origem.y, origem.z], i * 3);
    vel.push(dir.clone().multiplyScalar(alcance * (0.6 + Math.random() * 0.8)).add(new THREE.Vector3((Math.random() - 0.5) * 1.6, Math.random() * 1.2, (Math.random() - 0.5) * 1.6)));
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: cor, size: 0.16, map: brilho(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false });
  const pts = new THREE.Points(geo, mat);
  animar(pts, 1.4, (u) => {
    const a = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < quantas; i++) {
      a.setXYZ(i, origem.x + vel[i].x * u, origem.y + vel[i].y * u - 0.8 * u * u, origem.z + vel[i].z * u);
    }
    a.needsUpdate = true;
    mat.opacity = 1 - u;
  });
}

/** revelar: onda dourada pelo chão; se achou segredo, um pergaminho brilhante aparece girando */
function revelar(achou: boolean) {
  const anel = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 64), new THREE.MeshBasicMaterial({ color: 0xf2c45a, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false }));
  anel.rotation.x = -Math.PI / 2;
  anel.position.set(J.pos.x, 0.03, J.pos.z);
  animar(anel, 1.8, (u) => {
    anel.scale.setScalar(0.2 + u * 9);
    (anel.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - u);
  });
  faiscas(0xf2c45a, 30);
  // poeira dourada subindo pela sala: o que estava escondido brilha por um instante
  const n = 90;
  const geo = new THREE.BufferGeometry();
  const base: THREE.Vector3[] = [];
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = 1.5 + Math.random() * 7;
    base.push(new THREE.Vector3(J.pos.x + Math.cos(a) * d, Math.random() * 0.6, J.pos.z + Math.sin(a) * d));
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xf2c45a, size: 0.14, map: brilho(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false });
  const poeira = new THREE.Points(geo, mat);
  animar(poeira, 2.6, (u) => {
    const at = geo.attributes.position as THREE.BufferAttribute;
    base.forEach((b, i) => at.setXYZ(i, b.x, b.y + u * (1.5 + (i % 5) * 0.4), b.z));
    at.needsUpdate = true;
    mat.opacity = u < 0.2 ? u / 0.2 : 1 - (u - 0.2) / 0.8;
  });
  if (achou) {
    const g = new THREE.Group();
    const rolo = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 16), new THREE.MeshStandardMaterial({ color: 0xf4ecd8, emissive: 0xf2c45a, emissiveIntensity: 0.6 }));
    rolo.rotation.z = Math.PI / 2;
    g.add(rolo);
    const luz = new THREE.PointLight(0xf2c45a, 3, 3);
    g.add(luz);
    const p = frente(1.3, -0.2);
    g.position.copy(p);
    animar(g, 3.2, (u, t) => {
      g.rotation.y = t * 2.5;
      g.position.y = p.y + Math.sin(t * 3) * 0.06 + u * 0.3;
      g.scale.setScalar(u < 0.15 ? u / 0.15 : u > 0.85 ? (1 - u) / 0.15 : 1);
    });
  }
}

/** rede: bolinhas de luz azul vão até quem está perto (pessoas e portas) e voltam, como ping e pong */
function rede() {
  const alvos: THREE.Vector3[] = [];
  for (const h of [...C.npcs.values(), ...C.figurantes]) {
    const p = h.cabeca();
    if (p.distanceTo(M.camera.position) < 14) alvos.push(p);
  }
  for (const pt of C.portas) alvos.push(pt.getWorldPosition(new THREE.Vector3()).setY(1.4));
  if (!alvos.length) alvos.push(frente(6));
  alvos.sort((a, b) => a.distanceTo(M.camera.position) - b.distanceTo(M.camera.position));
  alvos.slice(0, 6).forEach((alvo, i) => {
    const bola = new THREE.Sprite(new THREE.SpriteMaterial({ map: brilho(), color: 0x6ef2ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false }));
    bola.scale.setScalar(0.35);
    const de = ponta();
    animar(bola, 1.6, (u) => {
      const k = Math.max(0, Math.min(1, u * 1.25 - i * 0.05));
      // vai até o alvo na primeira metade e volta na segunda
      const ida = k < 0.5 ? k * 2 : (1 - k) * 2;
      bola.position.copy(de).lerp(alvo, ida);
      bola.position.y += Math.sin(ida * Math.PI) * 0.4;
      bola.material.color.setHex(k < 0.5 ? 0x6ef2ff : 0x7dff9a);
    });
  });
}

/** identidade: o nome de quem lança flutua em letras douradas */
function identidade(nome: string) {
  const s = textoSprite(nome, '#f2c45a', 0.5);
  const p = frente(2.2, 0.35);
  s.position.copy(p);
  animar(s, 2.6, (u) => {
    s.position.y = p.y + u * 0.5;
    (s.material as THREE.SpriteMaterial).opacity = u < 0.2 ? u / 0.2 : 1 - Math.max(0, (u - 0.6) / 0.4);
  });
  faiscas(0xf2c45a, 24);
}

/** cripto: anel de caracteres hexadecimais girando em volta de você */
function cripto() {
  const g = new THREE.Group();
  const centro = frente(2.6, 0.25);
  g.position.copy(centro);
  const hex = '0123456789abcdef';
  for (let i = 0; i < 14; i++) {
    const s = textoSprite(hex[Math.floor(Math.random() * 16)] + hex[Math.floor(Math.random() * 16)], '#7dff9a', 0.3);
    const a = (i / 14) * Math.PI * 2;
    s.position.set(Math.cos(a) * 0.9, Math.sin(i) * 0.12, Math.sin(a) * 0.9);
    g.add(s);
  }
  animar(g, 2.4, (u, t) => {
    g.rotation.y = t * 1.6;
    g.scale.setScalar(0.4 + u * 0.8);
    g.children.forEach((c) => ((c as THREE.Sprite).material.opacity = 1 - u));
  });
}

/** logs: linhas de log subindo no ar à sua frente */
function logs() {
  const linhas = ['sshd: login ok', 'auth: senha errada', 'kernel: link up', 'fw: bloqueado', 'cron: backup ok', '4624 logon', '4625 falha'];
  linhas.slice(0, 5).forEach((l, i) => {
    const s = textoSprite(l, i % 3 === 1 ? '#ff8a8a' : '#7dff9a', 0.2);
    const p = frente(2.2, -0.2 + i * 0.05);
    p.x += (Math.random() - 0.5) * 0.8;
    s.position.copy(p);
    animar(s, 2.8, (u) => {
      const k = Math.max(0, u * 1.3 - i * 0.08);
      s.position.y = p.y + k * 1.2;
      (s.material as THREE.SpriteMaterial).opacity = Math.max(0, Math.min(1, k * 4, 1.6 - k * 1.6));
    });
  });
}

/** sudo: as luzes piscam de vermelho, porque você não está no sudoers */
function sudo() {
  const luz = new THREE.PointLight(0xff2030, 0, 14, 1.2);
  luz.position.copy(M.camera.position).setY(M.camera.position.y + 1.5);
  animar(luz, 1.8, (u) => (luz.intensity = Math.sin(u * Math.PI * 6) > 0 ? 12 : 0));
}

/** lança o efeito do feitiço no castelo */
export function lancarEfeito(comando: string, nome: string, achouSegredo: boolean) {
  const f = familiaDe(comando);
  Som.feitico(true);
  if (f === 'revelar') revelar(achouSegredo);
  else if (f === 'rede') rede();
  else if (f === 'identidade') identidade(nome);
  else if (f === 'cripto') cripto();
  else if (f === 'logs') logs();
  else if (f === 'sudo') sudo();
  else faiscas(0xc8a0ff, 50);
  if (achouSegredo && f !== 'revelar') revelar(true);
}
