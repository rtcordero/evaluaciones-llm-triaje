// Una grabación guarda las respuestas reales de un modelo a los casos, con lo necesario para saber
// si sigue valiendo: qué modelo exacto, qué instrucciones y cuándo.
import { readFileSync } from 'node:fs';
import type { Caso, Respuesta } from './evaluacion.ts';

export type Grabacion = {
  modelo: string;
  digest: string;
  versionOllama: string;
  fecha: string;
  huellaInstrucciones: string;
  respuestas: Respuesta[];
};

export const rutaDeGrabacion = (modelo: string): string =>
  `evals/grabaciones/${modelo.replace(/[^a-z0-9.-]/gi, '_')}.json`;

export const leerCasos = (): Caso[] => JSON.parse(readFileSync('evals/casos.json', 'utf8'));

export const leerGrabacion = (modelo: string): Grabacion => JSON.parse(readFileSync(rutaDeGrabacion(modelo), 'utf8'));
