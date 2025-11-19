/**
 * Maneja el streaming del chat y tools
 */

import { streamText, tool, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { searchBooks, getBookDetails } from '../tools/books';
import { addToReadingList, getReadingList } from '../tools/reading-list';
import { markAsRead, getReadingStats } from '../tools/stats';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log('advisor POST received messages:', JSON.stringify(messages || []).slice(0, 2000));

    // MOCK MODE: Return a streaming (chunked) response when USE_MOCK_ADVISOR=true
    if (process.env.USE_MOCK_ADVISOR === 'true') {
      console.log('⚠️ USE_MOCK_ADVISOR is enabled — returning mock streaming response');
      const lastMessage = messages[messages.length - 1]?.content || '';
      const mockResponse = `¡Hola! Estoy en modo de desarrollo (mock).\n\nRecibí tu mensaje: "${lastMessage}"\n\nNormalmente buscaría libros reales usando las tools disponibles, pero ahora estoy usando respuestas simuladas porque el proveedor de IA (OpenRouter) tiene problemas de cuota/límites.\n\nPara probar las tools en producción:\n1. Obtén una API key válida en https://openrouter.ai/settings/keys\n2. Actualiza OPENROUTER_API_KEY en .env.local\n3. Cambia USE_MOCK_ADVISOR=false (o elimínalo)\n4. Reinicia el servidor de desarrollo\n\n¿Puedo ayudarte con algo más mientras tanto? 📚`;

      const encoder = new TextEncoder();
      // Break the mock response into readable parts to emulate streaming
      const parts = mockResponse.split(/(\n\n|\.|\?|!)/).filter(Boolean).map((s) => s.trim() + ' ');

      const stream = new ReadableStream({
        async start(controller) {
          try {
            for (const part of parts) {
              controller.enqueue(encoder.encode(part));
              // small delay emulating streaming behavior
              await new Promise((res) => setTimeout(res, 80));
            }
          } catch (e) {
            controller.error(e);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // If GEMINI is configured, call Gemini REST generateContent (non-streaming) using API key
    if (process.env.LLM_PROVIDER === 'gemini' || process.env.GEMINI_API_KEY) {
      const geminiKey = process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;
      const geminiModel = process.env.GEMINI_MODEL || 'models/gemini-2.5-flash';

      const contents = (messages || []).map((m: any) => {
        const role = m.role === 'assistant' ? 'model' : 'user';
        return { role, parts: [{ text: m.content || '' }] };
      });

      // Try to use the official SDK first (@google/genai or @google-ai/generativelanguage)
      try {
        let genaiPkg: any = null;
        try {
          genaiPkg = await import('@google/genai');
        } catch (e) {
          try {
            genaiPkg = await import('@google-ai/generativelanguage');
          } catch (e2) {
            genaiPkg = null;
          }
        }

        if (genaiPkg) {
          console.log('Using Google GenAI SDK for Gemini');
          // SDK shapes vary; attempt to instantiate client in a few ways
          let ClientClass = genaiPkg.GoogleGenAI || genaiPkg.default?.GoogleGenAI || genaiPkg.Client || genaiPkg.default;
          if (!ClientClass && typeof genaiPkg === 'function') ClientClass = genaiPkg;

          if (ClientClass) {
            // Some SDKs read GEMINI_API_KEY from env automatically; pass explicitly if supported
            let client: any;
            try {
              client = new ClientClass({ apiKey: process.env.GEMINI_API_KEY });
            } catch (e) {
              try {
                client = new ClientClass();
              } catch (e2) {
                client = null;
              }
            }

            if (client && client.models && typeof client.models.generateContent === 'function') {
              try {
                const sdkResp = await client.models.generateContent({ model: geminiModel.replace(/^models\//, ''), contents });
                // SDKs vary: prefer .text, then .candidates
                const text = sdkResp?.text || sdkResp?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || JSON.stringify(sdkResp);
                return new Response(text, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
              } catch (err) {
                console.error('GenAI SDK generateContent failed, falling back to REST:', err);
                // fall through to REST fallback
              }
            }
          }
        }
      } catch (sdkErr) {
        console.warn('GenAI SDK not usable or not installed, will use REST fallback', sdkErr);
      }

      // If GEMINI_STREAM=true, use SSE streaming endpoint and convert SSE to plain text chunks
      if (process.env.GEMINI_STREAM === 'true') {
        const url = `https://generativelanguage.googleapis.com/v1beta/${geminiModel}:streamGenerateContent`;
        console.log('Calling Gemini streamGenerateContent', url);

        try {
          const resp = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': String(geminiKey),
            },
            body: JSON.stringify({ contents }),
          });

          if (!resp.ok || !resp.body) {
            const text = await resp.text();
            console.error('Gemini stream returned error', resp.status, text);
            return new Response(JSON.stringify({ error: text }), { status: resp.status, headers: { 'Content-Type': 'application/json' } });
          }

          const reader = resp.body.getReader();
          const decoder = new TextDecoder();
          const encoder = new TextEncoder();

          let buffer = '';

          const stream = new ReadableStream({
            async start(controller) {
              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  buffer += decoder.decode(value, { stream: true });

                  // SSE events are separated by double newlines
                  const parts = buffer.split(/\r?\n\r?\n/);
                  buffer = parts.pop() || '';

                  for (const part of parts) {
                    // each part may contain multiple lines like 'data: {...}\n'
                    const lines = part.split(/\r?\n/);
                    for (const line of lines) {
                      if (!line.startsWith('data:')) continue;
                      const payload = line.replace(/^data:\s*/, '');
                      if (!payload || payload === '[DONE]') continue;
                      try {
                        const obj = JSON.parse(payload);
                        const textParts = obj?.candidates?.[0]?.content?.parts || [];
                        const text = textParts.map((p: any) => p.text).join('');
                        if (text) controller.enqueue(encoder.encode(text));
                      } catch (e) {
                        // ignore parse errors for non-JSON SSE fields
                      }
                    }
                  }
                }
              } catch (e) {
                controller.error(e);
              } finally {
                controller.close();
              }
            },
          });

          return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
        } catch (err) {
          console.error('Error calling Gemini streamGenerateContent', err);
          return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
      }

      // Fallback: non-streaming generateContent
      const url = `https://generativelanguage.googleapis.com/v1beta/${geminiModel}:generateContent`;
      console.log('Calling Gemini generateContent', url);
      try {
        const resp = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': String(geminiKey),
          },
          body: JSON.stringify({ contents }),
        });

        const text = await resp.text();
        if (!resp.ok) {
          console.error('Gemini API returned error', resp.status, text);
          return new Response(JSON.stringify({ error: text }), { status: resp.status, headers: { 'Content-Type': 'application/json' } });
        }

        let data: any;
        try {
          data = JSON.parse(text);
        } catch (e) {
          // If parsing fails, return raw text as fallback
          console.warn('Gemini response not JSON, returning raw text');
          return new Response(text, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
        }

        // Log a trimmed preview of the provider response for debugging
        try {
          console.log('Gemini generateContent response preview:', JSON.stringify(data).slice(0, 2000));
        } catch (e) {
          /* ignore logging errors */
        }

        // Robust extraction of text from multiple possible shapes
        const candidate = data?.candidates?.[0] || data?.responses?.[0] || null;
        let joined = '';
        if (candidate) {
          const parts = candidate?.content?.parts || candidate?.content?.text || [];
          if (Array.isArray(parts) && parts.length > 0) {
            joined = parts.map((p: any) => p?.text ?? String(p)).join('');
          } else if (typeof candidate?.content?.text === 'string' && candidate.content.text.trim()) {
            joined = candidate.content.text;
          } else if (typeof candidate === 'string' && candidate.trim()) {
            joined = candidate;
          }
        }

        // Try some other fallback shapes
        if (!joined) {
          if (Array.isArray(data?.outputs) && data.outputs.length) {
            joined = data.outputs.map((o: any) => o?.text ?? '').join('\n');
          }
        }

        if (!joined) {
          // Nothing useful extracted — return a helpful diagnostic message instead of blank
          const preview = JSON.stringify(data).slice(0, 2000);
          const msg = 'Lo siento — el modelo respondió sin texto útil. Respuesta cruda: ' + preview;
          console.warn('Empty model text, returning diagnostic message');
          return new Response(msg, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
        }

        return new Response(joined, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      } catch (err) {
        console.error('Error calling Gemini API', err);
        return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }

    // Ensure we have an API key for the provider
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY is not set; cannot call provider');
      return new Response(JSON.stringify({ error: 'AI provider not configured (OPENROUTER_API_KEY missing).' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Configure OpenRouter (OpenAI-compatible) provider using @ai-sdk/openai.
    const openRouterProvider = createOpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    });

    // Use the provider to get a model instance that is compatible with streamText
    const model = openRouterProvider.responses(process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku');

    // Definir las tools con la firma que espera la librería (inputSchema + execute(input, options))
    const tools = {
      searchBooks: tool({
        description:
          'Busca libros en Google Books por título, autor, tema o palabras clave. Usa esta tool cuando el usuario pida recomendaciones, busque libros específicos, o explore géneros.',
        inputSchema: z.object({
          query: z.string().describe('Término de búsqueda: título, autor, género, o tema'),
          maxResults: z.number().optional().default(10).describe('Número máximo de resultados'),
          orderBy: z.string().optional().default('relevance').describe('Orden: relevance o newest'),
        }),
        execute: async (input, _options) => {
          return await searchBooks(input as any);
        },
      }),

      getBookDetails: tool({
        description:
          'Obtiene información detallada completa de un libro específico usando su Google Books ID. Úsala cuando el usuario pregunte por detalles, descripción, páginas, o calificaciones de un libro.',
        inputSchema: z.object({
          bookId: z.string().describe('ID único del libro desde Google Books'),
        }),
        execute: async (input, _options) => {
          return await getBookDetails(input as any);
        },
      }),

      addToReadingList: tool({
        description:
          'Agrega un libro a la lista "Quiero Leer" del usuario. Úsala cuando el usuario quiera guardar un libro para leer después.',
        inputSchema: z.object({
          bookId: z.string().describe('ID único del libro desde Google Books'),
          priority: z.enum(['high', 'medium', 'low']).optional().describe('Prioridad de lectura'),
          notes: z.string().optional().describe('Notas personales sobre el libro'),
        }),
        execute: async (input, _options) => {
          return await addToReadingList(input as any);
        },
      }),

      getReadingList: tool({
        description:
          'Obtiene la lista de libros que el usuario quiere leer. Úsala cuando pregunte qué libros tiene pendientes, su lista, o qué falta leer.',
        inputSchema: z.object({
          filter: z.string().optional().describe('Filtro por prioridad: high, medium, low'),
          limit: z.number().optional().default(50).describe('Número máximo de resultados'),
        }),
        execute: async (input, _options) => {
          return await getReadingList(input as any);
        },
      }),

      markAsRead: tool({
        description:
          'Marca un libro como leído y opcionalmente agrega rating (1-5) y review. Úsala cuando el usuario termine de leer un libro o quiera dar su opinión.',
        inputSchema: z.object({
          bookId: z.string().describe('ID único del libro desde Google Books'),
          rating: z.number().min(1).max(5).optional().describe('Calificación de 1 a 5 estrellas'),
          review: z.string().optional().describe('Review personal del usuario'),
          dateFinished: z.string().optional().describe('Fecha de finalización (formato ISO)'),
        }),
        execute: async (input, _options) => {
          return await markAsRead(input as any);
        },
      }),

      getReadingStats: tool({
        description:
          'Genera estadísticas y analytics completos de los hábitos de lectura del usuario. Úsala cuando pregunte por estadísticas, cuántos libros ha leído, su género favorito, etc.',
        inputSchema: z.object({
          period: z.enum(['all-time', 'year', 'month', 'week']).describe('Periodo de tiempo para las estadísticas'),
          groupBy: z.enum(['genre', 'author', 'year']).optional().describe('Agrupación de resultados'),
        }),
        execute: async (input, _options) => {
          return await getReadingStats(input as any);
        },
      }),
    };

    // Quick non-stream check to surface provider errors early (e.g. quota/403)
    console.log('Checking provider availability with a small generateText call...');
    try {
      await generateText({ model, messages, maxRetries: 0, maxOutputTokens: 1 });
    } catch (err) {
      console.error('Provider generateText check failed:', err);
      const errAny = err as any;
      const status = errAny?.statusCode || 500;
      const body = errAny?.responseBody || errAny?.message || String(err);
      try {
        const parsed = typeof body === 'string' ? JSON.parse(body) : body;
        const message = parsed?.error?.message || parsed?.message || String(parsed);
        return new Response(JSON.stringify({ error: message }), { status, headers: { 'Content-Type': 'application/json' } });
      } catch (parseErr) {
        return new Response(JSON.stringify({ error: String(body) }), { status, headers: { 'Content-Type': 'application/json' } });
      }
    }

    console.log('streamText: starting with model', String(process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku'));
    const result = await streamText({
      model,
      messages,
      tools,
      system: `Eres un asistente experto en recomendación de libros llamado "Book Advisor". Tu trabajo es:\n- Ayudar a los usuarios a descubrir libros que les gusten\n- Recomendar libros basándote en sus gustos y preferencias\n- Ayudarles a gestionar sus listas de lectura\n- Proporcionar estadísticas útiles sobre sus hábitos de lectura\n- Ser amigable, entusiasta sobre libros, y conversacional\n\nSIEMPRE usa las tools disponibles para buscar información real de libros. Nunca inventes información sobre libros.\n\nCuando encuentres un libro interesante, ofrece agregarlo a su lista de lectura. Sé proactivo pero no agresivo.`,
      onError: (event) => {
        console.error('streamText onError', event);
      },
      onFinish: (event) => {
        console.log('streamText finished:', { finishReason: event.finishReason, totalUsage: event.totalUsage });
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error en API de advisor:', error);
    return new Response(JSON.stringify({ error: 'Error del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}