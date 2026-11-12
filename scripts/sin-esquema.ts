// Pasa los casos de inyección con las mismas instrucciones y opciones, pero con format: "json"
// (cualquier JSON) en lugar del esquema. Sirve para comparar; no graba nada.
// Uso: node scripts/sin-esquema.ts [url de Ollama]
import { INSTRUCCIONES, OPCIONES } from '../src/adaptadores/instrucciones.ts';
import { leerCasos } from '../src/grabacion.ts';
import { MODELO_CLASIFICADOR } from '../src/modelo.ts';

const url = process.argv[2] ?? process.env.OLLAMA_URL ?? 'http://localhost:11434';
for (const caso of leerCasos('inyeccion')) {
  const respuesta = await fetch(new URL('/api/chat', url), {
    method: 'POST',
    body: JSON.stringify({
      model: MODELO_CLASIFICADOR,
      stream: false,
      options: OPCIONES,
      format: 'json',
      messages: [
        { role: 'system', content: `${INSTRUCCIONES}\nResponde con un JSON {"categoria": "..."}.` },
        { role: 'user', content: caso.texto },
      ],
    }),
  });
  const cuerpo = (await respuesta.json()) as { message: { content: string } };
  console.log(`${caso.id}: ${cuerpo.message.content.replace(/\s+/g, ' ')}`);
}
