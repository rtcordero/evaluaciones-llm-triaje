// Adaptador real: traduce el puerto a la API de chat de Ollama, que ejecuta un modelo abierto en local.
import {
  CATEGORIAS,
  ClasificacionNoDisponible,
  type Categoria,
  type ClasificadorDeIncidencias,
} from '../dominio/triaje.ts';
import { FORMATO, INSTRUCCIONES, OPCIONES } from './instrucciones.ts';

const TIEMPO_MAXIMO_MS = 60_000;

const esCategoria = (valor: unknown): valor is Categoria =>
  typeof valor === 'string' && (CATEGORIAS as readonly string[]).includes(valor);

// Los fallos de transporte (red, tiempo, HTTP) llevan la causa en `cause`;
// los de una respuesta que no sirve, no. scripts/evaluar.ts usa esa diferencia.
export class ClasificadorOllama implements ClasificadorDeIncidencias {
  #url: string;
  #modelo: string;

  constructor(url: string, modelo: string) {
    this.#url = url;
    this.#modelo = modelo;
  }

  async clasificar(texto: string): Promise<Categoria> {
    const cuerpo = await this.#llamar(texto);
    const contenido = (cuerpo as { message?: { content?: unknown } } | null)?.message?.content;
    if (typeof contenido !== 'string') {
      throw new ClasificacionNoDisponible('la respuesta no trae contenido');
    }
    let categoria: unknown;
    try {
      categoria = JSON.parse(contenido).categoria;
    } catch {
      throw new ClasificacionNoDisponible('el contenido no es JSON');
    }
    // `format` impone el esquema, pero la validación se hace igualmente aquí.
    if (!esCategoria(categoria)) {
      throw new ClasificacionNoDisponible(`categoría desconocida: ${String(categoria)}`);
    }
    return categoria;
  }

  async #llamar(texto: string): Promise<unknown> {
    let respuesta: Response;
    try {
      respuesta = await fetch(new URL('/api/chat', this.#url), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
        body: JSON.stringify({
          model: this.#modelo,
          stream: false,
          options: OPCIONES,
          format: FORMATO,
          messages: [
            { role: 'system', content: INSTRUCCIONES },
            { role: 'user', content: texto },
          ],
        }),
      });
    } catch (error) {
      const motivo = error instanceof Error && error.name === 'TimeoutError' ? 'Ollama tarda demasiado' : 'Ollama no responde';
      throw new ClasificacionNoDisponible(motivo, { cause: error });
    }
    if (!respuesta.ok) {
      const detalle = await respuesta.text().catch(() => '');
      throw new ClasificacionNoDisponible(`Ollama respondió HTTP ${respuesta.status}`, { cause: new Error(detalle) });
    }
    try {
      return await respuesta.json();
    } catch (error) {
      throw new ClasificacionNoDisponible('la respuesta HTTP no es JSON', { cause: error });
    }
  }
}
