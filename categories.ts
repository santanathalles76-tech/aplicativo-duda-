import type { Category } from '../../types/index.ts';

/** Categorias iniciais. A edição/criação de categorias chega na Fase 2. */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'pessoal', name: 'Pessoal', icon: 'user', color: '#718C73' },
  { id: 'estudos', name: 'Estudos', icon: 'book-open', color: '#6F8A9A' },
  { id: 'trabalho', name: 'Trabalho', icon: 'briefcase', color: '#405B48' },
  { id: 'saude', name: 'Saúde e bem-estar', icon: 'heart', color: '#C88F82' },
  { id: 'casa', name: 'Casa', icon: 'home', color: '#C49A56' },
  { id: 'compras', name: 'Compras', icon: 'shopping-bag', color: '#9A8AA8' },
  { id: 'outros', name: 'Outros', icon: 'more-horizontal', color: '#879184' },
];

export const FALLBACK_CATEGORY_ID = 'outros';

export function getCategory(id: string): Category {
  return (
    DEFAULT_CATEGORIES.find((c) => c.id === id) ??
    DEFAULT_CATEGORIES.find((c) => c.id === FALLBACK_CATEGORY_ID)!
  );
}
