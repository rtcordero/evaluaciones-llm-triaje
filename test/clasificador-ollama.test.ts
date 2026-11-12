// El adaptador de Ollama contra un servidor falso: sin modelo, en milisegundos.
// Comprueba que cualquier respuesta rara acaba en ClasificacionNoDisponible, como pide el puerto.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import { ClasificacionNoDisponible } from '../src/dominio/triaje.ts';
import { ClasificadorOllama } from '../src/adaptadores/clasificador-ollama.ts';

let siguiente: { estado: number; cuerpo: string };
let servidor: Server;
let url: string;

before(async () => {
  servidor = createServer((_peticion, respuesta) => {
    respuesta.writeHead(siguiente.estado, { 'content-type': 'application/json' });
    respuesta.end(siguiente.cuerpo);
  });
  await new Promise<void>((listo) => servidor.listen(0, '127.0.0.1', listo));
  const direccion = servidor.address();
  url = `http://127.0.0.1:${typeof direccion === 'object' && direccion !== null ? direccion.port : 0}`;
});

after(() => servidor.close());

const conContenido = (contenido: string) => JSON.stringify({ message: { content: contenido } });

test('devuelve la categoría que da el modelo', async () => {
  siguiente = { estado: 200, cuerpo: conContenido('{"categoria":"acceso"}') };
  assert.equal(await new ClasificadorOllama(url, 'modelo').clasificar('No puedo entrar'), 'acceso');
});

for (const [caso, estado, cuerpo] of [
  ['una categoría fuera de la lista', 200, conContenido('{"categoria":"envios"}')],
  ['un contenido que no es JSON', 200, conContenido('facturacion')],
  ['un cuerpo vacío', 200, 'null'],
  ['un modelo no descargado (HTTP 404)', 404, '{"error":"model not found"}'],
  ['una página HTML', 200, '<html></html>'],
] as const) {
  test(`${caso} acaba en ClasificacionNoDisponible`, async () => {
    siguiente = { estado, cuerpo };
    await assert.rejects(new ClasificadorOllama(url, 'modelo').clasificar('Hola'), ClasificacionNoDisponible);
  });
}
