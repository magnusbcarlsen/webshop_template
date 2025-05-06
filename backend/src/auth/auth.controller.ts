import { Controller, Post, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Request, Response } from 'express';
import { UserRole } from '@/users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // cast away the generic Express.User
    const user = req.user as { id: number; role: UserRole };
    if (!user) {
      throw new Error('User not found');
    }
    const { accessToken } = this.auth.login({
      id: user.id,
      role: user.role,
    });
    res.cookie('jwt', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
    });
    return { success: true };
  }
}
