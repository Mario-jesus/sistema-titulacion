import { BackupsList } from '@features/backups';

/**
 * Página de Respaldos
 *
 * Componente de orquestación que renderiza el componente de la feature.
 * No contiene lógica de negocio, solo composición.
 */
export function BackupsPage() {
  return <BackupsList />;
}
