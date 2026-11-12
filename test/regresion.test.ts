// La evaluación del modelo que usa la aplicación, sobre sus respuestas grabadas.
// No llama al modelo: el resultado es el mismo en cada ejecución y en cualquier máquina.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { huellaDeLasInstrucciones } from '../src/adaptadores/instrucciones.ts';
import { puntuar } from '../src/evaluacion.ts';
import { leerCasos, leerGrabacion } from '../src/grabacion.ts';
import { MODELO_CLASIFICADOR, UMBRAL_DE_ACIERTOS } from '../src/modelo.ts';

const casos = leerCasos();
const grabacion = leerGrabacion(MODELO_CLASIFICADOR);

test('la grabación se hizo con las instrucciones actuales', () => {
  assert.equal(
    grabacion.huellaInstrucciones,
    huellaDeLasInstrucciones(),
    'Las instrucciones han cambiado desde la grabación: vuelve a pasar npm run evaluar',
  );
});

test(`${MODELO_CLASIFICADOR} acierta al menos el ${UMBRAL_DE_ACIERTOS * 100} % de los casos`, () => {
  const r = puntuar(casos, grabacion.respuestas);
  const detalle = r.fallos.map((f) => `${f.id}: ${f.obtenida ?? 'sin categoría'} (esperada ${f.esperada})`).join('\n');
  assert.ok(r.tasa >= UMBRAL_DE_ACIERTOS, `${r.aciertos} de ${r.total}. Fallos:\n${detalle}`);
});
