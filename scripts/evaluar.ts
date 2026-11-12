// Pasa los casos por un modelo real de Ollama, graba sus respuestas e imprime el resultado.
// Uso: node scripts/evaluar.ts [modelo] [url de Ollama] [casos|inyeccion]
// Si falla la conexión con Ollama, no graba nada: un fallo de red no es un fallo del modelo.
import { writeFileSync } from 'node:fs';
import { ClasificacionNoDisponible } from '../src/dominio/triaje.ts';
import { ClasificadorOllama } from '../src/adaptadores/clasificador-ollama.ts';
import { huellaDeLasInstrucciones } from '../src/adaptadores/instrucciones.ts';
import { puntuar, type Respuesta } from '../src/evaluacion.ts';
import { huellaDeLosCasos, leerCasos, rutaDeGrabacion, type Conjunto, type Grabacion } from '../src/grabacion.ts';
import { MODELO_CLASIFICADOR } from '../src/modelo.ts';

const modelo = process.argv[2] ?? MODELO_CLASIFICADOR;
const url = process.argv[3] ?? process.env.OLLAMA_URL ?? 'http://localhost:11434';
const conjunto = (process.argv[4] ?? 'casos') as Conjunto;

const etiquetas = (await (await fetch(new URL('/api/tags', url))).json()) as { models: { name: string; digest: string }[] };
const descargado = etiquetas.models.find((m) => m.name === modelo);
if (descargado === undefined) {
  console.error(`El modelo ${modelo} no está descargado: ollama pull ${modelo}`);
  process.exit(1);
}
const version = (await (await fetch(new URL('/api/version', url))).json()) as { version: string };

const casos = leerCasos(conjunto);
const clasificador = new ClasificadorOllama(url, modelo);
const respuestas: Respuesta[] = [];
// Una petición cada vez: en paralelo, Ollama puede dar resultados distintos.
for (const caso of casos) {
  try {
    respuestas.push({ id: caso.id, obtenida: await clasificador.clasificar(caso.texto) });
  } catch (error) {
    if (!(error instanceof ClasificacionNoDisponible)) throw error;
    if (error.cause !== undefined) {
      console.error(`${caso.id}: ${error.message}. No se graba nada.`);
      process.exit(1);
    }
    respuestas.push({ id: caso.id, obtenida: null });
  }
}

const grabacion: Grabacion = {
  modelo,
  digest: descargado.digest,
  versionOllama: version.version,
  fecha: new Date().toISOString().slice(0, 10),
  huellaInstrucciones: huellaDeLasInstrucciones(),
  huellaCasos: huellaDeLosCasos(casos),
  respuestas,
};
writeFileSync(rutaDeGrabacion(modelo, conjunto), `${JSON.stringify(grabacion, null, 2)}\n`);

const r = puntuar(casos, respuestas);
console.log(`${modelo}: ${r.aciertos} de ${r.total} (${Math.round(r.tasa * 100)} %)`);
for (const [categoria, { total, aciertos }] of Object.entries(r.porCategoria)) {
  console.log(`  ${categoria.padEnd(12)} ${aciertos}/${total}`);
}
for (const f of r.fallos) {
  console.log(`  ✗ ${f.id}: «${f.texto}» → ${f.obtenida ?? 'sin categoría'} (esperada: ${f.esperada})`);
}
console.log(`Grabado en evals/grabaciones/${rutaDeGrabacion(modelo, conjunto).pathname.split('/').pop()}`);
