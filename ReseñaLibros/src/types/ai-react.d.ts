declare module 'ai/react' {
  import * as React from 'react';
  // Exporta lo básico como any para evitar errores de tipos. Ajusta más tarde si conoces la API real.
  export function useAI(...args: any[]): any;
  export function useChat(...args: any[]): any;
  export const AIChat: React.ComponentType<any>;
  export const AIForm: React.ComponentType<any>;
  export default { useAI, useChat, AIChat, AIForm };
}
