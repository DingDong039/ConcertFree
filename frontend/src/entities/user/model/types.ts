// frontend/src/entities/user/model/types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export type UserRole = User['role'];

export const isAdmin = (user: User | null): user is User & { role: 'admin' } => {
  return user?.role === 'admin';
};
