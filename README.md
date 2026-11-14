# Evaluaciones de un clasificador con LLM

Código del artículo [Cómo probar una aplicación con LLM](https://rubentejera.com/como-probar-una-aplicacion-con-llm/).

Un clasificador de incidencias de clientes usa un modelo de lenguaje para decidir de qué va cada una. Este repositorio muestra cómo probarlo:

- **Tests del dominio** (`test/triaje.test.ts`): las reglas de negocio, con un adaptador falso. Sin modelo.
- **Casos etiquetados** (`evals/casos.json`): 30 incidencias con la categoría que decide el equipo, tres de ellas dudosas.
- **Grabaciones** (`evals/grabaciones/`): las respuestas reales de cada modelo, con su *digest*, la versión de Ollama, la fecha y la huella de las instrucciones.
- **Test de regresión** (`test/regresion.test.ts`): puntúa la grabación y falla si el modelo, los casos o las instrucciones cambiaron sin volver a grabar, o si los aciertos bajan del umbral.
- **Tests del adaptador** (`test/clasificador-ollama.test.ts`): contra un servidor HTTP falso, sin modelo.
- **Inyección de instrucciones** (`evals/inyeccion.json`, `test/inyeccion.test.ts`): 8 incidencias que intentan dar órdenes al modelo, con su grabación y su umbral; `scripts/sin-esquema.ts` las pasa sin el esquema de salida, para comparar. Código del artículo [Prompt injection](https://rubentejera.com/prompt-injection/).
- **Historial** (`evals/historial/`): las dos primeras versiones de las instrucciones y sus grabaciones.

`npm test` no llama a ningún modelo: lee las grabaciones, así que da lo mismo en cada ejecución y en cualquier máquina.

## Requisitos

- Node.js 24.22.3 o posterior (`.node-version`).
- Para volver a grabar: [Ollama](https://ollama.com/) con los modelos `llama3.2:3b` y `llama3.2:1b`.

## Uso

```bash
npm ci
npm test
```

Para volver a grabar las respuestas de un modelo, con Ollama en marcha (si falla la conexión, no se graba nada):

```bash
npm run evaluar -- llama3.2:3b http://localhost:11434
```

## Resultado grabado (12-11-2026, Ollama 0.40.16, CPU)

| Modelo | Aciertos |
| --- | --- |
| `llama3.2:3b` | 23 de 30 (77 %) |
| `llama3.2:1b` | 10 de 30 (33 %) |
| `llama3.2:3b`, casos de inyección | 6 de 8 |

## Licencia

MIT
