import { Module } from '@nestjs/common';
import { TaskController } from './interface';
import { TASK_REPOSITORY } from './application/port';
import { PrismaTaskRepository } from './infrastructure';
import { TASK_USE_CASES } from './application';

@Module({
  imports: [],
  controllers: [TaskController],
  providers: [
    ...TASK_USE_CASES,

    { provide: TASK_REPOSITORY, useClass: PrismaTaskRepository },
  ],
})
export class TaskModule {}
