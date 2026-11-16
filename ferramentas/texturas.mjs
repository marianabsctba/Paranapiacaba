// Converte texturas CC0 do Poly Haven (1K) para WebP: cor, normal e aspereza.
// Uso: node ferramentas/texturas.mjs <pasta-bruta> <saida> id1 id2 ...
import sharp from 'sharp';
import { readdirSync, mkdirSync } from 'node:fs';
const [ent, sai, ...ids] = process.argv.slice(2);
mkdirSync(sai, { recursive: true });
const TIPO = [[/_diff_/, 'cor'], [/_nor_gl_/, 'normal'], [/_rough_/, 'aspereza'], [/_arm_/, 'arm']];
for (const id of ids) {
  for (const f of readdirSync(`${ent}/${id}/textures`)) {
    const t = TIPO.find(([re]) => re.test(f));
    if (!t) continue;
    await sharp(`${ent}/${id}/textures/${f}`).resize(1024, 1024, { fit: 'inside' }).webp({ quality: t[1] === 'cor' ? 80 : 70 }).toFile(`${sai}/${id}_${t[1]}.webp`);
  }
  console.log('ok', id);
}
