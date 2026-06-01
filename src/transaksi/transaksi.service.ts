import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/client';
import type { Prisma } from 'generated/prisma/client';
import { OrderStatus, PaymentStatus } from 'generated/prisma/enums';
import { CreateTransaksiDto } from './dto/create-transaksi.dto';
import { UpdateTransaksiDto } from './dto/update-transaksi.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthRole } from '../auth/auth.types';
import type { AuthUser } from '../auth/auth.types';

const orderInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          imageUrl: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  },
  payment: true,
} as const;

type OrderWithRelations = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

@Injectable()
export class TransaksiService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createTransaksiDto: CreateTransaksiDto) {
    const items = this.mergeDuplicateItems(createTransaksiDto.items);

    const order = await this.prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: {
          id: {
            in: items.map((item) => item.productId),
          },
        },
      });

      const productsById = new Map(products.map((product) => [product.id, product]));
      const missingProductIds = items
        .filter((item) => !productsById.has(item.productId))
        .map((item) => item.productId);

      if (missingProductIds.length > 0) {
        throw new NotFoundException(
          `Product not found: ${missingProductIds.join(', ')}`,
        );
      }

      let total = new Decimal(0);
      const orderItems = items.map((item) => {
        const product = productsById.get(item.productId);

        if (!product) {
          throw new NotFoundException(`Product with id ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Stock ${product.name} tidak cukup. Tersedia ${product.stock}, diminta ${item.quantity}`,
          );
        }

        total = total.add(new Decimal(product.price).mul(item.quantity));

        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        };
      });

      for (const item of items) {
        const updatedProduct = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updatedProduct.count === 0) {
          throw new BadRequestException(
            `Stock produk ${item.productId} baru saja berubah. Silakan coba lagi.`,
          );
        }
      }

      return tx.order.create({
        data: {
          userId,
          total,
          status: OrderStatus.PENDING,
          items: {
            create: orderItems,
          },
          payment: {
            create: {
              method: createTransaksiDto.paymentMethod,
              status: PaymentStatus.PENDING,
            },
          },
        },
        include: orderInclude,
      });
    });

    return this.formatOrder(order);
  }

  async findAll(user: AuthUser) {
    const orders = await this.prisma.order.findMany({
      where: user.role === AuthRole.ADMIN ? undefined : { userId: user.id },
      include: orderInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders.map((order) => this.formatOrder(order));
  }

  async findOne(id: string, user: AuthUser) {
    const order = await this.findOrderOrThrow(id);
    this.ensureOrderAccess(order, user);

    return this.formatOrder(order);
  }

  async update(id: string, updateTransaksiDto: UpdateTransaksiDto) {
    const hasUpdateData =
      updateTransaksiDto.status !== undefined ||
      updateTransaksiDto.paymentMethod !== undefined ||
      updateTransaksiDto.paymentStatus !== undefined;

    if (!hasUpdateData) {
      throw new BadRequestException('No update data provided');
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const currentOrder = await tx.order.findUnique({
        where: { id },
        include: orderInclude,
      });

      if (!currentOrder) {
        throw new NotFoundException(`Transaksi with id ${id} not found`);
      }

      if (
        currentOrder.status === OrderStatus.CANCELED &&
        updateTransaksiDto.status !== undefined &&
        updateTransaksiDto.status !== OrderStatus.CANCELED
      ) {
        throw new BadRequestException('Transaksi yang sudah dibatalkan tidak bisa diaktifkan lagi');
      }

      const shouldCancel =
        currentOrder.status !== OrderStatus.CANCELED &&
        updateTransaksiDto.status === OrderStatus.CANCELED;

      if (shouldCancel) {
        await this.restoreStock(tx, currentOrder);
      }

      const nextPaymentStatus =
        updateTransaksiDto.paymentStatus ??
        (updateTransaksiDto.status === OrderStatus.PAID
          ? PaymentStatus.PAID
          : updateTransaksiDto.status === OrderStatus.CANCELED
            ? PaymentStatus.FAILED
            : undefined);

      await tx.order.update({
        where: { id },
        data: {
          ...(updateTransaksiDto.status !== undefined
            ? { status: updateTransaksiDto.status }
            : {}),
        },
      });

      if (
        updateTransaksiDto.paymentMethod !== undefined ||
        nextPaymentStatus !== undefined
      ) {
        await tx.payment.update({
          where: { orderId: id },
          data: {
            ...(updateTransaksiDto.paymentMethod !== undefined
              ? { method: updateTransaksiDto.paymentMethod }
              : {}),
            ...(nextPaymentStatus !== undefined ? { status: nextPaymentStatus } : {}),
          },
        });
      }

      return tx.order.findUniqueOrThrow({
        where: { id },
        include: orderInclude,
      });
    });

    return this.formatOrder(order);
  }

  async remove(id: string, user: AuthUser) {
    const order = await this.findOrderOrThrow(id);
    this.ensureOrderAccess(order, user);

    if (order.status === OrderStatus.CANCELED) {
      throw new BadRequestException('Transaksi sudah dibatalkan');
    }

    if (user.role !== AuthRole.ADMIN && order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        'Hanya transaksi dengan status PENDING yang bisa dibatalkan oleh user',
      );
    }

    const canceledOrder = await this.prisma.$transaction(async (tx) => {
      const currentOrder = await tx.order.findUnique({
        where: { id },
        include: orderInclude,
      });

      if (!currentOrder) {
        throw new NotFoundException(`Transaksi with id ${id} not found`);
      }

      if (currentOrder.status === OrderStatus.CANCELED) {
        throw new BadRequestException('Transaksi sudah dibatalkan');
      }

      await this.restoreStock(tx, currentOrder);

      await tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELED,
        },
      });

      await tx.payment.update({
        where: { orderId: id },
        data: {
          status: PaymentStatus.FAILED,
        },
      });

      return tx.order.findUniqueOrThrow({
        where: { id },
        include: orderInclude,
      });
    });

    return this.formatOrder(canceledOrder);
  }

  private mergeDuplicateItems(items: CreateTransaksiDto['items']) {
    const itemMap = new Map<string, number>();

    for (const item of items) {
      itemMap.set(item.productId, (itemMap.get(item.productId) ?? 0) + item.quantity);
    }

    return Array.from(itemMap.entries()).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));
  }

  private async findOrderOrThrow(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });

    if (!order) {
      throw new NotFoundException(`Transaksi with id ${id} not found`);
    }

    return order;
  }

  private ensureOrderAccess(order: OrderWithRelations, user: AuthUser) {
    if (user.role !== AuthRole.ADMIN && order.userId !== user.id) {
      throw new ForbiddenException('You do not have access to this transaksi');
    }
  }

  private async restoreStock(
    tx: Prisma.TransactionClient,
    order: OrderWithRelations,
  ) {
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }
  }

  private formatOrder(order: OrderWithRelations) {
    return {
      id: order.id,
      userId: order.userId,
      user: order.user,
      total: Number(order.total),
      status: order.status,
      createdAt: order.createdAt,
      payment: order.payment
        ? {
            id: order.payment.id,
            method: order.payment.method,
            status: order.payment.status,
          }
        : null,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal: Number(new Decimal(item.price).mul(item.quantity)),
        product: {
          id: item.product.id,
          name: item.product.name,
          price: Number(item.product.price),
          stock: item.product.stock,
          imageUrl: item.product.imageUrl,
          category: item.product.category,
        },
      })),
    };
  }
}
