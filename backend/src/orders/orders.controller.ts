// backend/src/orders/orders.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  Res,
  UseGuards,
  DefaultValuePipe,
  ParseBoolPipe,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('orders') // NO /api prefix - nginx handles this
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ─── GUEST: Create a new order tied to sessionId ─────────────────
  @Post()
  async create(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: CreateOrderDto,
  ): Promise<Order> {
    return this.ordersService.createFromSession(req, res, dto);
  }

  // ─── ADMIN: List all orders
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findAllAdmin(
    @Query('withDeleted', new DefaultValuePipe(false), ParseBoolPipe)
    withDeleted: boolean,
  ): Promise<Order[]> {
    return this.ordersService.findAll(withDeleted);
  }

  // ─── ADMIN: Get any order by ID (admin access) ───────────────────
  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findOneAdmin(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  // ─── GUEST: View your own order by sessionId ────────────────────
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<Order> {
    const sessionId = req.cookies.sessionId;
    if (!sessionId) {
      throw new ForbiddenException('No sessionId cookie found');
    }
    return this.ordersService.findBySessionSecure(id, sessionId);
  }

  // ─── ADMIN: Update any order ─────────────────────────────────────
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderDto,
  ): Promise<Order> {
    return this.ordersService.update(id, dto);
  }

  // ─── ADMIN: Soft-delete an order ─────────────────────────────────
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async softDelete(@Param('id', ParseIntPipe) id: number) {
    await this.ordersService.remove(id);
    return { success: true };
  }

  // ─── ADMIN: Restore a soft-deleted order ─────────────────────────
  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async restore(@Param('id', ParseIntPipe) id: number) {
    await this.ordersService.restore(id);
    return { success: true };
  }
}
