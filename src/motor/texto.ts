// Personalização e marcação dos textos do conteúdo.
import type { CasaId } from '../conteudo/tipos';
import { estado, temPartida } from './estado';

export const CASA_INFO: Record<CasaId, { nome: string; bicho: string; valor: string; area: string; cor: string; cor2: string; lema: string }> = {
  oncarina: { nome: 'Onçarina', bicho: 'onça-pintada', valor: 'coragem', area: 'Red Team ético', cor: '#e8a317', cor2: '#4a1f05', lema: 'Testa primeiro, com contrato assinado.' },
  tucanal: { nome: 'Tucanal', bicho: 'tucano', valor: 'curiosidade', area: 'pesquisa e Threat Intel', cor: '#ff7f11', cor2: '#141414', lema: 'Se tem fonte, tem pergunta.' },
  capivarias: { nome: 'Capivárias', bicho: 'capivara', valor: 'calma e lealdade', area: 'Blue Team e SOC', cor: '#3fb59f', cor2: '#5b3d24', lema: 'Ninguém entra em pânico. Entra em playbook.' },
  jararacas: { nome: 'Jararacas', bicho: 'jararaca', valor: 'astúcia', area: 'engenharia social, do lado da defesa', cor: '#9ccc65', cor2: '#2f3b22', lema: 'Quem conhece o golpe não cai nele.' },
};

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export function personaliza(s: string): string {
  if (!temPartida()) return s;
  const e = estado();
  const casa = e.casa ? CASA_INFO[e.casa].nome : 'sua casa';
  return s
    .replace(/\{nome\}/g, e.nome)
    .replace(/\{casa\}/g, casa)
    .replace(/\{([^{}/]*)\/([^{}/]*)\/([^{}/]*)\}/g, (_m, a: string, b: string, c: string) => [a, b, c][e.pronome]);
}

/** texto do conteúdo para HTML: personaliza, escapa e aplica `código`, **negrito** e quebras de linha */
export function fmt(s: string): string {
  const partes = esc(personaliza(s)).split('`');
  return partes
    .map((p, i) => (i % 2 === 1 ? `<code>${p}</code>` : p.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')))
    .join('')
    .replace(/\n/g, '<br>');
}
