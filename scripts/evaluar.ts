// Pasa los casos por un modelo real de Ollama, graba sus respuestas e imprime el resultado.
// Uso: node scripts/evaluar.ts [modelo] [url de Ollama]
import { writeFileSync } from 'node:fs';
import { ClasificacionNoDisponible } from '../src/dominio/triaje.ts';
import { ClasificadorOllama } from '../src/adaptadores/clasificador-ollama.ts';
import { huellaDeLasInstrucciones } from '../src/adaptadores/instrucciones.ts';
import { puntuar, type Respuesta } from '../src/evaluacion.ts';
import { leerCasos, rutaDeGrabacion, type Grabacion } from '../src/grabacion.ts';
import { MODELO_CLASIFICADOR } from '../src/modelo.ts';

const modelo = process.argv[2] ?? MODELO_CLASIFICADOR;
const url = process.argv[3] ?? process.env.OLLAMA_URL ?? 'http://localhost:11434';

const casos = leerCasos();
const clasificador = new ClasificadorOllama(url, modelo);
const respuestas: Respuesta[] = [];
for (const caso of casos) {
  try {
    respuestas.push({ id: caso.id, obtenida: await clasificador.clasificar(caso.texto) });
  } catch (error) {
    if (!(error instanceof ClasificacionNoDisponible)) throw error;
    respuestas.push({ id: caso.id, obtenida: null });
  }
}

const etiquetas = (await (await fetch(`${url}/api/tags`)).json()) as { models: { name: string; digest: string }[] };
const version = (await (await fetch(`${url}/api/version`)).json()) as { version: string };
const grabacion: Grabacion = {
  modelo,
  digest: etiquetas.models.find((m) => m.name === modelo)?.digest ?? 'desconocido',
  versionOllama: version.version,
  fecha: new Date().toISOString().slice(0, 10),
  huellaInstrucciones: huellaDeLasInstrucciones(),
  respuestas,
};
writeFileSync(rutaDeGrabacion(modelo), `${JSON.stringify(grabacion, null, 2)}\n`);

const r = puntuar(casos, respuestas);
console.log(`${modelo}: ${r.aciertos} de ${r.total} (${Math.round(r.tasa * 100)} %)`);
for (const [categoria, { total, aciertos }] of Object.entries(r.porCategoria)) {
  console.log(`  ${categoria.padEnd(12)} ${aciertos}/${total}`);
}
for (const f of r.fallos) {
  console.log(`  ✗ ${f.id}: «${f.texto}» → ${f.obtenida ?? 'sin categoría'} (esperada: ${f.esperada})`);
}
console.log(`Grabado en ${rutaDeGrabacion(modelo)}`);
