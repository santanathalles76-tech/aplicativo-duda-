import { z } from 'zod';
import { isValidDateKey, isValidTime } from '../../utils/date';
import { DEFAULT_CATEGORIES } from './categories';

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Dê um título à tarefa.')
    .max(120, 'O título pode ter no máximo 120 caracteres.'),
  description: z.string().max(500, 'A descrição pode ter no máximo 500 caracteres.'),
  dueDate: z.string().refine(isValidDateKey, 'Escolha uma data válida.'),
  dueTime: z
    .string()
    .nullable()
    .refine((v) => v === null || isValidTime(v), 'Horário inválido.'),
  priority: z.enum(['alta', 'media', 'baixa']),
  categoryId: z.string().refine((id) => DEFAULT_CATEGORIES.some((c) => c.id === id), 'Escolha uma categoria.'),
});
