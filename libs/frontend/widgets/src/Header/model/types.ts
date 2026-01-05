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
  onUserMenuClick?: () => void;
  className?: string;
}
