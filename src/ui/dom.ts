// Ajudantes mínimos de DOM.
type Filho = Node | string | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | boolean | ((ev: Event) => void)> = {},
  ...filhos: Filho[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (typeof v === 'function') el.addEventListener(k.replace(/^on/, ''), v);
    else if (k === 'html') el.innerHTML = String(v);
    else if (v === true) el.setAttribute(k, '');
    else if (v !== false) el.setAttribute(k, v);
  }
  for (const f of filhos) if (f) el.append(f);
  return el;
}

export function botao(texto: string, acao: () => void, classe = ''): HTMLButtonElement {
  return h('button', { class: `btn ${classe}`.trim(), type: 'button', onclick: () => acao() }, texto);
}

export function embaralha<T>(xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const espera = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** aviso flutuante */
export function aviso(linhas: string[] | string, classe = ''): void {
  const ls = Array.isArray(linhas) ? linhas : [linhas];
  if (ls.length === 0) return;
  const box = document.getElementById('avisos') ?? document.body.appendChild(h('div', { id: 'avisos' }));
  for (const l of ls) {
    const el = h('div', { class: `aviso ${classe}` }, l);
    box.append(el);
    setTimeout(() => el.classList.add('sai'), 2600);
    setTimeout(() => el.remove(), 3200);
  }
}
