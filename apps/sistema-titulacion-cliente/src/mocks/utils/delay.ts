/**
 * Obtiene el delay configurado desde la variable de entorno
 * Si no está configurado, retorna 0 (sin delay)
 * @returns Milisegundos de delay configurado
 */
function getConfiguredDelay(): number {
  const envDelay = import.meta.env.VITE_MOCK_API_DELAY;
  if (!envDelay) {
    return 0;
  }
  const parsed = parseInt(envDelay, 10);
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

/**
 * Simula un delay de red para hacer los mocks más realistas
 * Si se proporciona un valor específico, lo usa; de lo contrario, usa el valor de la variable de entorno
 * @param ms - Milisegundos de delay (opcional, si no se proporciona usa VITE_MOCK_API_DELAY)
 * @returns Promise que se resuelve después del delay
 */
export function delay(ms?: number): Promise<void> {
  const delayMs = ms !== undefined ? ms : getConfiguredDelay();
  if (delayMs <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}
