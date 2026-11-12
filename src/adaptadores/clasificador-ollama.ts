// Adaptador real: traduce el puerto a la API de chat de Ollama, que ejecuta un modelo abierto en local.
import {
  CATEGORIAS,
  ClasificacionNoDisponible,
  type Categoria,
  type ClasificadorDeIncidencias,
} from '../dominio/triaje.ts';
import { FORMATO, INSTRUCCIONES } from './instrucciones.ts';

const TIEMPO_MAXIMO_MS = 60_000;

const esCategoria = (valor: unknown): valor is Categoria =>
  typeof valor === 'string' && (CATEGORIAS as readonly string[]).includes(valor);

export class ClasificadorOllama implements ClasificadorDeIncidencias {
  #url: string;
  #modelo: string;

  constructor(url: string, modelo: string) {
    this.#url = url;
    this.#modelo = modelo;
  }

  async clasificar(texto: string): Promise<Categoria> {
    let cuerpo: unknown;
    try {
      const respuesta = await fetch(`${this.#url}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
        body: JSON.stringify({
          model: this.#modelo,
          stream: false,
          // Temperatura 0 y semilla fija: la misma entrada da la misma salida en la misma máquina.
          options: { temperature: 0, seed: 42 },
          format: FORMATO,
          messages: [
            { role: 'system', content: INSTRUCCIONES },
            { role: 'user', content: texto },
          ],
        }),
      });
      if (!respuesta.ok) {
        throw new Error(`HTTP ${respuesta.status}`);
      }
      cuerpo = await respuesta.json();
    } catch (error) {
      throw new ClasificacionNoDisponible('Ollama no responde', { cause: error });
    }
    return this.#leerCategoria(cuerpo);
  }

  #leerCategoria(cuerpo: unknown): Categoria {
    const contenido = (cuerpo as { message?: { content?: unknown } }).message?.content;
    let categoria: unknown;
    try {
      categoria = JSON.parse(String(contenido)).categoria;
    } catch {
      throw new ClasificacionNoDisponible('la respuesta no es JSON');
    }
    if (!esCategoria(categoria)) {
      throw new ClasificacionNoDisponible(`categoría desconocida: ${String(categoria)}`);
    }
    return categoria;
  }
}
