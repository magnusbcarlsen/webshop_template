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
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Cart } from './entities/cart.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get('items')
  async getCart(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Cart> {
    const cookies = req.cookies as Record<string, string | undefined>;
    let sessionId = cookies.sessionId;

    console.log('Incoming sessionId:', sessionId);

    let cart!: Cart;
    if (sessionId) {
      try {
        cart = await this.cartsService.findBySession(sessionId);
      } catch (e) {
        console.warn(`Invalid sessionId ${sessionId}, creating a new cart`, e);
        // Log the specific error and reset the session
        if (e instanceof Error) {
          console.error(`Error details: ${e.message}`);
        }
        sessionId = undefined;
      }
    }

    if (!sessionId) {
      cart = await this.cartsService.createEmpty();
      sessionId = cart.sessionId;
      console.log('Created new sessionId:', sessionId);
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
    }

    return cart;
  }

  @Post('items')
  async addItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: AddCartItemDto,
  ): Promise<Cart> {
    const cookies = req.cookies as Record<string, string | undefined>;
    let sessionId = cookies.sessionId;

    console.log('Adding item; incoming sessionId:', sessionId);

    let cart!: Cart;
    if (sessionId) {
      try {
        cart = await this.cartsService.findBySession(sessionId);
      } catch {
        console.warn(`Invalid sessionId ${sessionId}, creating a new cart`);
        sessionId = undefined;
      }
    }

    if (!sessionId) {
      cart = await this.cartsService.createEmpty();
      sessionId = cart.sessionId;
      console.log('Created new sessionId for add:', sessionId);
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
    }

    // now add by numeric ID under the hood:
    const updated = await this.cartsService.addItemToCart(cart.id, dto);
    console.log(`Cart ${cart.id} now has ${updated.items.length} items`);
    return updated;
  }

  @Post()
  create(@Body() dto: CreateCartDto): Promise<Cart> {
    return this.cartsService.create(dto);
  }

  @Get()
  findAll(): Promise<Cart[]> {
    return this.cartsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Cart> {
    return this.cartsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartDto,
  ): Promise<Cart> {
    return this.cartsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.cartsService.remove(id);
  }
}
