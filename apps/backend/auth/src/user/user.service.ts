import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../dtos';
import { hash } from 'bcrypt';
import { prisma } from '@app/database';
import type { User } from '@prisma/client';

@Injectable()
export class UserService {
  private readonly SALT_ROUNDS = 10;

  async signup(createUserDto: CreateUserDto) {
    const { email, password, name } = createUserDto;
    console.log(createUserDto);
    const existingUser: User = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await hash(password, this.SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    return { id: user.id, email: user.email, name: user.name };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User retrieved successfully', data: user };
  }

  async listUsers(page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: pageSize,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);
    return {
      message: 'users retrieved successfully',
      data: users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
