/**
 * Simula un delay de red para hacer los mocks más realistas
 * @param ms - Milisegundos de delay
 * @returns Promise que se resuelve después del delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
