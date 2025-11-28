// Estas funciones nos ayudan a probar componentes de React
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
// Para simular interacciones del usuario (clics, tipeo, etc.)
import userEvent from '@testing-library/user-event'
// Funciones de Vitest para organizar y ejecutar pruebas
import { describe, it, expect, vi, beforeEach } from 'vitest'
// El componente que se va a probar
import BookSearch from '../BookSearch'
// El hook que usa el componente
import useBookSearch from '../../hooks/useBookSearch'

// Mock del hook useBookSearch
/*
  Se mockea el hook del componente porque solo se quiere comprobar el componente "BookSearch".
  Como no se quiere que las pruebas dependan de la API de Google; Se controla
  los datos que devuelve
*/
vi.mock('../../hooks/useBookSearch', () => ({
  default: vi.fn(),
}))

// Mock del componente BookList
/*
  Se mockea el componente "bookList" porque lo que se quiere probar es "bookSearch"
  y no "BookList" -> Se crea una version simple que solo muestra cuantos libros recibió
*/
vi.mock('../BookList', () => ({
  default: ({ books }: { books: unknown[] }) => (
    <div data-testid="book-list">
      {books.length} books found
    </div>
  ),
}))

const mockUseBookSearch = vi.mocked(useBookSearch)

// CONFIGURACIÓN 
/*
  describe(): Agrupa pruebas relacionadas
  beforeEach(): Se ejecuta antes de cada prueba individual
  mockReturnValue(): Le dice al mock qué datos devolver
*/
describe('BookSearch Component', () => {
    // Herramientas falsas
    const mockSearchBooks = vi.fn() // <-- Función simulada para buscar libros
    const mockSetSearchTerm = vi.fn() // <-- Función simulada para establecer el término de búsqueda
    const mockClearSearch = vi.fn() // <-- Función simulada para limpiar la búsqueda

  beforeEach(() => {
    vi.clearAllMocks() // <-- Limpiar mocks antes de cada prueba

    // Se configura lo qué devuelve el hook falso
    mockUseBookSearch.mockReturnValue({
      searchTerm: '', // <-- Termino de busqueda vacio
      setSearchTerm: mockSetSearchTerm, // <-- La función falsa para establecer el término de búsqueda
      books: [], // <-- Sin libros
      isLoading: false, // <-- No esta cargando
      error: null, // <-- Sin errores
      searchBooks: mockSearchBooks, // <-- La función falsa para buscar libros
      clearSearch: mockClearSearch, // <-- La función falsa para limpiar la búsqueda
    })
  })

  // PRUEBAS
  /*
    it(): Define una prueba individual
    render(): "Monta" el componente en un DOM virtual
    screen.getBy...(): Busca elementos en el DOM virtual
    expect(): Verifica que algo sea verdadero
    toBeInTheDocument(): Confirma que el elemento existe
  */
  it('should render search form', () => {
    // RENDERIZA el componente como si estuviera en el navegador
    render(<BookSearch />)

    // Verifica que existan los elementos especificos
    expect(screen.getByPlaceholderText(/Buscar por título/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Buscar/ })).toBeInTheDocument()
  })
})