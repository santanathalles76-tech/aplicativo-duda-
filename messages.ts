import { dayOfYear } from './date.ts';

const MESSAGES = [
  'Um passo de cada vez já é caminho.',
  'Organize o dia, leve o resto com leveza.',
  'O que importa hoje cabe em poucas tarefas.',
  'Pequenas conquistas também contam.',
  'Respire fundo e comece pelo mais simples.',
  'Seu ritmo é o ritmo certo.',
  'Cuidar da rotina é cuidar de você.',
];

/** Mensagem fixa durante o dia, que muda de um dia para o outro. */
export function motivationalMessage(d: Date): string {
  return MESSAGES[dayOfYear(d) % MESSAGES.length];
}
