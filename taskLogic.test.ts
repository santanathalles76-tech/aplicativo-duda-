import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateRate,
  completedByCategory,
  createTask,
  isOverdue,
  isValidTask,
  overdueFromPreviousDays,
  recentDayStats,
  sortTasks,
  summarize,
  tasksForDate,
  toggleTask,
  updateTask,
} from '../src/features/tasks/taskLogic.ts';
import { addDays, greetingFor, isValidDateKey, startOfWeek, toDateKey } from '../src/utils/date.ts';
import type { TaskInput } from '../src/types/index.ts';

const NOW = new Date(2026, 10, 7, 13, 6); // 7 nov 2026, 13:06
const base: TaskInput = {
  title: '  Estudar  ',
  description: '',
  dueDate: '2026-11-07',
  dueTime: null,
  priority: 'media',
  categoryId: 'estudos',
};

test('createTask normaliza título e inicia pendente', () => {
  const t = createTask(base, 'a1', NOW);
  assert.equal(t.title, 'Estudar');
  assert.equal(t.status, 'pendente');
  assert.equal(t.completedAt, null);
  assert.equal(t.id, 'a1');
});

test('toggleTask conclui e reabre', () => {
  const t = createTask(base, 'a1', NOW);
  const done = toggleTask(t, NOW);
  assert.equal(done.status, 'concluida');
  assert.ok(done.completedAt);
  const reopened = toggleTask(done, NOW);
  assert.equal(reopened.status, 'pendente');
  assert.equal(reopened.completedAt, null);
});

test('updateTask preserva id e criação', () => {
  const t = createTask(base, 'a1', NOW);
  const later = new Date(2026, 10, 8);
  const u = updateTask(t, { ...base, title: 'Novo', priority: 'alta' }, later);
  assert.equal(u.id, 'a1');
  assert.equal(u.createdAt, t.createdAt);
  assert.equal(u.title, 'Novo');
  assert.equal(u.priority, 'alta');
  assert.notEqual(u.updatedAt, t.updatedAt);
});

test('sortTasks: alta primeiro, depois horário, sem horário por último', () => {
  const mk = (id: string, priority: TaskInput['priority'], dueTime: string | null) =>
    createTask({ ...base, priority, dueTime }, id, NOW);
  const sorted = sortTasks([
    mk('baixa', 'baixa', '08:00'),
    mk('media-semhora', 'media', null),
    mk('alta-tarde', 'alta', '15:00'),
    mk('media-cedo', 'media', '09:00'),
    mk('alta-cedo', 'alta', '07:00'),
  ]).map((t) => t.id);
  assert.deepEqual(sorted, ['alta-cedo', 'alta-tarde', 'media-cedo', 'media-semhora', 'baixa']);
});

test('summarize calcula progresso e trata dia vazio', () => {
  assert.deepEqual(summarize([]), { total: 0, done: 0, pending: 0, percent: 0 });
  const a = createTask(base, 'a', NOW);
  const b = toggleTask(createTask(base, 'b', NOW), NOW);
  const c = createTask(base, 'c', NOW);
  assert.deepEqual(summarize([a, b, c]), { total: 3, done: 1, pending: 2, percent: 33 });
  assert.equal(summarize([b]).percent, 100);
});

test('tasksForDate filtra pela data', () => {
  const a = createTask(base, 'a', NOW);
  const b = createTask({ ...base, dueDate: '2026-11-08' }, 'b', NOW);
  assert.deepEqual(tasksForDate([a, b], '2026-11-08').map((t) => t.id), ['b']);
});

test('isOverdue considera dia anterior e horário já passado hoje', () => {
  const ontem = createTask({ ...base, dueDate: '2026-11-06' }, 'o', NOW);
  const hojeCedo = createTask({ ...base, dueTime: '08:00' }, 'h1', NOW);
  const hojeTarde = createTask({ ...base, dueTime: '18:00' }, 'h2', NOW);
  const hojeSemHora = createTask(base, 'h3', NOW);
  const amanha = createTask({ ...base, dueDate: '2026-11-08' }, 'a', NOW);
  assert.equal(isOverdue(ontem, NOW), true);
  assert.equal(isOverdue(hojeCedo, NOW), true);
  assert.equal(isOverdue(hojeTarde, NOW), false);
  assert.equal(isOverdue(hojeSemHora, NOW), false);
  assert.equal(isOverdue(amanha, NOW), false);
  assert.equal(isOverdue(toggleTask(ontem, NOW), NOW), false);
  assert.deepEqual(overdueFromPreviousDays([ontem, hojeCedo, amanha], NOW).map((t) => t.id), ['o']);
});

test('recentDayStats: dia sem tarefas tem percent null e fica fora da taxa', () => {
  const a = toggleTask(createTask(base, 'a', NOW), NOW);
  const b = createTask({ ...base, dueDate: '2026-11-05' }, 'b', NOW);
  const stats = recentDayStats([a, b], '2026-11-07', 7);
  assert.equal(stats.length, 7);
  assert.equal(stats[0].dateKey, '2026-11-01');
  assert.equal(stats[6].dateKey, '2026-11-07');
  assert.equal(stats[6].percent, 100);
  assert.equal(stats[4].percent, 0); // 05/11, uma pendente
  assert.equal(stats[0].percent, null);
  assert.equal(aggregateRate(stats), 50);
  assert.equal(aggregateRate(recentDayStats([], '2026-11-07')), null);
});

test('completedByCategory conta só concluídas', () => {
  const a = toggleTask(createTask(base, 'a', NOW), NOW);
  const b = createTask(base, 'b', NOW);
  const c = toggleTask(createTask({ ...base, categoryId: 'casa' }, 'c', NOW), NOW);
  assert.deepEqual(completedByCategory([a, b, c]), { estudos: 1, casa: 1 });
});

test('isValidTask rejeita dados corrompidos', () => {
  const t = createTask(base, 'a', NOW);
  assert.equal(isValidTask(t), true);
  assert.equal(isValidTask({ ...t, priority: 'urgente' }), false);
  assert.equal(isValidTask({ ...t, dueDate: '2026-13-40' }), false);
  assert.equal(isValidTask({ ...t, dueTime: '25:00' }), false);
  assert.equal(isValidTask({ ...t, title: '   ' }), false);
  assert.equal(isValidTask(null), false);
});

test('datas: chaves, semana e saudação', () => {
  assert.equal(toDateKey(NOW), '2026-11-07');
  assert.equal(addDays('2026-11-30', 1), '2026-12-01');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
  assert.equal(startOfWeek('2026-11-07'), '2026-11-01'); // sábado → domingo
  assert.equal(isValidDateKey('2026-02-30'), false);
  assert.equal(greetingFor(new Date(2026, 10, 7, 8)), 'Bom dia');
  assert.equal(greetingFor(new Date(2026, 10, 7, 13)), 'Boa tarde');
  assert.equal(greetingFor(new Date(2026, 10, 7, 21)), 'Boa noite');
  assert.equal(greetingFor(new Date(2026, 10, 7, 2)), 'Boa noite');
});
