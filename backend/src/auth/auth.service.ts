import { UsersService } from '@/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}
  // async validateUser(email: string, password: string) {
  //   const user = await this.users.findByEmail(email);
  //   if (
  //     user?.passwordHash &&
  //     typeof password === 'string' &&
  //     typeof user.passwordHash === 'string'
  //   ) {
  //     try {
  //       const isMatch = await bcrypt.compare(password, user.passwordHash);
  //       if (isMatch) {
  //         const { passwordHash, ...safe } = user;
  //         return safe;
  //       }
  //     } catch (error: unknown) {
  //       // Narrow the type before you use it
  //       if (error instanceof Error) {
  //         console.error('Error comparing passwords:', error.message);
  //       } else {
  //         // Fallback for non‐Error throwables
  //         console.error('Error comparing passwords:', String(error));
  //       }
  //     }

  //     throw new UnauthorizedException('Invalid credentials');
  //   }
  // }
  async validateUser(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // === TEMPORARY PLAIN-TEXT CHECK ===
    // assume your DB column is `user.password`
    if (password !== user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // ==================================

    // strip the password field before returning
    const { password: _p, ...safeUser } = user;
    return safeUser;
  }
  login(user: { id: string | number; role: string }) {
    const payload = { sub: user.id, role: user.role };
    return {
      accessToken: this.jwt.sign(payload),
    };
  }
}
