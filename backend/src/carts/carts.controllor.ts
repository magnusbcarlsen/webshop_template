import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Req,
  Res,
  // NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CartsService } from './carts.service';
// import { CreateCartDto } from './dto/create-cart.dto';
// import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from './entities/cart.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  // PRIVATE HELPER: get or create a cart based on session cookie
  private async getOrCreateCartFromSession(
    req: Request,
    res?: Response,
  ): Promise<Cart> {
    let sessionId = req.cookies?.sessionId as string | undefined;
    let cart: Cart | undefined;

    if (sessionId) {
      try {
        cart = await this.cartsService.findBySession(sessionId);
      } catch (e) {
        console.warn(`Invalid sessionId ${sessionId}, resetting`, e);
        sessionId = undefined;
      }
    }

    if (!sessionId || !cart) {
      cart = await this.cartsService.createEmpty();
      sessionId = cart.sessionId;
      if (res) {
        res.cookie('sessionId', sessionId, {
          httpOnly: true,
          path: '/',
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });
      }
    }

    return cart;
  }

  @Get('items')
  async getCart(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Cart> {
    return this.getOrCreateCartFromSession(req, res);
  }

  @Post('items')
  async addItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: AddCartItemDto,
  ): Promise<Cart> {
    const cart = await this.getOrCreateCartFromSession(req, res);
    return this.cartsService.addItemToCart(cart.id, dto);
  }

  @Delete('items/:itemId')
  async removeItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Cart> {
    const sessionId = req.cookies?.sessionId as string | undefined;
    if (!sessionId) {
      throw new ForbiddenException('No sessionId cookie found');
    }

    return this.cartsService.removeItemFromCart(sessionId, itemId);
  }

  // 🔐 BLOCK unsafe raw access to all carts or specific cart IDs

  @Post()
  create(): never {
    throw new ForbiddenException('Use /carts/items instead');
  }

  @Get()
  findAll(): never {
    throw new ForbiddenException('Not allowed');
  }

  @Get(':id')
  findOne(): never {
    throw new ForbiddenException('Not allowed');
  }

  @Patch(':id')
  update(): never {
    throw new ForbiddenException('Not allowed');
  }
}
