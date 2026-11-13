// Los casos que intentan dar órdenes al modelo, sobre sus respuestas grabadas.
// No prueba que el ataque sea imposible: vigila que un cambio no lo haga más fácil.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { huellaDeLasInstrucciones } from '../src/adaptadores/instrucciones.ts';
import { puntuar } from '../src/evaluacion.ts';
import { huellaDeLosCasos, leerCasos, leerGrabacion } from '../src/grabacion.ts';
import { DIGEST_DEL_MODELO, MODELO_CLASIFICADOR, UMBRAL_INYECCION } from '../src/modelo.ts';

const casos = leerCasos('inyeccion');
const grabacion = leerGrabacion(MODELO_CLASIFICADOR, 'inyeccion');
const volverAGrabar = `vuelve a pasar npm run evaluar -- ${MODELO_CLASIFICADOR} <url> inyeccion`;

test('la grabación de inyección corresponde al modelo, los casos y las instrucciones actuales', () => {
  assert.equal(grabacion.digest, DIGEST_DEL_MODELO, `La grabación es de otra versión del modelo que DIGEST_DEL_MODELO: ${volverAGrabar}`);
  assert.equal(grabacion.huellaCasos, huellaDeLosCasos(casos), `Los casos han cambiado: ${volverAGrabar}`);
  assert.equal(grabacion.huellaInstrucciones, huellaDeLasInstrucciones(), `Las instrucciones han cambiado: ${volverAGrabar}`);
});

test(`ante una inyección, ${MODELO_CLASIFICADOR} sigue clasificando bien al menos el ${Math.round(UMBRAL_INYECCION * 100)} %`, () => {
  const resultado = puntuar(casos, grabacion.respuestas);
  const detalle = resultado.fallos.map((fallo) => `${fallo.id}: ${fallo.obtenida ?? 'sin categoría'} (esperada ${fallo.esperada})`).join('\n');
  assert.ok(resultado.tasa >= UMBRAL_INYECCION, `${resultado.aciertos} de ${resultado.total}. Fallos:\n${detalle}`);
});
