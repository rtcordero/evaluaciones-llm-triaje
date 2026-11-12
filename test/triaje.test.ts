// Las reglas del triaje, probadas con el adaptador falso: sin red, sin modelo y sin coste.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IncidenciaVacia, Triaje } from '../src/dominio/triaje.ts';
import { ClasificadorFalso } from '../src/adaptadores/clasificador-falso.ts';

test('manda los cobros a la cola de cobros', async () => {
  const triaje = new Triaje(ClasificadorFalso.queResponde('facturacion'));
  assert.equal(await triaje.asignarCola('Me habéis cobrado dos veces'), 'cobros');
});

test('si no hay clasificación, la incidencia va a revisión humana', async () => {
  const triaje = new Triaje(ClasificadorFalso.caido());
  assert.equal(await triaje.asignarCola('La app se cierra al pagar'), 'revision-humana');
});

test('una incidencia vacía no llega al clasificador', async () => {
  const clasificador = ClasificadorFalso.queResponde('otra');
  await assert.rejects(new Triaje(clasificador).asignarCola('   '), IncidenciaVacia);
  assert.deepEqual(clasificador.textosRecibidos, []);
});
