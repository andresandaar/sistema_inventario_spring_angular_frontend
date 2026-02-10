export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  roleId: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: Date;
  refreshExpiresIn?: Date;
  username: string;
  role: string;
  fullName?: string;
  email?: string;
}

export interface UserInfo {
  username: string;
  role: string;
  fullName?: string;
  email?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmationPassword: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
  confirmationPassword: string;
}

export interface JwtPayload {
  sub: string; // Email del usuario
  role: string; // Rol del usuario (ej: "Vendedor", "Administrador")
  nombre: string; // Nombre completo del usuario
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
}

// Legacy alias for backward compatibility
export interface RefreshRequest extends RefreshTokenRequest {}
