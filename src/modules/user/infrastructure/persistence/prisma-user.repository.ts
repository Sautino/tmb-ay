import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared';
import { UserRepository } from '../../application/port';
import { UserDto } from '../../application/model';
import { User } from '../../domain';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findAll(): Promise<Array<UserDto>> {
    return this.prismaService.user.findMany();
  }

  find(id: string): Promise<UserDto | null> {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  findByEmail(email: string): Promise<UserDto | null> {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  create(user: User): Promise<UserDto> {
    return this.prismaService.user.create({
      data: { ...user.data, email: user.email.getValue() },
    });
  }

  update(user: User): Promise<UserDto> {
    return this.prismaService.user.update({
      where: { id: user.id },
      data: { ...user.data, email: user.email.getValue() },
    });
  }

  delete(id: string): Promise<UserDto> {
    return this.prismaService.user.delete({
      where: { id },
    });
  }
}
