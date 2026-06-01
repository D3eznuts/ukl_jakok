export const AuthRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export type AuthRole = (typeof AuthRole)[keyof typeof AuthRole];

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  user: AuthUser;
};

export type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  role: AuthRole;
};
