// import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
// import { Roles } from '@/auth/roles.decorator';
// import { RolesGuard } from '@/auth/roles.guard';
// import { Controller, UseGuards, Request } from '@nestjs/common';

// @Controller('admin')
// @UseGuards(JwtAuthGuard, RolesGuard)
// export class AdminController {
//   @Roles('admin')
//   getAdmin(@Request() req: Request & { users: { id: number; role: string } }) {
//     return { message: `Hello Admin #${req.users.id}` };
//   }
// }

import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Roles } from '@/auth/roles.decorator';
import { RolesGuard } from '@/auth/roles.guard';
import { Controller, UseGuards, Get, Req } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import type { Request as ExpressReq } from 'express';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  async getAdmin(
    @Req() req: ExpressReq & { user: { id: number; role: string } },
  ) {
    const id = req.user.id;
    const user = await this.usersService.findById(id);

    return {
      message: `Hello Admin #${id}`,
      firstName: user?.firstName,
      lastName: user?.lastName,
    };
  }
}
