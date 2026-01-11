import { StudentsList } from '@features/students/ui';

/**
 * Página de Estudiantes (Vista General)
 *
 * Componente de orquestación que renderiza el componente de la feature.
 * No contiene lógica de negocio, solo composición.
 */
export function StudentsPage() {
  return <StudentsList />;
}
