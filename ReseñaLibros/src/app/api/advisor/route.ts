/**
 * API Route para el AI Advisor con Gemini Function Calling
 * Usando API REST directa según documentación oficial
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchBooks, getBookDetails } from '../tools/books';
import { addToReadingList, getReadingList } from '../tools/reading-list';
import { markAsRead, getReadingStats } from '../tools/stats';

export const maxDuration = 30;

// Definición de las herramientas (tools) para Gemini Function Calling
const tools = [
  {
    name: 'searchBooks',
    description: 'Busca libros en Google Books API por título, autor, tema, o palabras clave.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'Término de búsqueda' },
        maxResults: { type: 'NUMBER', description: 'Máximo de resultados (default: 10)' },
        orderBy: { type: 'STRING', description: 'Orden: relevance o newest' },
      },
      required: ['query'],
    },
  },
  {
    name: 'getBookDetails',
    description: 'Obtiene detalles de un libro específico por su Google Books ID.',
    parameters: {
      type: 'OBJECT',
      properties: {
        bookId: { type: 'STRING', description: 'ID único de Google Books' },
      },
      required: ['bookId'],
    },
  },
  {
    name: 'addToReadingList',
    description: 'Agrega un libro a la lista "Quiero Leer" del usuario.',
    parameters: {
      type: 'OBJECT',
      properties: {
        bookId: { type: 'STRING', description: 'ID único de Google Books' },
        priority: { type: 'STRING', description: 'Prioridad: high, medium, low' },
        notes: { type: 'STRING', description: 'Notas personales' },
      },
      required: ['bookId'],
    },
  },
  {
    name: 'getReadingList',
    description: 'Recupera la lista de libros pendientes por leer.',
    parameters: {
      type: 'OBJECT',
      properties: {
        filter: { type: 'STRING', description: 'Filtro por prioridad' },
        limit: { type: 'NUMBER', description: 'Máximo de resultados' },
      },
      required: [],
    },
  },
  {
    name: 'markAsRead',
    description: 'Marca un libro como leído con rating y review opcionales.',
    parameters: {
      type: 'OBJECT',
      properties: {
        bookId: { type: 'STRING', description: 'ID único de Google Books' },
        rating: { type: 'NUMBER', description: 'Calificación 1-5' },
        review: { type: 'STRING', description: 'Review personal' },
        dateFinished: { type: 'STRING', description: 'Fecha ISO' },
      },
      required: ['bookId'],
    },
  },
  {
    name: 'getReadingStats',
    description: 'Genera estadísticas de hábitos de lectura del usuario.',
    parameters: {
      type: 'OBJECT',
      properties: {
        period: { type: 'STRING', description: 'Periodo: all-time, year, month, week' },
        groupBy: { type: 'STRING', description: 'Agrupación: genre, author, year' },
      },
      required: ['period'],
    },
  },
];

const functionMap: Record<string, Function> = {
  searchBooks,
  getBookDetails,
  addToReadingList,
  getReadingList,
  markAsRead,
  getReadingStats,
};

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY no configurada' }, { status: 500 });
    }

    // Convertir al formato Gemini
    const contents = messages
      .filter((m: any) => m.role !== 'system' && m.content?.trim())
      .map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content.trim() }],
      }));

    if (contents.length === 0) {
      return NextResponse.json({ error: 'No hay mensajes válidos' }, { status: 400 });
    }

    const systemInstruction = {
      parts: [{
        text: `Eres "Book Advisor", un asistente experto en libros. Ayudas a usuarios a descubrir libros, gestionar listas de lectura y ver estadísticas.

IMPORTANTE: Usa las funciones disponibles cuando sea necesario:
- searchBooks: buscar libros
- getBookDetails: ver detalles
- addToReadingList: agregar a lista
- getReadingList: ver lista
- markAsRead: marcar leído
- getReadingStats: ver estadísticas

Sé amigable y conversacional.`
      }]
    };

    // Usar API REST de Gemini v1beta
    const model = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const requestBody = {
      contents,
      systemInstruction,
      tools: [{ function_declarations: tools }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    };

    console.log('Calling Gemini API...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini error:', response.status, errorText);
      return NextResponse.json(
        { error: `Gemini API error: ${errorText}` },
        { status: response.status }
      );
    }

    const initialData = await response.json();
    console.log('Gemini response received');

    // Manejar function calling iterativamente
    let currentContents = [...contents];
    let currentData = initialData;
    let iterations = 0;
    const maxIterations = 5;
    let finalText = '';

    while (iterations < maxIterations) {
      iterations++;
      const candidate = currentData.candidates?.[0];
      if (!candidate) break;

      const parts = candidate.content?.parts || [];
      let hasFunctionCalls = false;

      for (const part of parts) {
        if (part.text) {
          finalText += part.text;
        }

        if (part.functionCall) {
          hasFunctionCalls = true;
          const funcName = part.functionCall.name;
          const funcArgs = part.functionCall.args || {};

          console.log(`Executing: ${funcName}`, funcArgs);

          try {
            const func = functionMap[funcName];
            if (!func) throw new Error(`Function not found: ${funcName}`);

            const result = await func(funcArgs);
            console.log(`Result from ${funcName}:`, JSON.stringify(result).slice(0, 300));

            // Gemini espera que response sea un objeto, no un array
            // Si el resultado es un array, envolverlo en un objeto
            const responseData = Array.isArray(result)
              ? { items: result, count: result.length }
              : result;

            // Preparar siguiente llamada con resultado
            currentContents.push({
              role: 'model',
              parts: [{ functionCall: part.functionCall }],
            });

            currentContents.push({
              role: 'user',
              parts: [{
                functionResponse: {
                  name: funcName,
                  response: responseData,
                },
              }],
            });

            // Llamar de nuevo a Gemini con el resultado
            const followUpResponse = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': geminiKey,
              },
              body: JSON.stringify({
                contents: currentContents,
                systemInstruction,
                tools: [{ function_declarations: tools }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
              }),
            });

            if (followUpResponse.ok) {
              currentData = await followUpResponse.json();
              console.log('Follow-up response received');
              // No hacer break aquí - continuar el loop para procesar la respuesta
            } else {
              const errorText = await followUpResponse.text();
              console.error('Follow-up error:', errorText);
              hasFunctionCalls = false;
              break;
            }

          } catch (error: any) {
            console.error(`Error in ${funcName}:`, error);
            finalText += `\n\n[Error: ${error.message}]`;
            hasFunctionCalls = false;
            break;
          }
        }
      }

      if (!hasFunctionCalls) {
        // No hay más funciones para llamar, salir del loop
        break;
      }
    }

    if (!finalText.trim()) {
      finalText = 'Lo siento, no pude procesar tu solicitud.';
    }

    return new NextResponse(finalText, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error procesando solicitud', details: error.message },
      { status: 500 }
    );
  }
}
