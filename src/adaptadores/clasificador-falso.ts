// Adaptador para tests: cumple el puerto sin llamar a ningún modelo.
import { ClasificacionNoDisponible, type Categoria, type ClasificadorDeIncidencias } from '../dominio/triaje.ts';

export class ClasificadorFalso implements ClasificadorDeIncidencias {
  readonly textosRecibidos: string[] = [];
  #respuesta: Categoria | null;

  private constructor(respuesta: Categoria | null) {
    this.#respuesta = respuesta;
  }

  static queResponde(categoria: Categoria): ClasificadorFalso {
    return new ClasificadorFalso(categoria);
  }

  static caido(): ClasificadorFalso {
    return new ClasificadorFalso(null);
  }

  async clasificar(texto: string): Promise<Categoria> {
    this.textosRecibidos.push(texto);
    if (this.#respuesta === null) {
      throw new ClasificacionNoDisponible('el clasificador falso está caído');
    }
    return this.#respuesta;
  }
}
