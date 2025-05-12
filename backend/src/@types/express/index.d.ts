import { UserRole } from '@/users/entities/user.entity';

declare global {
  namespace Express {
    interface User {
      id: number;
      role: UserRole;
    }
  }
}
