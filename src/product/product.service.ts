import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const productInclude = {
  category: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

type ProductWithCategory = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    await this.ensureCategoryExists(createProductDto.categoryId);

    const product = await this.prisma.product.create({
      data: createProductDto,
      include: productInclude,
    });

    return this.formatProduct(product);
  }

  async findAll(query: ProductQueryDto) {
    const take = query.take ?? 20;
    const skip = query.skip ?? 0;
    const where: Prisma.ProductWhereInput = {
      ...(query.categoryId !== undefined
        ? { categoryId: query.categoryId }
        : {}),
      ...(query.search !== undefined && query.search.trim() !== ''
        ? {
            OR: [
              {
                name: {
                  contains: query.search,
                },
              },
              {
                description: {
                  contains: query.search,
                },
              },
            ],
          }
        : {}),
    };

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: {
          name: 'asc',
        },
        skip,
        take,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((product) => this.formatProduct(product)),
      meta: {
        total,
        skip,
        take,
      },
    };
  }

  async findOne(id: string) {
    const product = await this.findProductOrThrow(id);

    return this.formatProduct(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findProductOrThrow(id);

    const hasUpdateData = Object.values(updateProductDto).some(
      (value) => value !== undefined,
    );

    if (!hasUpdateData) {
      throw new BadRequestException('No update data provided');
    }

    if (updateProductDto.categoryId !== undefined) {
      await this.ensureCategoryExists(updateProductDto.categoryId);
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: productInclude,
    });

    return this.formatProduct(product);
  }

  async remove(id: string) {
    await this.findProductOrThrow(id);

    const orderItemCount = await this.prisma.orderItem.count({
      where: {
        productId: id,
      },
    });

    if (orderItemCount > 0) {
      throw new BadRequestException(
        'Produk sudah pernah masuk transaksi. Set stok menjadi 0 jika tidak ingin dijual lagi.',
      );
    }

    const product = await this.prisma.product.delete({
      where: { id },
      include: productInclude,
    });

    return this.formatProduct(product);
  }

  private async ensureCategoryExists(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${categoryId} not found`);
    }
  }

  private async findProductOrThrow(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  private formatProduct(product: ProductWithCategory) {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      category: product.category,
    };
  }
}
