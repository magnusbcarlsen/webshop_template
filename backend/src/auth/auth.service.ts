import { UsersService } from '@/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

// Match the clear-text

// Hash & save the new bcrypt password

// Continue and succeed

// Every login thereafter uses bcrypt.compare() against the stored hash.

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    let stored = user.password;

    // 1) Legacy plain-text fallback
    if (!stored.startsWith('$2')) {
      if (password !== stored) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const hash = await bcrypt.hash(password, 10);
      await this.users.updatePassword(user.id, hash);
      stored = hash;
    }
    // 2) migrate: hash & persist
    const isMatch = await bcrypt.compare(password, stored);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

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
