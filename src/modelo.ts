// El modelo que usa la aplicación, su versión exacta y el mínimo de aciertos que se le exige.
export const MODELO_CLASIFICADOR = 'llama3.2:3b';

// El digest identifica la versión exacta del modelo descargado. Si un `ollama pull` trae otra,
// el test de regresión pide volver a grabar.
export const DIGEST_DEL_MODELO = 'a80c4f17acd55265feec403c7aef86be0c25983ab279d83f3bcd3abbcb5b8b72';

// Línea de regresión, no objetivo de calidad. Con 30 casos, el 73 % exige 22 aciertos:
// el resultado actual (23) con un caso de margen. Si un cambio de instrucciones o de modelo
// baja de aquí, el test lo para.
export const UMBRAL_DE_ACIERTOS = 0.73;
