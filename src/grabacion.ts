// Una grabación guarda las respuestas reales de un modelo a los casos, con lo necesario para saber
// si sigue valiendo: qué modelo exacto, qué casos, qué instrucciones y cuándo.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { CATEGORIAS } from './dominio/triaje.ts';
import type { Caso, Respuesta } from './evaluacion.ts';

export type Grabacion = {
  modelo: string;
  digest: string;
  versionOllama: string;
  fecha: string;
  huellaInstrucciones: string;
  huellaCasos: string;
  respuestas: Respuesta[];
};

const RAIZ = new URL('../', import.meta.url);

// Cada conjunto de casos es un fichero de evals/: «casos» (el examen principal) o «inyeccion».
export type Conjunto = 'casos' | 'inyeccion';

export const rutaDeGrabacion = (modelo: string, conjunto: Conjunto = 'casos'): URL => {
  const prefijo = conjunto === 'casos' ? '' : `${conjunto}_`;
  return new URL(`evals/grabaciones/${prefijo}${modelo.replace(/[^a-z0-9.-]/gi, '_')}.json`, RAIZ);
};

export function leerCasos(conjunto: Conjunto = 'casos'): Caso[] {
  const casos: Caso[] = JSON.parse(readFileSync(new URL(`evals/${conjunto}.json`, RAIZ), 'utf8'));
  const ids = new Set<string>();
  for (const caso of casos) {
    if (ids.has(caso.id)) throw new Error(`Caso repetido: ${caso.id}`);
    if (!(CATEGORIAS as readonly string[]).includes(caso.esperada)) {
      throw new Error(`${caso.id}: categoría esperada desconocida «${caso.esperada}»`);
    }
    ids.add(caso.id);
  }
  return casos;
}

// Solo cuentan el id y el texto: cambiar la respuesta esperada no exige volver a grabar.
export const huellaDeLosCasos = (casos: Caso[]): string =>
  createHash('sha256').update(JSON.stringify(casos.map((c) => [c.id, c.texto]))).digest('hex').slice(0, 12);

export function leerGrabacion(modelo: string, conjunto: Conjunto = 'casos'): Grabacion {
  const ruta = rutaDeGrabacion(modelo, conjunto);
  if (!existsSync(ruta)) {
    throw new Error(`No hay grabación de ${modelo} para «${conjunto}»: pasa npm run evaluar -- ${modelo} <url> ${conjunto}`);
  }
  return JSON.parse(readFileSync(ruta, 'utf8'));
}
