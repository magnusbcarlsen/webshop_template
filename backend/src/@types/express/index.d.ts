import { UserRole } from '@/users/user.entity';

declare global {
  namespace Express {
    interface User {
      id: number;
      role: UserRole;
    }
  }
}
