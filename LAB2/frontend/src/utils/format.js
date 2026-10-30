export const STATUS_LABEL = {
  EM_ANALISE: 'Em análise',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
  CONTRATADO: 'Contrato executado',
  CANCELADO: 'Cancelado',
};

export const PAPEL_LABEL = { CLIENTE: 'Cliente', EMPRESA: 'Empresa (agente)', BANCO: 'Banco (agente)' };

export function formatCpf(cpf = '') {
  const d = cpf.replace(/\D/g, '');
  return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : cpf;
}

export function formatData(iso) {
  if (!iso) return '-';
  const [a, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

export function formatMoeda(v) {
  return Number(v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
