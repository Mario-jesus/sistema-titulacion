import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  useToast,
  Card,
  Search,
  Pagination,
} from '@shared/ui';
import { DetailModal } from '@shared/ui';
import type { TableColumn, DropdownMenuItem, DetailField } from '@shared/ui';
import type { Backup, BackupStatus } from '../../model/types';
import { BackupForm } from '../BackupForm/BackupForm';
import { useBackups } from '../../lib/useBackups';
import { API_ENDPOINTS } from '@shared/api';
import { env } from '@shared/config';
import {
  createBackupThunk,
  deleteBackupThunk,
  restoreBackupThunk,
  uploadBackupThunk,
} from '../../model/backupsThunks';

/**
 * Componente para listar y gestionar respaldos
 * Contiene toda la lógica de UI para la gestión de respaldos
 */
export function BackupsList() {
  const { showToast } = useToast();

  // Hook de backups
  const {
    backups,
    pagination,
    currentBackup,
    isLoadingList,
    isCreating,
    isRestoring,
    isUploading,
    listError,
    createError,
    deleteError,
    restoreError,
    uploadError,
    listBackups,
    getBackupById,
    createBackup,
    deleteBackup,
    restoreBackup,
    uploadBackup,
    clearListError,
    clearCreateError,
    clearDeleteError,
    clearRestoreError,
    clearUploadError,
    clearCurrentBackup,
  } = useBackups();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Cargar lista de respaldos
  useEffect(() => {
    listBackups({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm || undefined,
    });
  }, [currentPage, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Manejar errores
  useEffect(() => {
    if (listError) {
      showToast({
        type: 'error',
        title: 'Error',
        message: listError,
      });
      clearListError();
    }
  }, [listError, showToast, clearListError]);

  useEffect(() => {
    if (createError) {
      showToast({
        type: 'error',
        title: 'Error al crear respaldo',
        message: createError,
      });
      clearCreateError();
    }
  }, [createError, showToast, clearCreateError]);

  useEffect(() => {
    if (deleteError) {
      showToast({
        type: 'error',
        title: 'Error al eliminar respaldo',
        message: deleteError,
      });
      clearDeleteError();
    }
  }, [deleteError, showToast, clearDeleteError]);

  useEffect(() => {
    if (restoreError) {
      showToast({
        type: 'error',
        title: 'Error al restaurar respaldo',
        message: restoreError,
      });
      clearRestoreError();
    }
  }, [restoreError, showToast, clearRestoreError]);

  useEffect(() => {
    if (uploadError) {
      showToast({
        type: 'error',
        title: 'Error al subir archivo',
        message: uploadError,
      });
      clearUploadError();
    }
  }, [uploadError, showToast, clearUploadError]);

  // Resetear página cuando cambia el término de búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Formatear tamaño
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Formatear fecha
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Obtener badge de estado
  const getStatusBadge = (status: BackupStatus) => {
    const statusConfig: Record<
      BackupStatus,
      { label: string; className: string }
    > = {
      AVAILABLE: {
        label: 'Disponible',
        className: 'bg-green-500 dark:bg-green-700',
      },
      IN_PROGRESS: {
        label: 'En Proceso',
        className: 'bg-blue-500 dark:bg-blue-700',
      },
      FAILED: { label: 'Fallido', className: 'bg-red-500 dark:bg-red-700' },
      UNAVAILABLE: {
        label: 'No Disponible',
        className: 'bg-gray-500 dark:bg-gray-700',
      },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  // Manejar crear respaldo
  const handleCreateBackup = async (data: {
    name: string;
    description?: string;
  }) => {
    const result = await createBackup(data);
    if (createBackupThunk.fulfilled.match(result)) {
      showToast({
        type: 'success',
        title: 'Respaldo iniciado',
        message: `El respaldo "${data.name}" se ha iniciado. Se está respaldando todas las tablas del sistema...`,
      });
      setIsCreateModalOpen(false);
      // Recargar lista
      listBackups({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
      });
    }
  };

  // Manejar descargar respaldo
  const handleDownloadBackup = async (backup: Backup) => {
    if (backup.status !== 'AVAILABLE') {
      showToast({
        type: 'error',
        title: 'No disponible',
        message: 'Este respaldo no está disponible para descargar.',
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = `${env.apiBaseUrl}${API_ENDPOINTS.BACKUPS.DOWNLOAD(
        backup.id
      )}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Error al descargar el archivo');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${backup.name}.gzip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      showToast({
        type: 'success',
        title: 'Descarga completada',
        message: `El respaldo "${backup.name}" se ha descargado correctamente.`,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message:
          error instanceof Error
            ? error.message
            : 'Error al descargar el respaldo',
      });
    }
  };

  // Manejar abrir detalles
  const handleOpenDetail = useCallback(
    async (backup: Backup) => {
      setSelectedBackupId(backup.id);
      setIsDetailModalOpen(true);
      // Cargar detalles completos
      await getBackupById(backup.id);
    },
    [getBackupById]
  );

  // Manejar restaurar respaldo
  const handleRestoreBackup = useCallback((backup: Backup) => {
    setSelectedBackupId(backup.id);
    setIsRestoreModalOpen(true);
  }, []);

  // Confirmar restauración
  const handleConfirmRestore = async () => {
    if (!selectedBackupId) return;

    const result = await restoreBackup(selectedBackupId);
    if (restoreBackupThunk.fulfilled.match(result)) {
      showToast({
        type: 'warning',
        title: 'Restauración iniciada',
        message: `La restauración del respaldo está en proceso. Este proceso puede tomar varios minutos.`,
      });
      setIsRestoreModalOpen(false);
      setSelectedBackupId(null);
    }
  };

  // Manejar eliminar respaldo
  const handleDeleteBackup = async (backup: Backup) => {
    if (!window.confirm(`¿Está seguro de eliminar "${backup.name}"?`)) {
      return;
    }

    const result = await deleteBackup(backup.id);
    if (deleteBackupThunk.fulfilled.match(result)) {
      showToast({
        type: 'success',
        title: 'Respaldo eliminado',
        message: `El respaldo "${backup.name}" se ha eliminado correctamente.`,
      });
      // Recargar lista
      listBackups({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
      });
    }
  };

  // Manejar selección de archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Confirmar subida de archivo
  const handleConfirmUpload = async () => {
    if (!selectedFile) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Por favor seleccione un archivo',
      });
      return;
    }

    const result = await uploadBackup(selectedFile);
    if (uploadBackupThunk.fulfilled.match(result)) {
      showToast({
        type: 'success',
        title: 'Archivo subido',
        message: `El archivo "${selectedFile.name}" se ha subido correctamente. La restauración está en proceso...`,
      });
      setIsUploadModalOpen(false);
      setSelectedFile(null);
    }
  };

  // Calcular props de paginación desde el hook
  const totalPages = pagination?.totalPages || 1;
  const hasPrevPage = pagination?.hasPrevPage || false;
  const hasNextPage = pagination?.hasNextPage || false;
  const prevPage = pagination?.prevPage || null;
  const nextPage = pagination?.nextPage || null;
  const paginatedBackups = backups; // Ya viene paginado del backend

  // Columnas de la tabla
  const columns: TableColumn<Backup>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (value: string, backup: Backup) => (
        <div className="flex flex-col">
          <span className="font-medium">{value}</span>
          {backup.description && (
            <span
              className="text-sm"
              style={{ color: 'var(--color-base-secondary-typo)' }}
            >
              {backup.description}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'tablesCount',
      label: 'Tablas',
      render: (value: number, backup: Backup) => (
        <span
          className="text-sm"
          style={{ color: 'var(--color-base-secondary-typo)' }}
        >
          {value} {value === 1 ? 'tabla' : 'tablas'}
        </span>
      ),
    },
    {
      key: 'recordsCount',
      label: 'Registros',
      render: (value: number) => (
        <span
          className="text-sm"
          style={{ color: 'var(--color-base-secondary-typo)' }}
        >
          {value.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (value: BackupStatus) => getStatusBadge(value),
    },
    {
      key: 'size',
      label: 'Tamaño',
      render: (value: number) => (
        <span
          className="text-sm"
          style={{ color: 'var(--color-base-secondary-typo)' }}
        >
          {formatSize(value)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Fecha de Creación',
      render: (value: string) => (
        <span
          className="text-sm"
          style={{ color: 'var(--color-base-secondary-typo)' }}
        >
          {formatDate(value)}
        </span>
      ),
    },
    {
      key: 'completedAt',
      label: 'Fecha de Finalización',
      render: (value: string | null) => (
        <span
          className="text-sm"
          style={{ color: 'var(--color-base-secondary-typo)' }}
        >
          {formatDate(value)}
        </span>
      ),
    },
  ];

  // Acciones de fila
  const getRowActions = useCallback(
    (backup: Backup): DropdownMenuItem[] => {
      return [
        {
          label: 'Ver detalles',
          onClick: () => handleOpenDetail(backup),
        },
        { separator: true, label: '', onClick: () => {} },
        {
          label: 'Descargar',
          onClick: () => handleDownloadBackup(backup),
          disabled: backup.status !== 'AVAILABLE',
        },
        {
          label: 'Restaurar',
          onClick: () => handleRestoreBackup(backup),
          disabled: backup.status !== 'AVAILABLE',
        },
        {
          label: 'Eliminar',
          onClick: () => handleDeleteBackup(backup),
          variant: 'danger',
        },
      ];
    },
    [handleOpenDetail, handleRestoreBackup]
  );

  // Campos para el modal de detalles
  const detailFields: DetailField<Backup>[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'description', label: 'Descripción' },
    {
      key: 'status',
      label: 'Estado',
      render: (value: BackupStatus) => getStatusBadge(value),
    },
    {
      key: 'tablesCount',
      label: 'Tablas Respaldaas',
      render: (value: number) => `${value} ${value === 1 ? 'tabla' : 'tablas'}`,
    },
    {
      key: 'recordsCount',
      label: 'Registros Respaldaados',
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'size',
      label: 'Tamaño',
      render: (value: number) => formatSize(value),
    },
    {
      key: 'createdAt',
      label: 'Fecha de Creación',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'completedAt',
      label: 'Fecha de Finalización',
      render: (value: string | null) => formatDate(value),
    },
    { key: 'createdBy', label: 'Creado Por' },
    {
      key: 'filePath',
      label: 'Ruta del Archivo',
      render: (value: string | null) => value || 'N/A',
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Contenedor para Header */}
      <div className="rounded-lg mt-6 p-6 bg-(--color-component-bg)">
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-4 w-full min-w-0">
          <div className="sm:max-w-2xs w-full">
            <Search
              placeholder="Buscar respaldos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={(value) => setSearchTerm(value)}
              onClear={() => setSearchTerm('')}
              fullWidth
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 shrink-0">
            <Button
              variant="secondary"
              size="small"
              onClick={() => setIsUploadModalOpen(true)}
            >
              Restaurar desde Archivo
            </Button>
            <Button
              variant="outline"
              size="small"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Crear Respaldo
            </Button>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card variant="flat">
          <div className="flex flex-col gap-2">
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--color-base-secondary-typo)' }}
            >
              Total Respaldos
            </span>
            <span
              className="text-2xl font-bold"
              style={{ color: 'var(--color-base-primary-typo)' }}
            >
              {backups.length}
            </span>
          </div>
        </Card>
        <Card variant="flat">
          <div className="flex flex-col gap-2">
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--color-base-secondary-typo)' }}
            >
              Completados
            </span>
            <span
              className="text-2xl font-bold"
              style={{ color: 'var(--color-base-primary-typo)' }}
            >
              {backups.filter((b) => b.status === 'AVAILABLE').length}
            </span>
          </div>
        </Card>
        <Card variant="flat">
          <div className="flex flex-col gap-2">
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--color-base-secondary-typo)' }}
            >
              Espacio Total
            </span>
            <span
              className="text-2xl font-bold"
              style={{ color: 'var(--color-base-primary-typo)' }}
            >
              {formatSize(backups.reduce((sum, b) => sum + b.size, 0))}
            </span>
          </div>
        </Card>
        <Card variant="flat">
          <div className="flex flex-col gap-2">
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--color-base-secondary-typo)' }}
            >
              Total Registros
            </span>
            <span
              className="text-2xl font-bold"
              style={{ color: 'var(--color-base-primary-typo)' }}
            >
              {backups
                .filter((b) => b.status === 'AVAILABLE')
                .reduce((sum, b) => sum + b.recordsCount, 0)
                .toLocaleString()}
            </span>
          </div>
        </Card>
        <Card variant="flat">
          <div className="flex flex-col gap-2">
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--color-base-secondary-typo)' }}
            >
              Último Respaldo
            </span>
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--color-base-primary-typo)' }}
            >
              {backups.length > 0
                ? formatDate(backups[0].completedAt || backups[0].createdAt)
                : 'N/A'}
            </span>
          </div>
        </Card>
      </div>

      {/* Tabla de respaldos */}
      <Card>
        <div className="flex flex-col gap-4">
          {/* Tabla de respaldos */}
          {isLoadingList ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-(--color-gray-1) border-t-(--color-primary-color) rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                data={paginatedBackups}
                rowActions={getRowActions}
                onRowClick={handleOpenDetail}
                className="border-0 bg-transparent"
              />
              {/* Paginación */}
              {backups.length > 0 && totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    hasPrevPage={hasPrevPage}
                    hasNextPage={hasNextPage}
                    prevPage={prevPage}
                    nextPage={nextPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Modal de crear respaldo */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Respaldo"
      >
        <BackupForm
          onSubmit={handleCreateBackup}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isCreating}
        />
      </Modal>

      {/* Modal de subir archivo para restaurar */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedFile(null);
        }}
        title="Restaurar desde Archivo"
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <p
              className="text-sm"
              style={{ color: 'var(--color-base-primary-typo)' }}
            >
              Seleccione un archivo de respaldo (.gzip) para restaurar la base
              de datos.
            </p>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="backup-file"
                className="text-sm font-medium"
                style={{ color: 'var(--color-base-primary-typo)' }}
              >
                Archivo de Respaldo *
              </label>
              <div className="flex flex-col gap-3">
                <input
                  id="backup-file"
                  type="file"
                  accept=".gzip"
                  onChange={handleFileSelect}
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:cursor-pointer file:bg-(--color-primary-color) file:text-white hover:file:opacity-90"
                  style={{
                    color: 'var(--color-base-primary-typo)',
                  }}
                />
                {selectedFile && (
                  <Card variant="flat">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <span
                          className="text-sm font-medium"
                          style={{ color: 'var(--color-base-primary-typo)' }}
                        >
                          {selectedFile.name}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: 'var(--color-base-secondary-typo)' }}
                        >
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => setSelectedFile(null)}
                      >
                        ✕
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
            <Card variant="flat">
              <div className="flex flex-col gap-2 text-(--color-yellow)">
                <p className="text-sm font-medium">ADVERTENCIA</p>
                <p className="text-sm">
                  Al restaurar, se reemplazará toda la información actual por la
                  del archivo seleccionado. Se recomienda crear un respaldo
                  antes de continuar.
                </p>
              </div>
            </Card>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setIsUploadModalOpen(false);
                setSelectedFile(null);
              }}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmUpload}
              disabled={!selectedFile || isUploading}
              isLoading={isUploading}
              style={{
                backgroundColor: 'var(--color-primary-color)',
              }}
            >
              {isUploading ? 'Subiendo...' : 'Subir y Restaurar'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de detalles */}
      <DetailModal
        title="Detalles del Respaldo"
        data={currentBackup}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBackupId(null);
          clearCurrentBackup();
        }}
        fields={detailFields}
        maxWidth="lg"
      />

      {/* Modal de restaurar respaldo */}
      <Modal
        isOpen={isRestoreModalOpen}
        onClose={() => {
          setIsRestoreModalOpen(false);
          setSelectedBackupId(null);
        }}
        title="Restaurar Respaldo"
      >
        {selectedBackupId && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p
                style={{ color: 'var(--color-base-primary-typo)' }}
                className="text-sm"
              >
                ¿Está seguro de que desea restaurar este respaldo?
              </p>
              {(() => {
                const backup = backups.find((b) => b.id === selectedBackupId);
                if (!backup) return null;
                return (
                  <>
                    <Card variant="flat">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between">
                          <span
                            className="text-sm"
                            style={{
                              color: 'var(--color-base-secondary-typo)',
                            }}
                          >
                            Nombre:
                          </span>
                          <span
                            className="text-sm font-medium"
                            style={{ color: 'var(--color-base-primary-typo)' }}
                          >
                            {backup.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span
                            className="text-sm"
                            style={{
                              color: 'var(--color-base-secondary-typo)',
                            }}
                          >
                            Tablas:
                          </span>
                          <span
                            className="text-sm font-medium"
                            style={{ color: 'var(--color-base-primary-typo)' }}
                          >
                            {backup.tablesCount} tablas
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span
                            className="text-sm"
                            style={{
                              color: 'var(--color-base-secondary-typo)',
                            }}
                          >
                            Registros:
                          </span>
                          <span
                            className="text-sm font-medium"
                            style={{ color: 'var(--color-base-primary-typo)' }}
                          >
                            {backup.recordsCount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span
                            className="text-sm"
                            style={{
                              color: 'var(--color-base-secondary-typo)',
                            }}
                          >
                            Fecha:
                          </span>
                          <span
                            className="text-sm font-medium"
                            style={{ color: 'var(--color-base-primary-typo)' }}
                          >
                            {formatDate(backup.createdAt)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span
                            className="text-sm"
                            style={{
                              color: 'var(--color-base-secondary-typo)',
                            }}
                          >
                            Tamaño:
                          </span>
                          <span
                            className="text-sm font-medium"
                            style={{ color: 'var(--color-base-primary-typo)' }}
                          >
                            {formatSize(backup.size)}
                          </span>
                        </div>
                      </div>
                    </Card>
                    <Card variant="flat">
                      <div className="flex flex-col gap-2 text-(--color-yellow)">
                        <p className="text-sm font-medium">IMPORTANTE</p>
                        <p className="text-sm">
                          Esta acción restaurará la base de datos con los datos
                          del respaldo seleccionado. Se recomienda crear un
                          respaldo actual antes de proceder.
                        </p>
                      </div>
                    </Card>
                  </>
                );
              })()}
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsRestoreModalOpen(false);
                  setSelectedBackupId(null);
                }}
                disabled={isRestoring}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                isLoading={isRestoring}
              >
                Confirmar Restauración
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
