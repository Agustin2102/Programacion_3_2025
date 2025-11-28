// 📚 IMPORTACIÓN DE UTILIDADES DE TESTING
// Esta librería añade métodos útiles como .toBeInTheDocument() a las pruebas
import '@testing-library/jest-dom';
// Importamos la función 'vi' de vitest para crear mocks (versiones falsas)
import { vi } from 'vitest';

// 🔐 CONFIGURACIÓN DE VARIABLES DE ENTORNO PARA TESTS
// Configuramos JWT_SECRET para que los tests de autenticación funcionen
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';

// 🌐 MOCK GLOBAL PARA FETCH (llamadas a APIs)
// ¿Por qué? Las pruebas no deben hacer llamadas reales a internet
// Creamos una versión falsa de fetch que podemos controlar
global.fetch = vi.fn()

// 💾 MOCK PARA sessionStorage (almacenamiento del navegador)
// ¿Por qué? En las pruebas no existe un navegador real, entonces no hay sessionStorage
// Creamos un objeto falso que simula todas las funciones de sessionStorage
const sessionStorageMock = {
    getItem: vi.fn(),    // 🔍 Función falsa para obtener datos guardados
    setItem: vi.fn(),    // 💾 Función falsa para guardar datos
    removeItem: vi.fn(), // 🗑️ Función falsa para borrar datos específicos
    clear: vi.fn(),      // 🧹 Función falsa para borrar todos los datos
}

// 🔧 INSTALAR el mock de sessionStorage en el objeto window
// Object.defineProperty nos permite "reemplazar" sessionStorage con nuestro mock
Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock, // Usamos nuestro objeto falso
})

// 🚨 MOCK PARA window.alert (ventanas emergentes)
// ¿Por qué? En las pruebas no queremos que aparezcan alertas reales
// Creamos una función falsa que podemos verificar si fue llamada
global.alert = vi.fn()