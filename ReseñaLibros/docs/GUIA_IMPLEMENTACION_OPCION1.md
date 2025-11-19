# 🚀 Guía de Implementación: Opción 1 - Integración Modular

## 📋 Resumen de la Estrategia

Vamos a mantener tu proyecto de reseñas intacto y agregar un módulo completamente nuevo para el AI Book Advisor. Esto minimiza riesgos y te permite probar ambas funcionalidades lado a lado.

---

## 🎯 Objetivo Final

Crear un sistema donde los usuarios puedan:
1. **Usar la búsqueda tradicional** (tu código actual - sin cambios)
2. **Usar el AI Advisor** accediendo a `/advisor` donde pueden tener conversaciones inteligentes
3. **Gestionar listas de lectura** personalizadas
4. **Ver estadísticas** de sus hábitos de lectura

---

## 📦 PASO 1: Instalar Dependencias Necesarias

### Instalación de Paquetes

Necesitas agregar las siguientes dependencias para el AI Advisor:

```bash
npm install ai @ai-sdk/openai zod
```

**Explicación de cada paquete:**
- `ai`: SDK de Vercel para integrar LLMs con streaming y tool calling
- `@ai-sdk/openai`: Provider para OpenRouter (compatible con OpenAI)
- `zod`: Para validación de esquemas de tools (requerido por el AI SDK)

### Verificar Instalación

```bash
# Verifica que se agregaron correctamente
npm list ai @ai-sdk/openai zod
```

---

## 🔐 PASO 2: Configurar Variables de Entorno

### Crear `.env.local`

Crea un archivo `.env.local` en la raíz del proyecto (si no existe):

```bash
# En Windows PowerShell
copy .env .env.local
```

Agrega las siguientes variables al archivo `.env.local`:

```env
# Base de datos existente (mantener)
DATABASE_URL="file:./dev.db"

# OpenRouter API (NUEVO - obtener en https://openrouter.ai)
OPENROUTER_API_KEY=sk-or-v1-tu-clave-aqui
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=anthropic/claude-3-haiku

# Google Books API (si quieres usar key, opcional)
GOOGLE_BOOKS_API_KEY=tu-clave-opcional

# Configuración de rate limiting (opcional)
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

### ⚠️ Seguridad Crítica

**IMPORTANTE:** Nunca subas `.env.local` a Git. Verifica que `.gitignore` lo incluya:

```gitignore
# .gitignore
.env*.local
```

### Obtener API Keys

1. **OpenRouter**: Ve a https://openrouter.ai, crea cuenta, obtén API key
2. **Google Books**: La API actual funciona sin key, pero puedes obtenerla en https://console.cloud.google.com

---

## 🗄️ PASO 3: Extender Schema de Base de Datos

### Modificar `prisma/schema.prisma`

Agrega estos modelos al final del archivo antes del `enum VoteType`:

```prisma
// Modelo para lista "Quiero Leer"
model ReadingListItem {
  id          String   @id @default(cuid())
  bookId      String
  priority    String?  // 'high', 'medium', 'low'
  notes       String?
  addedAt     DateTime @default(now())
  
  book        Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  
  @@unique([bookId])  // Un libro solo una vez en la lista
  @@map("reading_list_items")
}

// Modelo para libros leídos con reviews
model ReadBook {
  id           String   @id @default(cuid())
  bookId       String
  rating       Int?     // 1-5 estrellas
  review       String?
  dateFinished DateTime @default(now())
  
  book         Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)
  
  @@unique([bookId])  // Un libro solo una vez como leído
  @@map("read_books")
}
```

### Actualizar el Modelo Book

Agrega estas relaciones al modelo `Book` existente:

```prisma
model Book {
  id          String @id
  title       String
  authors     String
  publisher   String?
  publishedDate String?
  description String?
  imageUrl    String?
  pageCount   Int?
  categories  String
  language    String?
  previewLink String?
  infoLink    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // RELACIONES EXISTENTES
  reviews     Review[]
  
  // NUEVAS RELACIONES PARA AI ADVISOR
  readingListItems ReadingListItem[]
  readBooks        ReadBook[]
  
  @@map("books")
}
```

### Crear y Ejecutar Migración

```bash
# Crear la migración
npx prisma migrate dev --name add_ai_advisor_tables

# Esto creará automáticamente:
# - Nuevas tablas en la BD
# - Regenerará Prisma Client con los nuevos modelos
```

**Verificar migración:**
```bash
# Ver la BD actualizada
npx prisma studio
```

---

## 🛠️ PASO 4: Implementar Funciones de Tools (Backend)

### Estructura de Directorios

```
src/app/api/
├── reviews/           # EXISTENTE - No tocar
├── advisor/           # NUEVO - Chat API principal
│   └── route.ts
└── tools/             # NUEVO - Implementaciones de las 6 tools
    ├── books.ts       # searchBooks, getBookDetails
    ├── reading-list.ts # addToReadingList, getReadingList
    └── stats.ts       # markAsRead, getReadingStats
```

### Archivo 1: `src/app/api/tools/books.ts`

Este archivo implementa las tools de búsqueda y detalles de libros:

```typescript
import { GoogleBooksResponse, BookDetails } from './types';

/**
 * Tool 1: searchBooks
 * Busca libros en Google Books API por título, autor, tema, o palabras clave
 */
export async function searchBooks(params: {
  query: string;
  maxResults?: number;
  orderBy?: string;
}): Promise<{ results: any[]; totalItems: number }> {
  try {
    const { query, maxResults = 10, orderBy = 'relevance' } = params;
    
    // Validar query
    if (!query || query.trim() === '') {
      throw new Error('Query de búsqueda es requerido');
    }

    // Llamar a Google Books API
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const url = apiKey
      ? `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&orderBy=${orderBy}&key=${apiKey}`
      : `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&orderBy=${orderBy}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error de API: ${response.statusText}`);
    }

    const data = await response.json();

    // Formatear resultados para el LLM
    const formattedResults = (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.volumeInfo?.title || 'Sin título',
      authors: item.volumeInfo?.authors || [],
      description: item.volumeInfo?.description?.substring(0, 200) || '',
      thumbnail: item.volumeInfo?.imageLinks?.thumbnail,
      pageCount: item.volumeInfo?.pageCount,
      publishedDate: item.volumeInfo?.publishedDate,
      categories: item.volumeInfo?.categories || [],
      averageRating: item.volumeInfo?.averageRating,
    }));

    return {
      results: formattedResults,
      totalItems: data.totalItems || 0,
    };
  } catch (error) {
    console.error('Error en searchBooks:', error);
    throw error;
  }
}

/**
 * Tool 2: getBookDetails
 * Obtiene información completa de un libro usando su Google Books ID
 */
export async function getBookDetails(params: {
  bookId: string;
}): Promise<BookDetails> {
  try {
    const { bookId } = params;

    if (!bookId) {
      throw new Error('bookId es requerido');
    }

    // Llamar a Google Books API
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const url = apiKey
      ? `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${apiKey}`
      : `https://www.googleapis.com/books/v1/volumes/${bookId}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Libro no encontrado: ${response.statusText}`);
    }

    const item = await response.json();

    // Extraer información detallada
    const volumeInfo = item.volumeInfo || {};
    
    return {
      id: item.id,
      title: volumeInfo.title || 'Sin título',
      authors: volumeInfo.authors || [],
      description: volumeInfo.description || '',
      thumbnail: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail,
      pageCount: volumeInfo.pageCount,
      publishedDate: volumeInfo.publishedDate,
      publisher: volumeInfo.publisher,
      categories: volumeInfo.categories || [],
      language: volumeInfo.language,
      isbn: volumeInfo.industryIdentifiers?.[0]?.identifier,
      averageRating: volumeInfo.averageRating,
      ratingsCount: volumeInfo.ratingsCount,
      previewLink: volumeInfo.previewLink,
      infoLink: volumeInfo.infoLink,
    };
  } catch (error) {
    console.error('Error en getBookDetails:', error);
    throw error;
  }
}
```

### Archivo 2: `src/app/api/tools/types.ts`

Archivo para tipos compartidos:

```typescript
export interface BookDetails {
  id: string;
  title: string;
  authors: string[];
  description: string;
  thumbnail?: string;
  pageCount?: number;
  publishedDate?: string;
  publisher?: string;
  categories: string[];
  language?: string;
  isbn?: string;
  averageRating?: number;
  ratingsCount?: number;
  previewLink?: string;
  infoLink?: string;
}

export interface ReadingListItem {
  id: string;
  bookId: string;
  priority?: string;
  notes?: string;
  addedAt: Date;
}

export interface ReadBook {
  id: string;
  bookId: string;
  rating?: number;
  review?: string;
  dateFinished: Date;
}

export interface ReadingStats {
  totalBooksRead: number;
  totalPagesRead: number;
  averageRating: number;
  topGenres: { genre: string; count: number }[];
  topAuthors: { author: string; count: number }[];
  booksThisMonth: number;
  readingStreak: number;
}
```

### Archivo 3: `src/app/api/tools/reading-list.ts`

Implementa las tools para gestionar listas de lectura:

```typescript
import { prisma } from '../../../lib/prisma';

/**
 * Tool 3: addToReadingList
 * Agrega un libro a la lista "Quiero Leer"
 */
export async function addToReadingList(params: {
  bookId: string;
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const { bookId, priority = 'medium', notes } = params;

    if (!bookId) {
      throw new Error('bookId es requerido');
    }

    // Verificar si el libro ya está en la lista
    const existing = await prisma.readingListItem.findUnique({
      where: { bookId },
    });

    if (existing) {
      // Actualizar si ya existe
      await prisma.readingListItem.update({
        where: { bookId },
        data: { priority, notes },
      });
      return {
        success: true,
        message: 'Lista de lectura actualizada exitosamente',
      };
    }

    // Crear nuevo item
    await prisma.readingListItem.create({
      data: {
        bookId,
        priority,
        notes,
      },
    });

    return {
      success: true,
      message: 'Libro agregado a la lista de lectura exitosamente',
    };
  } catch (error) {
    console.error('Error en addToReadingList:', error);
    throw error;
  }
}

/**
 * Tool 4: getReadingList
 * Obtiene la lista de libros pendientes del usuario
 */
export async function getReadingList(params: {
  filter?: string;
  limit?: number;
}): Promise<any[]> {
  try {
    const { filter, limit = 50 } = params;

    let whereClause: any = {};

    // Aplicar filtros si existen
    if (filter === 'high') {
      whereClause.priority = 'high';
    } else if (filter === 'medium') {
      whereClause.priority = 'medium';
    } else if (filter === 'low') {
      whereClause.priority = 'low';
    }

    // Obtener items de la lista
    const items = await prisma.readingListItem.findMany({
      where: whereClause,
      orderBy: {
        addedAt: 'desc',
      },
      take: limit,
      include: {
        book: true,
      },
    });

    // Formatear para el LLM
    return items.map((item) => ({
      id: item.id,
      bookId: item.bookId,
      title: item.book.title,
      authors: item.book.authors,
      priority: item.priority,
      notes: item.notes,
      addedAt: item.addedAt,
    }));
  } catch (error) {
    console.error('Error en getReadingList:', error);
    throw error;
  }
}
```

### Archivo 4: `src/app/api/tools/stats.ts`

Implementa las tools de estadísticas:

```typescript
import { prisma } from '../../../lib/prisma';

/**
 * Tool 5: markAsRead
 * Marca un libro como leído y opcionalmente agrega rating/review
 */
export async function markAsRead(params: {
  bookId: string;
  rating?: number;
  review?: string;
  dateFinished?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const { bookId, rating, review, dateFinished } = params;

    if (!bookId) {
      throw new Error('bookId es requerido');
    }

    // Validar rating si se proporciona
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      throw new Error('Rating debe estar entre 1 y 5');
    }

    // Verificar si ya está marcado como leído
    const existing = await prisma.readBook.findUnique({
      where: { bookId },
    });

    if (existing) {
      // Actualizar
      await prisma.readBook.update({
        where: { bookId },
        data: {
          rating,
          review,
          dateFinished: dateFinished ? new Date(dateFinished) : undefined,
        },
      });
      return {
        success: true,
        message: 'Libro actualizado en tu historial de lectura',
      };
    }

    // Crear nuevo registro
    await prisma.readBook.create({
      data: {
        bookId,
        rating,
        review,
        dateFinished: dateFinished ? new Date(dateFinished) : new Date(),
      },
    });

    // Remover de lista "Quiero Leer" si está ahí
    await prisma.readingListItem
      .delete({
        where: { bookId },
      })
      .catch(() => {}); // Ignorar si no existe

    return {
      success: true,
      message: 'Libro marcado como leído exitosamente',
    };
  } catch (error) {
    console.error('Error en markAsRead:', error);
    throw error;
  }
}

/**
 * Tool 6: getReadingStats
 * Genera estadísticas y analytics de hábitos de lectura
 */
export async function getReadingStats(params: {
  period: 'all-time' | 'year' | 'month' | 'week';
  groupBy?: 'genre' | 'author' | 'year';
}): Promise<any> {
  try {
    const { period } = params;

    // Calcular fecha de inicio según periodo
    const now = new Date();
    let startDate = new Date(0); // Inicio de los tiempos

    if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
    }

    // Obtener libros leídos
    const readBooks = await prisma.readBook.findMany({
      where: {
        dateFinished: {
          gte: startDate,
        },
      },
      include: {
        book: true,
      },
    });

    // Calcular estadísticas
    const totalBooksRead = readBooks.length;
    const totalPagesRead = readBooks.reduce(
      (sum, rb) => sum + (rb.book.pageCount || 0),
      0
    );

    // Calcular rating promedio
    const booksWithRating = readBooks.filter((rb) => rb.rating);
    const averageRating =
      booksWithRating.length > 0
        ? booksWithRating.reduce((sum, rb) => sum + rb.rating!, 0) /
          booksWithRating.length
        : 0;

    // Contar géneros
    const genreCount: Record<string, number> = {};
    readBooks.forEach((rb) => {
      const categories = rb.book.categories.split(',').map((c) => c.trim());
      categories.forEach((cat) => {
        if (cat) {
          genreCount[cat] = (genreCount[cat] || 0) + 1;
        }
      });
    });

    // Contar autores
    const authorCount: Record<string, number> = {};
    readBooks.forEach((rb) => {
      const authors = rb.book.authors.split(',').map((a) => a.trim());
      authors.forEach((author) => {
        if (author) {
          authorCount[author] = (authorCount[author] || 0) + 1;
        }
      });
    });

    // Top géneros
    const topGenres = Object.entries(genreCount)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top autores
    const topAuthors = Object.entries(authorCount)
      .map(([author, count]) => ({ author, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Libros este mes
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const booksThisMonth = readBooks.filter(
      (rb) => rb.dateFinished >= monthStart
    ).length;

    return {
      totalBooksRead,
      totalPagesRead,
      averageRating: Number(averageRating.toFixed(2)),
      topGenres,
      topAuthors,
      booksThisMonth,
      readingStreak: 0, // TODO: implementar lógica de racha
    };
  } catch (error) {
    console.error('Error en getReadingStats:', error);
    throw error;
  }
}
```

---

## 🤖 PASO 5: Crear API de Chat Principal

### Archivo: `src/app/api/advisor/route.ts`

Este es el archivo más importante - maneja el streaming del chat y tool calling:

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { searchBooks, getBookDetails } from '../tools/books';
import { addToReadingList, getReadingList } from '../tools/reading-list';
import { markAsRead, getReadingStats } from '../tools/stats';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Configurar OpenRouter
    const model = openai('anthropic/claude-3-haiku', {
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    // Definir las 6 tools para el LLM
    const tools = {
      searchBooks: tool({
        description: 'Busca libros en Google Books por título, autor, tema o palabras clave. Usa esta tool cuando el usuario pida recomendaciones, busque libros específicos, o explore géneros.',
        parameters: z.object({
          query: z.string().describe('Término de búsqueda: título, autor, género, o tema'),
          maxResults: z.number().optional().default(10).describe('Número máximo de resultados'),
          orderBy: z.string().optional().default('relevance').describe('Orden: relevance o newest'),
        }),
        execute: searchBooks,
      }),

      getBookDetails: tool({
        description: 'Obtiene información detallada completa de un libro específico usando su Google Books ID. Úsala cuando el usuario pregunte por detalles, descripción, páginas, o calificaciones de un libro.',
        parameters: z.object({
          bookId: z.string().describe('ID único del libro desde Google Books'),
        }),
        execute: getBookDetails,
      }),

      addToReadingList: tool({
        description: 'Agrega un libro a la lista "Quiero Leer" del usuario. Úsala cuando el usuario quiera guardar un libro para leer después.',
        parameters: z.object({
          bookId: z.string().describe('ID único del libro desde Google Books'),
          priority: z.enum(['high', 'medium', 'low']).optional().describe('Prioridad de lectura'),
          notes: z.string().optional().describe('Notas personales sobre el libro'),
        }),
        execute: addToReadingList,
      }),

      getReadingList: tool({
        description: 'Obtiene la lista de libros que el usuario quiere leer. Úsala cuando pregunte qué libros tiene pendientes, su lista, o qué falta leer.',
        parameters: z.object({
          filter: z.string().optional().describe('Filtro por prioridad: high, medium, low'),
          limit: z.number().optional().default(50).describe('Número máximo de resultados'),
        }),
        execute: getReadingList,
      }),

      markAsRead: tool({
        description: 'Marca un libro como leído y opcionalmente agrega rating (1-5) y review. Úsala cuando el usuario termine de leer un libro o quiera dar su opinión.',
        parameters: z.object({
          bookId: z.string().describe('ID único del libro desde Google Books'),
          rating: z.number().min(1).max(5).optional().describe('Calificación de 1 a 5 estrellas'),
          review: z.string().optional().describe('Review personal del usuario'),
          dateFinished: z.string().optional().describe('Fecha de finalización (formato ISO)'),
        }),
        execute: markAsRead,
      }),

      getReadingStats: tool({
        description: 'Genera estadísticas y analytics completos de los hábitos de lectura del usuario. Úsala cuando pregunte por estadísticas, cuántos libros ha leído, su género favorito, etc.',
        parameters: z.object({
          period: z.enum(['all-time', 'year', 'month', 'week']).describe('Periodo de tiempo para las estadísticas'),
          groupBy: z.enum(['genre', 'author', 'year']).optional().describe('Agrupación de resultados'),
        }),
        execute: getReadingStats,
      }),
    };

    // Crear el stream de respuesta
    const result = await streamText({
      model,
      messages,
      tools,
      maxToolRoundtrips: 5, // Máximo de iteraciones de tools por mensaje
      system: `Eres un asistente experto en recomendación de libros llamado "Book Advisor". Tu trabajo es:
- Ayudar a los usuarios a descubrir libros que les gusten
- Recomendar libros basándote en sus gustos y preferencias
- Ayudarles a gestionar sus listas de lectura
- Proporcionar estadísticas útiles sobre sus hábitos de lectura
- Ser amigable, entusiasta sobre libros, y conversacional

SIEMPRE usa las tools disponibles para buscar información real de libros. Nunca inventes información sobre libros.

Cuando encuentres un libro interesante, ofrece agregarlo a su lista de lectura. Sé proactivo pero no agresivo.`,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error en API de advisor:', error);
    return new Response(JSON.stringify({ error: 'Error del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

---

## 🎨 PASO 6: Crear Interfaz de Usuario del Chat

### Archivo: `src/app/advisor/page.tsx`

Esta es la página principal del AI Advisor:

```typescript
'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';

export default function AdvisorPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/advisor',
    });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                📚 AI Book Advisor
              </h1>
              <p className="text-sm text-gray-600">
                Tu asistente inteligente para descubrir libros
              </p>
            </div>
            <a
              href="/"
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              ← Volver a Búsqueda
            </a>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Hola! Soy tu Book Advisor
              </h2>
              <p className="text-gray-600 mb-8">
                Puedo ayudarte a encontrar libros, gestionar tu lista de lectura,
                y ver estadísticas de lectura.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🔍</div>
                  <h3 className="font-semibold mb-1">Buscar Libros</h3>
                  <p className="text-sm text-gray-600">
                    "Recomiéndame libros de ciencia ficción"
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">📋</div>
                  <h3 className="font-semibold mb-1">Mi Lista</h3>
                  <p className="text-sm text-gray-600">
                    "Muéstrame mi lista de lectura"
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className="font-semibold mb-1">Estadísticas</h3>
                  <p className="text-sm text-gray-600">
                    "¿Cuántos libros he leído este año?"
                  </p>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-900 shadow-sm'
                }`}
              >
                {/* Content */}
                <div className="prose max-w-none">
                  {message.content}
                </div>

                {/* Tool Calls */}
                {message.toolInvocations && message.toolInvocations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-2">
                      📎 Tools ejecutadas:
                    </div>
                    {message.toolInvocations.map((tool, idx) => (
                      <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                        {tool.toolName} → {tool.state}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 shadow-sm rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-bounce">🤔</div>
                  <span className="text-sm">Pensando...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔗 PASO 7: Agregar Enlace de Navegación

### Opción A: Modificar el Header Principal

Edita `src/app/page.tsx` para agregar un enlace:

```typescript
// Agrega esto en el header
<a
  href="/advisor"
  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
>
  🤖 Probar AI Advisor
</a>
```

---

## ✅ PASO 8: Testing y Verificación

### Verificar la Instalación

```bash
# 1. Verificar dependencias
npm list ai @ai-sdk/openai zod

# 2. Verificar migración de BD
npx prisma studio
# Deberías ver las nuevas tablas: reading_list_items y read_books

# 3. Iniciar servidor
npm run dev
```

### Probar Funcionalidades

1. **Ir a `/advisor`** y probar estas conversaciones:

```
Usuario: "Hola, busca libros sobre inteligencia artificial"
AI: Debería ejecutar searchBooks y mostrar resultados

Usuario: "Agrega 'Dune' a mi lista"
AI: Debería buscar Dune y agregarlo con addToReadingList

Usuario: "Muéstrame mi lista de lectura"
AI: Debería ejecutar getReadingList

Usuario: "¿Cuántos libros he leído?"
AI: Debería ejecutar getReadingStats

Usuario: "Marco '1984' como leído, 5 estrellas"
AI: Debería ejecutar markAsRead con rating=5
```

---

## 🐛 Solución de Problemas Comunes

### Error: "Module not found: ai"

```bash
npm install ai @ai-sdk/openai zod
```

### Error: "OPENROUTER_API_KEY is not defined"

Verifica que `.env.local` existe y tiene la clave correcta.

### Error: "Migration failed"

```bash
# Eliminar BD y recrear (CUIDADO: pierdes datos)
rm prisma/dev.db
npx prisma migrate dev
```

### Error: "Tool not working"

Verifica la consola del servidor para errores. Cada tool debe tener su archivo creado.

---

## 🎉 ¡Implementación Completa!

Si llegaste hasta aquí, tienes:
- ✅ AI Advisor funcionando en `/advisor`
- ✅ 6 tools implementadas y funcionando
- ✅ Sistema de chat con streaming
- ✅ Base de datos extendida
- ✅ Sistema de reseñas original intacto

---

## 📚 Próximos Pasos Opcionales

1. **Mejorar UI**: Agregar avatares, animaciones, mejor diseño
2. **Agregar autenticación**: Sistema de usuarios para múltiples usuarios
3. **Cache**: Implementar caching de búsquedas frecuentes
4. **Más features**: Exportar listas, comparar con amigos, etc.

---

## 💡 Notas Importantes

1. **OpenRouter keys** son sensibles - nunca las subas a Git
2. **Rate limiting**: Google Books puede tener límites
3. **Costos**: OpenRouter tiene modelos gratuitos y de pago
4. **Escalabilidad**: Para producción, considera usar PostgreSQL en lugar de SQLite

¡Disfruta tu nuevo AI Book Advisor! 📚✨

