// src/auth/auth.controller.ts
import { Controller, Post, UseGuards, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { UsersService } from '@/users/users.service';
import { UserRole } from '@/users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly usersService: UsersService, // ← inject the UsersService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: Request & { user: { id: number } },
    @Res({ passthrough: true }) res: Response,
  ) {
    // 1) Lookup your full user so you can read role_id
    const userEntity = await this.usersService.findById(req.user.id);
    if (!userEntity) {
      throw new Error('User not found');
    }

    // 2) Map numeric role_id → the enum string your RolesGuard expects
    const roleString =
      userEntity.role_id === 1 ? UserRole.ADMIN : UserRole.USER; // or whatever your mapping is

    // 3) Sign your JWT with the correct role
    const { accessToken } = this.auth.login({
      id: userEntity.id,
      role: roleString,
    });

    // 4) Set your cookie as before
    res.cookie('jwt', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/', // so it’s sent on /api/admin
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    return { success: true };
  }
}
