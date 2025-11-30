// 🧪 IMPORTACIONES PARA TESTING DE HOOKS
// renderHook: Permite probar hooks personalizados de React de forma aislada
// act: Envuelve acciones que cambian el estado para que React las procese correctamente
// waitFor: Espera a que algo async ocurra antes de continuar
import {renderHook, act, waitFor} from '@testing-library/react';
// Funciones de vitest para organizar y ejecutar las pruebas
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest'
// El hook personalizado que vamos a probar
import useBookSearch from '../useBookSearch';

// MOCK DE FETCH (para simular llamadas a la API)
// Creamos una función falsa que reemplaza fetch en las pruebas
const mockFetch = vi.fn()
global.fetch = mockFetch

// MOCK DE sessionStorage (para simular almacenamiento del navegador)
// Como en las pruebas no hay navegador real, creamos un sessionStorage falso
const mockSessionStorage = {
    getItem: vi.fn(),    // <-- Función falsa para leer datos guardados
    setItem: vi.fn(),    // <-- Función falsa para guardar datos
    removeItem: vi.fn(), // <-- Función falsa para eliminar datos
}
// Instalamos nuestro mock en el objeto window global
Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage,
    writable: true, // <-- Permite que sea modificable
})

// GRUPO DE PRUEBAS para el hook useBookSearch
describe('useBookSearch Hook', () => {
    // PREPARACIÓN antes de cada prueba individual
    beforeEach(() => {
        // Limpia todas las funciones mock para que no interfieran entre pruebas
        vi.clearAllMocks()
        // Configura que getItem devuelva null (como si no hubiera datos guardados)
        mockSessionStorage.getItem.mockReturnValue(null)
    })

    // LIMPIEZA después de cada prueba individual
    afterEach(() => {
        // Resetea completamente todos los mocks
        vi.resetAllMocks()
    })

    // PRUEBA 1: Verificar que el hook inicie con valores vacíos
    it('should initialize with empty values', () => {
        //  RENDERIZAR el hook (como si lo usáramos en un componente)
        const {result} = renderHook(() => useBookSearch())

        // VERIFICAR que todos los valores iniciales sean correctos
        expect(result.current.searchTerm).toBe('')     // <-- Término de búsqueda vacío
        expect(result.current.books).toEqual([])       // <-- Array de libros vacío
        expect(result.current.isLoading).toBe(false)   // <-- No está cargando
        expect(result.current.error).toBe(null)        // <-- Sin errores
    })

    // PRUEBA 2: Verificar que actualizar el término de búsqueda funcione
    it('should update search term and save to sessionStorage', () => {
        // RENDERIZAR el hook
        const {result} = renderHook(() => useBookSearch())

        // EJECUTAR una acción que cambia el estado
        act(() => {
            // Llamamos a la función setSearchTerm con un valor
            result.current.setSearchTerm('Harry Potter')
        })

        // VERIFICAR que el estado se actualizó correctamente
        expect(result.current.searchTerm).toBe('Harry Potter')
        // VERIFICAR que se guardó en sessionStorage
        expect(mockSessionStorage.setItem).toHaveBeenCalledWith('book-search-term', 'Harry Potter')
    })
})

