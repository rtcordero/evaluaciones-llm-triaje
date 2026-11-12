# Historial de instrucciones

Las dos primeras versiones de las instrucciones y sus grabaciones, tal como se hicieron el 12-11-2026 (Ollama 0.40.16, mismos modelos y opciones). Son la referencia de las cifras del artículo; los tests no las leen. Su `huellaInstrucciones` es del formato anterior, que solo cubría las instrucciones y el esquema.

| Versión | `llama3.2:3b` | `llama3.2:1b` |
| --- | --- | --- |
| v1 | 22 de 30 | 10 de 30 |
| v2 | 20 de 30 | — |
| v3 (la actual, en `src/adaptadores/instrucciones.ts`) | 23 de 30 | 10 de 30 |

Para reproducir una versión, copia su texto en `INSTRUCCIONES` y pasa `npm run evaluar`.
