// Tudo o que um lugar novo ainda está baixando (móveis, texturas, gente).
// A troca de lugar espera esta lista esvaziar antes de tirar a cortina, para a sala aparecer inteira.

const pendentes = new Set<Promise<unknown>>();

export function rastrear<T>(p: Promise<T>): Promise<T> {
  pendentes.add(p);
  const sai = () => pendentes.delete(p);
  p.then(sai, sai);
  return p;
}

/** espera o que está pendente (e o que surgir enquanto isso), sem passar do limite em ms */
export async function esperarCarga(limite = 6000): Promise<void> {
  const fim = performance.now() + limite;
  while (pendentes.size && performance.now() < fim) {
    await Promise.race([Promise.allSettled([...pendentes]), new Promise((r) => setTimeout(r, Math.max(0, fim - performance.now())))]);
  }
}

export function quantosPendentes() {
  return pendentes.size;
}
