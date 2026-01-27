import { Injectable } from '@nestjs/common';
import { TaskRepository } from '../../application/port';
import { TaskDto } from '../../application/model';
import { Task } from '../../domain';
import { PrismaService } from 'src/shared';

@Injectable()
export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prismaService: PrismaService) {}

  find(id: string): Promise<TaskDto | null> {
    return this.prismaService.task.findUnique({
      where: { id },
    });
  }

  findByUserId(userId: string): Promise<Array<TaskDto>> {
    return this.prismaService.task.findMany({
      where: { userId },
    });
  }

  create(task: Task): Promise<TaskDto> {
    return this.prismaService.task.create({
      data: task.data,
    });
  }

  update(task: Task): Promise<TaskDto> {
    return this.prismaService.task.update({
      where: { id: task.id },
      data: task.data,
    });
  }

  delete(id: string): Promise<TaskDto> {
    return this.prismaService.task.delete({
      where: { id },
    });
  }
}
