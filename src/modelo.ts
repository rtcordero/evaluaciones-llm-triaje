// El modelo que usa la aplicación y el mínimo de aciertos que se le exige en la evaluación.
export const MODELO_CLASIFICADOR = 'llama3.2:3b';

// Línea de regresión, no objetivo de calidad: es el resultado actual (23 de 30) con un pequeño margen.
// Si un cambio de instrucciones o de modelo baja de aquí, el test lo para.
export const UMBRAL_DE_ACIERTOS = 0.75;
