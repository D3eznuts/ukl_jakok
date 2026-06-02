import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const categorySelect = {
  id: true,
  name: true,
  _count: {
    select: {
      products: true,
    },
  },
} as const;

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    await this.ensureNameAvailable(createCategoryDto.name);

    const category = await this.prisma.category.create({
      data: createCategoryDto,
      select: categorySelect,
    });

    return this.formatCategory(category);
  }

  async findAll() {
    const categories = await this.prisma.category.findMany({
      select: categorySelect,
      orderBy: {
        name: 'asc',
      },
    });

    return categories.map((category) => this.formatCategory(category));
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            stock: true,
            imageUrl: true,
            categoryId: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    return {
      id: category.id,
      name: category.name,
      products: category.products.map((product) => ({
        ...product,
        price: Number(product.price),
      })),
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findCategoryOrThrow(id);

    if (updateCategoryDto.name === undefined) {
      throw new BadRequestException('No update data provided');
    }

    await this.ensureNameAvailable(updateCategoryDto.name, id);

    const category = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      select: categorySelect,
    });

    return this.formatCategory(category);
  }

  async remove(id: string) {
    await this.findCategoryOrThrow(id);

    const productCount = await this.prisma.product.count({
      where: {
        categoryId: id,
      },
    });

    if (productCount > 0) {
      throw new BadRequestException(
        'Category masih memiliki produk. Pindahkan atau hapus produk terlebih dahulu.',
      );
    }

    const category = await this.prisma.category.delete({
      where: { id },
      select: categorySelect,
    });

    return this.formatCategory(category);
  }

  private async findCategoryOrThrow(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    return category;
  }

  private async ensureNameAvailable(name: string, currentId?: string) {
    const existingCategory = await this.prisma.category.findUnique({
      where: { name },
      select: {
        id: true,
      },
    });

    if (existingCategory && existingCategory.id !== currentId) {
      throw new ConflictException('Category name already exists');
    }
  }

  private formatCategory(category: {
    id: string;
    name: string;
    _count: {
      products: number;
    };
  }) {
    return {
      id: category.id,
      name: category.name,
      productCount: category._count.products,
    };
  }
}
