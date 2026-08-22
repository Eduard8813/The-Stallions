export const CATEGORIAS_EVENTO = ['FERIADO', 'CONMEMORACION', 'CELEBRACION'] as const;

export type CategoriaEvento = (typeof CATEGORIAS_EVENTO)[number];

export interface Evento {
  id: string;
  titulo: string;
  /** Fecha en formato ISO: YYYY-MM-DD */
  fecha: string;
  categoria: CategoriaEvento;
  descripcion: string;
}
