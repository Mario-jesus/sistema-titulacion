import { useState, FormEvent } from 'react';
import { Button, Input, Card } from '@shared/ui';

interface BackupFormProps {
  onSubmit: (data: {
    name: string;
    description?: string;
  }) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Formulario para crear un nuevo respaldo
 */
export function BackupForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: BackupFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim() || isLoading) {
      return;
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
    });

    // Reset form si no hay error (la lógica de manejo de errores está en el componente padre)
    if (!isLoading) {
      setName('');
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {/* Nombre */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="name"
            className="text-sm font-medium"
            style={{ color: 'var(--color-base-primary-typo)' }}
          >
            Nombre del Respaldo *
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Respaldo Mensual - Enero 2024"
            required
          />
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="description"
            className="text-sm font-medium"
            style={{ color: 'var(--color-base-primary-typo)' }}
          >
            Descripción (opcional)
          </label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Agregar una descripción del respaldo..."
          />
        </div>

        {/* Mensaje sobre cifrado */}
        <Card variant="flat">
          <div className="flex flex-col gap-2 text-(--color-blue)">
            <p className="text-sm font-medium">NOTA</p>
            <p className="text-sm">
              El archivo de respaldo creado estará cifrado. No intentes abrirlo
              con WinRAR o descomprimirlo manualmente. Solo este sistema puede
              leerlo mediante la opción de Restaurar.
            </p>
          </div>
        </Card>
      </div>

      {/* Botones */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!name.trim() || isLoading}
          isLoading={isLoading}
          style={{ backgroundColor: 'var(--color-primary-color)' }}
        >
          Crear Respaldo
        </Button>
      </div>
    </form>
  );
}
