import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ReviewForm from '../ReviewForm'
import { AuthProvider } from '@/context/AuthContext'

// Mock fetch and alert
const mockFetch = vi.fn()
global.fetch = mockFetch
global.alert = vi.fn()

describe('ReviewForm Component', () => {
  const mockProps = {
    bookId: 'test-book-id',
    bookData: {
      title: 'Test Book',
      authors: ['Test Author'],
    },
    onReviewAdded: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render form fields', () => {
    render(
      <AuthProvider>
        <ReviewForm {...mockProps} />
      </AuthProvider>
    )
    
    expect(screen.getByText(/Calificación/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Tu reseña/)).toBeInTheDocument()
    // When not authenticated, button text is different
    const submitButton = screen.getByRole('button', { name: /Inicia sesión para reseñar|Publicar reseña/ })
    expect(submitButton).toBeInTheDocument()
    // Verificar que las estrellas estén presentes
    expect(screen.getByLabelText(/1 estrella/)).toBeInTheDocument()
    expect(screen.getByLabelText(/5 estrellas/)).toBeInTheDocument()
  })
})