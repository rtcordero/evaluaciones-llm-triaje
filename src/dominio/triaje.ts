// El hexágono: las reglas del triaje y el puerto que necesitan. No importa nada de fuera.
// Es el mismo dominio del artículo «Un LLM detrás de un adaptador».

export const CATEGORIAS = ['facturacion', 'acceso', 'fallo', 'otra'] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export type Cola = 'cobros' | 'soporte-tecnico' | 'atencion-general' | 'revision-humana';

// Error del dominio: el clasificador no ha podido dar una categoría válida.
export class ClasificacionNoDisponible extends Error {
  constructor(motivo: string, opciones?: { cause?: unknown }) {
    super(`No se ha podido clasificar: ${motivo}`, opciones);
    this.name = 'ClasificacionNoDisponible';
  }
}

// Error del dominio: una incidencia sin texto no se clasifica.
export class IncidenciaVacia extends Error {
  constructor() {
    super('La incidencia no tiene texto');
    this.name = 'IncidenciaVacia';
  }
}

// Puerto de salida: clasificar() devuelve una de las CATEGORIAS o lanza ClasificacionNoDisponible.
export interface ClasificadorDeIncidencias {
  clasificar(texto: string): Promise<Categoria>;
}

const COLA_DE: Record<Categoria, Cola> = {
  facturacion: 'cobros',
  acceso: 'soporte-tecnico',
  fallo: 'soporte-tecnico',
  otra: 'atencion-general',
};

export class Triaje {
  #clasificador: ClasificadorDeIncidencias;

  constructor(clasificador: ClasificadorDeIncidencias) {
    this.#clasificador = clasificador;
  }

  async asignarCola(texto: string): Promise<Cola> {
    const limpio = texto.trim();
    if (limpio === '') {
      throw new IncidenciaVacia();
    }
    try {
      return COLA_DE[await this.#clasificador.clasificar(limpio)];
    } catch (error) {
      // Regla de negocio: si no hay clasificación, la decide una persona.
      if (error instanceof ClasificacionNoDisponible) {
        return 'revision-humana';
      }
      throw error;
    }
  }
}
