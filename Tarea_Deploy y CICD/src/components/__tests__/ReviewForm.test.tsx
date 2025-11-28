//  IMPORTACIONES PARA TESTING DE COMPONENTES REACT
// render: Crea una versión virtual del componente para probarlo
// screen: Nos permite buscar elementos en el componente renderizado
// fireEvent: Simula eventos del navegador (clicks, envío de formularios, etc.)
// waitFor: Espera a que operaciones asíncronas terminen antes de continuar
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
// userEvent: Simula interacciones más realistas del usuario (tipear texto, etc.)
import userEvent from '@testing-library/user-event'
// Funciones de vitest para organizar y ejecutar las pruebas
import { describe, it, expect, vi, beforeEach } from 'vitest'
// El componente ReviewForm que vamos a probar
import ReviewForm from '../ReviewForm'

//  MOCK DE FETCH (para simular llamadas a la API)
// ¿Por qué? El componente ReviewForm hace una petición POST para enviar reseñas
// No queremos hacer peticiones reales durante las pruebas
const mockFetch = vi.fn()
global.fetch = mockFetch

//  MOCK DE ALERT (para simular ventanas emergentes)
// ¿Por qué? El componente muestra alertas cuando la reseña se envía exitosamente
// En las pruebas no queremos que aparezcan alertas reales
global.alert = vi.fn()

//  GRUPO DE PRUEBAS para el componente ReviewForm
describe('ReviewForm Component', () => {
  // 🎭 DATOS FALSOS para las props del componente
  // Estos son los datos que el componente necesita para funcionar
  const mockProps = {
    bookId: 'test-book-id', // <-- ID único del libro
    bookData: {               // <-- Información del libro
      title: 'Test Book',       // <-- Título del libro de prueba
      authors: ['Test Author'],  // <-- Autor del libro de prueba
    },
    onReviewAdded: vi.fn(),        // <-- Función falsa que se ejecuta cuando se agrega una reseña
  }

  //  LIMPIEZA antes de cada prueba individual
  beforeEach(() => {
    // Limpia todos los mocks para que no interfieran entre pruebas
    vi.clearAllMocks()
  })

  //  PRUEBA 1: Verificar que todos los campos del formulario se rendericen
  it('should render form fields', () => {
    //  RENDERIZAR el componente con las props de prueba
    render(<ReviewForm {...mockProps} />)
    
    //  VERIFICAR que todos los elementos del formulario existan
    expect(screen.getByLabelText(/Tu nombre/)).toBeInTheDocument() // <-- Campo de nombre
    expect(screen.getByText(/Calificación/)).toBeInTheDocument() // <-- Sección de estrellas
    expect(screen.getByLabelText(/Tu reseña/)).toBeInTheDocument() // <-- Campo de texto de reseña
    expect(screen.getByRole('button', { name: /Publicar reseña/ })).toBeInTheDocument() // <-- Botón de envío
  })

  //  NOTA: Aquí se pueden agregar más pruebas para verificar:
  // - Que el formulario valide campos vacíos
  // - Que las estrellas funcionen correctamente
  // - Que el envío de la reseña funcione
  // - Que se muestren mensajes de error apropiados
})