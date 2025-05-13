import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private repo: Repository<Category>) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const cat = this.repo.create({
      parent: dto.parentCategoryId
        ? ({ id: dto.parentCategoryId } as Category)
        : undefined,
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      imageUrl: dto.imageUrl,
      isActive: dto.isActive ?? true,
    });
    return this.repo.save(cat);
  }

  findAll(): Promise<Category[]> {
    return this.repo.find({ relations: ['parent', 'children'] });
  }

  async findOne(id: number): Promise<Category> {
    const cat = await this.repo.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!cat) throw new NotFoundException(`Category ${id} not found`);
    return cat;
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const cat = await this.findOne(id);
    Object.assign(cat, {
      parent: dto.parentCategoryId
        ? ({ id: dto.parentCategoryId } as Category)
        : undefined,
      ...dto,
    });
    return this.repo.save(cat);
  }

  async remove(id: number): Promise<void> {
    const cat = await this.findOne(id);
    await this.repo.remove(cat);
  }
}
