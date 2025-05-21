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
    let cartId = cookies.cartId;
    if (!cartId) {
      // no cart yet → create one
      const cart = await this.cartsService.create({ items: [] });
      cartId = cart.id.toString();
      res.cookie('cartId', cartId, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
    }
    return this.cartsService.findOne(+cartId);
  }

  @Post('items')
  async addItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: AddCartItemDto,
  ): Promise<Cart> {
    // Cast req.cookies to a known shape
    const cookies = req.cookies as Record<string, string | undefined>;
    let cartId = cookies.cartId;

    if (!cartId) {
      const cart = await this.cartsService.create({ items: [] });
      cartId = cart.id.toString();
      res.cookie('cartId', cartId, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
    }

    return this.cartsService.addItemToCart(+cartId, dto);
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
