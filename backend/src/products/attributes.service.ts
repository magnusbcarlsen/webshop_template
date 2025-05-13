import { InjectRepository } from '@nestjs/typeorm';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { Repository } from 'typeorm';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { Injectable } from '@nestjs/common';
import { Attribute } from './entities/attribute.entity';

// src/products/attributes.service.ts
@Injectable()
export class AttributesService {
  constructor(
    @InjectRepository(Attribute) private attrs: Repository<Attribute>,
  ) {}

  create(dto: CreateAttributeDto) {
    /* ... */
  }
  findAll() {
    /* ... */
  }
  findOne(id: number) {
    /* ... */
  }
  update(id: number, dto: UpdateAttributeDto) {
    /* ... */
  }
  remove(id: number) {
    /* ... */
  }
}
