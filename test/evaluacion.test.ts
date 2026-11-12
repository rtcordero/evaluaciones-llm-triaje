// La puntuación, probada con casos y respuestas inventados: sin modelo y sin red.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { puntuar, type Caso } from '../src/evaluacion.ts';

const casos: Caso[] = [
  { id: 'a', texto: 'Me habéis cobrado dos veces', esperada: 'facturacion' },
  { id: 'b', texto: 'No puedo entrar', esperada: 'acceso' },
  { id: 'c', texto: '¿Abrís los domingos?', esperada: 'otra' },
  { id: 'd', texto: 'La app se cierra', esperada: 'fallo' },
];

test('cuenta los aciertos y calcula la tasa', () => {
  const r = puntuar(casos, [
    { id: 'a', obtenida: 'facturacion' },
    { id: 'b', obtenida: 'acceso' },
    { id: 'c', obtenida: 'facturacion' },
    { id: 'd', obtenida: 'fallo' },
  ]);
  assert.equal(r.aciertos, 3);
  assert.equal(r.tasa, 0.75);
});

test('lista cada fallo con lo esperado y lo obtenido', () => {
  const r = puntuar(casos, [
    { id: 'a', obtenida: 'facturacion' },
    { id: 'b', obtenida: null },
    { id: 'c', obtenida: 'otra' },
    { id: 'd', obtenida: 'fallo' },
  ]);
  assert.deepEqual(r.fallos, [{ id: 'b', texto: 'No puedo entrar', esperada: 'acceso', obtenida: null }]);
});

test('desglosa los aciertos por categoría esperada', () => {
  const r = puntuar(casos, [
    { id: 'a', obtenida: 'otra' },
    { id: 'b', obtenida: 'acceso' },
    { id: 'c', obtenida: 'otra' },
    { id: 'd', obtenida: 'fallo' },
  ]);
  assert.deepEqual(r.porCategoria.facturacion, { total: 1, aciertos: 0 });
  assert.deepEqual(r.porCategoria.otra, { total: 1, aciertos: 1 });
});

test('falla si a algún caso le falta la respuesta', () => {
  assert.throws(() => puntuar(casos, [{ id: 'a', obtenida: 'facturacion' }]), /Faltan respuestas para: b, c, d/);
});
