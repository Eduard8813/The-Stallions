export const CATEGORIAS_EVENTO = ['FERIADO', 'CONMEMORACION', 'CELEBRACION'] as const;

export type CategoriaEvento = (typeof CATEGORIAS_EVENTO)[number];

export interface Evento {
  id: string;
  titulo: string;
  /** Fecha de inicio en formato ISO: YYYY-MM-DD */
  fecha: string;
  /** Fecha de fin del rango en ISO (null/undefined = evento de un solo día) */
  fechaFin?: string | null;
  categoria: CategoriaEvento;
  descripcion: string;
  /** URL pública de la foto del evento (null si no tiene) */
  fotoUrl?: string | null;
}
