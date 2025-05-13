import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Attribute } from './entities/attribute.entity';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class VariantsService {
  constructor(
    @InjectRepository(Attribute) private attrs: Repository<Attribute>,
  ) {}

  create(dto: CreateVariantDto) {
    /* ... */
  }
  findAll() {
    /* ... */
  }
  findOne(id: number) {
    /* ... */
  }
  update(id: number, dto: UpdateVariantDto) {
    /* ... */
  }
  remove(id: number) {
    /* ... */
  }
}
