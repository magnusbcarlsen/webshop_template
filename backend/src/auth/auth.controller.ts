// src/auth/auth.controller.ts
import { Controller, Post, UseGuards, Req, Res, Get } from '@nestjs/common';
import { Request, Response } from 'express';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { UsersService } from '@/users/users.service';
import { UserRole } from '@/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

const isProduction = process.env.NODE_ENV === 'production';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly usersService: UsersService, // ← inject the UsersService
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: Request & { user: { id: number } },
    @Res({ passthrough: true }) res: Response,
  ) {
    // 1) Load the full user (so we get role_id)
    const userEntity = await this.usersService.findById(req.user.id);
    if (!userEntity) {
      throw new Error('User not found');
    }

    // 2) Map numeric role_id → enum string, then normalize to uppercase
    const baseRole = userEntity.role_id === 1 ? UserRole.ADMIN : UserRole.USER;
    const normalizedRole = baseRole.toUpperCase();

    // 3) Sign the JWT via AuthService.login()
    const { accessToken, role } = this.auth.login({
      id: userEntity.id,
      role: normalizedRole,
    });

    // 4) Set the HttpOnly cookie
    res.cookie('jwt', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60, // 1 hour
    });

    // 5) Return the normalized role for client-side routing
    return { success: true, role };
  }

  @Get('me')
  async status(@Req() req: Request & { cookies: { jwt?: string } }) {
    const token = req.cookies?.jwt;
    if (!token) {
      return { authenticated: false };
    }
    try {
      const payload = this.jwtService.verify<{ sub: string; role: string }>(
        token,
      );
      const userId = Number(payload.sub);
      const user = await this.usersService.findById(userId);
      if (!user) {
        return { authenticated: false };
      }
      return { authenticated: true, id: userId, role: payload.role };
    } catch {
      return { authenticated: false };
    }
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    });
    return { success: true };
  }
}
