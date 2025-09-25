export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  lastName: string;
  sub: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    name: string;
    last_name: string;
    email: string;
    password: string;
    birthday?: Date | null;
    created_at?: Date | null;
    updated_at?: Date | null;
  };
}
