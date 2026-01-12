import { useEffect, useState, useCallback, useRef } from 'react';
import { PageHeader } from '@widgets/PageHeader';
import {
  Table,
  useToast,
  FilterDropdown,
  createStatusActions,
  Pagination,
} from '@shared/ui';
import { DetailModal } from '@shared/ui';
import type { DropdownMenuItem, FilterConfig } from '@shared/ui';
import { useUsers } from '../../lib/useUsers';
import { UserForm } from '../UserForm/UserForm';
import { ChangePasswordForm } from './ChangePasswordForm';
import type { User } from '@entities/user';
import type { TableColumn, DetailField } from '@shared/ui';
import { UserRole } from '@entities/user';
import type { ChangePasswordRequest } from '../../model/types';

/**
 * Componente para listar y gestionar usuarios
 * Contiene toda la lógica de negocio y UI para la gestión de usuarios
 */
export function UsersList() {
  const { showToast } = useToast();
  const {
    users,
    pagination,
    isLoadingList,
    listUsers,
    createUser,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser,
    changePassword,
  } = useUsers();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  // Estados para filtros
  const [filters, setFilters] = useState<
    Record<string, string | string[] | boolean>
  >({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Obtener activeOnly y role de filters
  const activeOnly = filters.activeOnly === true;
  const role = filters.role as UserRole | undefined;

  // Cargar usuarios
  const loadUsers = useCallback(async () => {
    const result = await listUsers({
      page,
      limit: 10,
      search: searchTerm || undefined,
      activeOnly: activeOnly || undefined,
      role: role || undefined,
      // Solo incluir sortBy y sortOrder si ambos están definidos
      ...(sortBy && sortOrder ? { sortBy, sortOrder } : {}),
    });
    if (!result.success) {
      showToast({
        type: 'error',
        title: 'Error al cargar usuarios',
        message: result.error || 'No se pudieron cargar los usuarios',
      });
    }
  }, [
    page,
    searchTerm,
    activeOnly,
    role,
    sortBy,
    sortOrder,
    listUsers,
    showToast,
  ]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Manejar búsqueda
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  // Manejar ordenamiento
  const handleSort = useCallback(
    (columnKey: string, direction: 'asc' | 'desc' | null) => {
      if (direction === null) {
        // Si la dirección es null, resetear el ordenamiento
        setSortBy(null);
        setSortOrder(null);
      } else {
        // Si hay dirección, establecer ambos valores
        setSortBy(columnKey);
        setSortOrder(direction);
      }
      setPage(1);
    },
    []
  );

  // Manejar crear
  const handleCreate = useCallback(
    async (data: any) => {
      const result = await createUser(data);
      if (!result.success) {
        showToast({
          type: 'error',
          title: 'Error al crear usuario',
          message: result.error || 'No se pudo crear el usuario',
        });
        throw new Error(result.error || 'No se pudo crear el usuario');
      }
      setIsCreateModalOpen(false);
      showToast({
        type: 'success',
        title: 'Usuario creado',
        message: 'El usuario se ha creado exitosamente',
      });
      loadUsers();
    },
    [createUser, loadUsers, showToast]
  );

  // Manejar editar
  const handleEdit = useCallback(
    async (data: any) => {
      if (!selectedUser) return;
      const result = await updateUser(selectedUser.id, data);
      if (!result.success) {
        showToast({
          type: 'error',
          title: 'Error al actualizar usuario',
          message: result.error || 'No se pudo actualizar el usuario',
        });
        throw new Error(result.error || 'No se pudo actualizar el usuario');
      }
      setIsEditModalOpen(false);
      setSelectedUser(null);
      showToast({
        type: 'success',
        title: 'Usuario actualizado',
        message: 'El usuario se ha actualizado exitosamente',
      });
      loadUsers();
    },
    [selectedUser, updateUser, loadUsers, showToast]
  );

  // Manejar eliminar
  const handleDelete = useCallback(
    async (user: User) => {
      if (
        !window.confirm(
          `¿Estás seguro de eliminar el usuario "${user.username}"?`
        )
      ) {
        return;
      }
      const result = await deleteUser(user.id);
      if (!result.success) {
        showToast({
          type: 'error',
          title: 'Error al eliminar usuario',
          message: result.error || 'No se pudo eliminar el usuario',
        });
        return;
      }
      showToast({
        type: 'success',
        title: 'Usuario eliminado',
        message: `El usuario "${user.username}" se ha eliminado exitosamente`,
      });
      loadUsers();
    },
    [deleteUser, loadUsers, showToast]
  );

  // Manejar activar/desactivar
  const handleToggleActive = useCallback(
    async (user: User) => {
      if (user.isActive) {
        const result = await deactivateUser(user.id);
        if (!result.success) {
          showToast({
            type: 'error',
            title: 'Error al desactivar usuario',
            message: result.error || 'No se pudo desactivar el usuario',
          });
          return;
        }
        showToast({
          type: 'success',
          title: 'Usuario desactivado',
          message: `El usuario "${user.username}" se ha desactivado exitosamente`,
        });
      } else {
        const result = await activateUser(user.id);
        if (!result.success) {
          showToast({
            type: 'error',
            title: 'Error al activar usuario',
            message: result.error || 'No se pudo activar el usuario',
          });
          return;
        }
        showToast({
          type: 'success',
          title: 'Usuario activado',
          message: `El usuario "${user.username}" se ha activado exitosamente`,
        });
      }
      loadUsers();
    },
    [activateUser, deactivateUser, loadUsers, showToast]
  );

  // Abrir modal de edición
  const handleOpenEdit = useCallback((user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  }, []);

  // Abrir modal de detalles
  const handleOpenDetail = useCallback((user: User) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  }, []);

  // Abrir modal de cambio de contraseña
  const handleOpenChangePassword = useCallback((user: User) => {
    setSelectedUser(user);
    setIsChangePasswordModalOpen(true);
  }, []);

  // Manejar cambio de contraseña
  const handleChangePassword = useCallback(
    async (data: ChangePasswordRequest) => {
      if (!selectedUser) return;
      const result = await changePassword(selectedUser.id, data);
      if (!result.success) {
        showToast({
          type: 'error',
          title: 'Error al cambiar contraseña',
          message: result.error || 'No se pudo cambiar la contraseña',
        });
        throw new Error(result.error || 'No se pudo cambiar la contraseña');
      }
      setIsChangePasswordModalOpen(false);
      setSelectedUser(null);
      showToast({
        type: 'success',
        title: 'Contraseña actualizada',
        message: `La contraseña de "${selectedUser.username}" se ha actualizado exitosamente`,
      });
    },
    [selectedUser, changePassword, showToast]
  );

  // Columnas de la tabla
  const columns: TableColumn<User>[] = [
    {
      key: 'username',
      label: 'Usuario',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Correo Electrónico',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Rol',
      render: (value: UserRole) => {
        return value === UserRole.ADMIN ? 'Administrador' : 'Personal';
      },
    },
  ];

  // Campos para el modal de detalles
  const detailFields: DetailField<User>[] = [
    { key: 'username', label: 'Nombre de Usuario' },
    { key: 'email', label: 'Correo Electrónico' },
    {
      key: 'role',
      label: 'Rol',
      render: (value: UserRole) => {
        return value === UserRole.ADMIN ? 'Administrador' : 'Personal';
      },
    },
    {
      key: 'isActive',
      label: 'Estado',
      render: (value: boolean) => (
        <span
          className={
            value
              ? 'text-(--color-green) font-medium'
              : 'text-(--color-salmon) font-medium'
          }
        >
          {value ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Último Acceso',
      render: (value: Date | string | null) => {
        // Si es null, el usuario nunca se ha logueado
        if (value === null || value === undefined) {
          return 'Nunca';
        }
        // Manejar tanto Date como string ISO
        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) return 'Nunca';
        return date.toLocaleDateString('es-MX', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    {
      key: 'createdAt',
      label: 'Fecha de Creación',
      render: (value: Date | string) => {
        // Manejar tanto Date como string ISO
        const date = value instanceof Date ? value : new Date(value);
        return date.toLocaleDateString('es-MX', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      },
    },
    {
      key: 'updatedAt',
      label: 'Última Actualización',
      render: (value: Date | string) => {
        // Manejar tanto Date como string ISO
        const date = value instanceof Date ? value : new Date(value);
        return date.toLocaleDateString('es-MX', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      },
    },
  ];

  // Configuración de filtros
  const filterConfigs: FilterConfig[] = [
    {
      columnKey: 'activeOnly',
      label: 'Solo activos',
      type: 'toggle',
    },
    {
      columnKey: 'role',
      label: 'Rol',
      type: 'select',
      options: [
        { value: UserRole.ADMIN, label: 'Administrador' },
        { value: UserRole.STAFF, label: 'Personal' },
      ],
    },
  ];

  // Manejar cambios de filtros
  const handleFilterChange = useCallback(
    (columnKey: string, value: string | string[] | boolean) => {
      setFilters((prev) => {
        const updated = { ...prev, [columnKey]: value };

        // Eliminar el filtro si es vacío, false o array vacío
        if (Array.isArray(value) && value.length === 0) {
          delete updated[columnKey];
        } else if (value === '' || value === false) {
          delete updated[columnKey];
        }

        return updated;
      });
      setPage(1); // Resetear a primera página al cambiar filtros
    },
    []
  );

  // Resetear filtros
  const handleResetFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  // Verificar si hay filtros activos
  const hasActiveFilters = Object.values(filters).some((value) => {
    if (typeof value === 'boolean') return value === true;
    if (typeof value === 'string') return value !== '';
    if (Array.isArray(value)) return value.length > 0;
    return false;
  });

  // Acciones de fila usando createStatusActions
  const getRowActions = useCallback(
    (user: User): DropdownMenuItem[] => {
      // Obtener acciones basadas en el estado usando createStatusActions
      // No usar showSeparator porque vamos a insertar "Cambiar contraseña" manualmente
      const statusActions = createStatusActions(user, {
        currentStatus: user.isActive ? 'active' : 'inactive',
        getStatus: (row) => (row.isActive ? 'active' : 'inactive'),
        transitions: {
          active: {
            additionalActions: [
              { label: 'Editar', onClick: () => handleOpenEdit(user) },
              {
                label: 'Eliminar',
                onClick: () => handleDelete(user),
                variant: 'danger' as const,
              },
            ],
            actions: [
              {
                label: 'Desactivar',
                targetStatus: 'inactive',
                onClick: () => handleToggleActive(user),
              },
            ],
            showSeparator: false,
          },
          inactive: {
            additionalActions: [
              { label: 'Editar', onClick: () => handleOpenEdit(user) },
              {
                label: 'Eliminar',
                onClick: () => handleDelete(user),
                variant: 'danger' as const,
              },
            ],
            actions: [
              {
                label: 'Activar',
                targetStatus: 'active',
                onClick: () => handleToggleActive(user),
              },
            ],
            showSeparator: false,
          },
        },
      });

      // Separar las acciones: additionalActions vienen primero, luego actions
      const additionalActionsCount = 2;
      const actionsWithSeparatorAndPassword: DropdownMenuItem[] = [
        ...statusActions.slice(0, additionalActionsCount),
        { separator: true, label: 'separator', onClick: () => {} },
        {
          label: 'Cambiar contraseña',
          onClick: () => handleOpenChangePassword(user),
        },
        ...statusActions.slice(additionalActionsCount),
      ];

      // Agregar "Ver detalles" al inicio del menú, seguido de un separador
      return [
        {
          label: 'Ver detalles',
          onClick: () => handleOpenDetail(user),
        },
        { separator: true, label: 'separator', onClick: () => {} },
        ...actionsWithSeparatorAndPassword,
      ];
    },
    [
      handleOpenDetail,
      handleOpenEdit,
      handleToggleActive,
      handleDelete,
      handleOpenChangePassword,
    ]
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Contenedor para PageHeader */}
      <div className="rounded-lg mt-6 p-6 bg-(--color-component-bg)">
        <PageHeader
          title="Usuarios"
          searchPlaceholder="Buscar usuario..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          primaryAction={{
            label: 'Añadir',
            onClick: () => setIsCreateModalOpen(true),
          }}
          filters={{
            label: 'Filtros',
            onClick: () => setIsFiltersOpen(!isFiltersOpen),
            isActive: hasActiveFilters,
            buttonRef: filterButtonRef,
          }}
        />

        {/* FilterDropdown */}
        <FilterDropdown
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          triggerRef={filterButtonRef}
          filterConfigs={filterConfigs}
          selectedFilters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Contenedor para Table y Paginación */}
      <div className="flex flex-col gap-6 rounded-lg p-6 bg-(--color-component-bg)">
        {isLoadingList ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-(--color-gray-1) border-t-(--color-primary-color) rounded-full animate-spin" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={users}
            statusColumn={{
              key: 'isActive',
              getStatus: (row) => ({
                status: row.isActive ? 'active' : 'inactive',
                label: row.isActive ? 'Activo' : 'Inactivo',
              }),
            }}
            controlledSortColumn={sortBy}
            controlledSortDirection={sortOrder}
            onSort={handleSort}
            rowActions={getRowActions}
            onRowClick={handleOpenDetail}
            className="border-0 bg-transparent"
          />
        )}

        {/* Paginación */}
        {pagination && pagination.totalPages > 1 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            hasPrevPage={pagination.hasPrevPage}
            hasNextPage={pagination.hasNextPage}
            prevPage={pagination.prevPage}
            nextPage={pagination.nextPage}
            onPageChange={(newPage) => {
              if (!isLoadingList) {
                setPage(newPage);
              }
            }}
          />
        )}
      </div>

      {/* Modales */}
      <UserForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        mode="create"
      />

      <UserForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleEdit}
        mode="edit"
        initialData={selectedUser}
      />

      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedUser(null);
        }}
        title="Detalles del Usuario"
        data={selectedUser}
        fields={detailFields}
      />

      {selectedUser && (
        <ChangePasswordForm
          isOpen={isChangePasswordModalOpen}
          onClose={() => {
            setIsChangePasswordModalOpen(false);
            setSelectedUser(null);
          }}
          onSubmit={handleChangePassword}
          username={selectedUser.username}
        />
      )}
    </div>
  );
}
