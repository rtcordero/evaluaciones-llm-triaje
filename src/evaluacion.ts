// Puntúa las respuestas de un clasificador frente a unos casos etiquetados por el equipo.
// No llama a ningún modelo: recibe las respuestas ya obtenidas (en directo o grabadas).
import { CATEGORIAS, type Categoria } from './dominio/triaje.ts';

export type Caso = { id: string; texto: string; esperada: Categoria; nota?: string };

// null: el clasificador no dio categoría (ClasificacionNoDisponible).
export type Respuesta = { id: string; obtenida: Categoria | null };

export type Fallo = { id: string; texto: string; esperada: Categoria; obtenida: Categoria | null };

export type Resultado = {
  total: number;
  aciertos: number;
  tasa: number;
  porCategoria: Record<Categoria, { total: number; aciertos: number }>;
  fallos: Fallo[];
};

export function puntuar(casos: Caso[], respuestas: Respuesta[]): Resultado {
  const obtenidaDe = new Map(respuestas.map((r) => [r.id, r.obtenida]));
  const sinRespuesta = casos.filter((c) => !obtenidaDe.has(c.id)).map((c) => c.id);
  if (sinRespuesta.length > 0) {
    throw new Error(`Faltan respuestas para: ${sinRespuesta.join(', ')}`);
  }
  const porCategoria = Object.fromEntries(CATEGORIAS.map((c) => [c, { total: 0, aciertos: 0 }])) as Resultado['porCategoria'];
  const fallos: Fallo[] = [];
  for (const caso of casos) {
    const obtenida = obtenidaDe.get(caso.id) ?? null;
    porCategoria[caso.esperada].total++;
    if (obtenida === caso.esperada) {
      porCategoria[caso.esperada].aciertos++;
    } else {
      fallos.push({ id: caso.id, texto: caso.texto, esperada: caso.esperada, obtenida });
    }
  }
  const aciertos = casos.length - fallos.length;
  return { total: casos.length, aciertos, tasa: aciertos / casos.length, porCategoria, fallos };
}
