import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Roles } from '@/auth/roles.decorator';
import { RolesGuard } from '@/auth/roles.guard';
import { Controller, UseGuards, Request } from '@nestjs/common';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Roles('admin')
  getAdmin(@Request() req: Request & { users: { id: number; role: string } }) {
    return { message: `Hello Admin #${req.users.id}` };
  }
}
