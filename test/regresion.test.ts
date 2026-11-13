// La evaluación del modelo que usa la aplicación, sobre sus respuestas grabadas.
// No llama al modelo: el resultado es el mismo en cada ejecución y en cualquier máquina.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { huellaDeLasInstrucciones } from '../src/adaptadores/instrucciones.ts';
import { puntuar } from '../src/evaluacion.ts';
import { huellaDeLosCasos, leerCasos, leerGrabacion } from '../src/grabacion.ts';
import { DIGEST_DEL_MODELO, MODELO_CLASIFICADOR, UMBRAL_DE_ACIERTOS } from '../src/modelo.ts';

const casos = leerCasos();
const grabacion = leerGrabacion(MODELO_CLASIFICADOR);
const volverAGrabar = `vuelve a pasar npm run evaluar -- ${MODELO_CLASIFICADOR}`;

test('la grabación corresponde al modelo, los casos y las instrucciones actuales', () => {
  assert.equal(grabacion.digest, DIGEST_DEL_MODELO, `La grabación es de otra versión del modelo que DIGEST_DEL_MODELO: ${volverAGrabar}`);
  assert.equal(grabacion.huellaCasos, huellaDeLosCasos(casos), `Los casos han cambiado: ${volverAGrabar}`);
  assert.equal(grabacion.huellaInstrucciones, huellaDeLasInstrucciones(), `Las instrucciones han cambiado: ${volverAGrabar}`);
});

test(`${MODELO_CLASIFICADOR} acierta al menos el ${Math.round(UMBRAL_DE_ACIERTOS * 100)} % de los casos`, () => {
  const resultado = puntuar(casos, grabacion.respuestas);
  const detalle = resultado.fallos.map((fallo) => `${fallo.id}: ${fallo.obtenida ?? 'sin categoría'} (esperada ${fallo.esperada})`).join('\n');
  assert.ok(resultado.tasa >= UMBRAL_DE_ACIERTOS, `${resultado.aciertos} de ${resultado.total}. Fallos:\n${detalle}`);
});
