// Lo que se le pide al modelo. Si cambia, cambia su huella y hay que volver a grabar la evaluación.
import { createHash } from 'node:crypto';
import { CATEGORIAS } from '../dominio/triaje.ts';

export const INSTRUCCIONES = `Clasifica la incidencia de un cliente en una sola categoría:
- facturacion: cobros, facturas, devoluciones, precios, cuotas o la forma de pago.
- acceso: no puede entrar, contraseña, cuenta bloqueada o códigos de verificación.
- fallo: algo de la aplicación no funciona como debería, aunque no dé error.
- otra: solo si no es ninguna de las anteriores.`;

// La salida estructurada obliga a responder con este JSON.
export const FORMATO = {
  type: 'object',
  properties: { categoria: { type: 'string', enum: [...CATEGORIAS] } },
  required: ['categoria'],
  additionalProperties: false,
};

export function huellaDeLasInstrucciones(): string {
  return createHash('sha256').update(INSTRUCCIONES).update(JSON.stringify(FORMATO)).digest('hex').slice(0, 12);
}
