export interface UserInfo {
  name: string;
  role: string;
  avatar?: string;
  email?: string;
}

export interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  user?: UserInfo;
  /** Callback cuando se hace click en "Perfil" (deprecated, usar onProfileClick) */
  onUserMenuClick?: () => void;
  /** Callback cuando se hace click en "Perfil" */
  onProfileClick?: () => void;
  /** Callback cuando se hace click en "Cambiar contraseña" */
  onChangePasswordClick?: () => void;
  /** Callback cuando se hace click en "Salir" */
  onLogoutClick?: () => void;
  className?: string;
  // Prop para móviles
  onMenuClick?: () => void;
}
