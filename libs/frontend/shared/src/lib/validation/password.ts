/**
 * Valida que la contraseña cumpla con los requisitos estrictos:
 * - Mínimo 8 caracteres
 * - Al menos un número
 * - Al menos una letra minúscula
 * - Al menos una letra mayúscula
 * - Al menos un símbolo
 * @param password - Contraseña a validar
 * @returns true si es válida, false en caso contrario
 */
export function isValidPasswordFormat(password: string): boolean {
  if (password.length < 8) {
    return false;
  }

  // Verificar que tenga al menos un número
  if (!/\d/.test(password)) {
    return false;
  }

  // Verificar que tenga al menos una letra minúscula
  if (!/[a-z]/.test(password)) {
    return false;
  }

  // Verificar que tenga al menos una letra mayúscula
  if (!/[A-Z]/.test(password)) {
    return false;
  }

  // Verificar que tenga al menos un símbolo (carácter especial)
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return false;
  }

  return true;
}

/**
 * Obtiene un mensaje de error descriptivo para una contraseña inválida
 * @param password - Contraseña a validar
 * @returns Mensaje de error o null si es válida
 */
export function getPasswordValidationError(password: string): string | null {
  if (!password) {
    return 'La contraseña es requerida';
  }

  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }

  if (!/\d/.test(password)) {
    return 'La contraseña debe incluir al menos un número';
  }

  if (!/[a-z]/.test(password)) {
    return 'La contraseña debe incluir al menos una letra minúscula';
  }

  if (!/[A-Z]/.test(password)) {
    return 'La contraseña debe incluir al menos una letra mayúscula';
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'La contraseña debe incluir al menos un símbolo';
  }

  return null;
}
