import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTaskQuery } from './get-task.query';
import { TaskDto } from '../../../model';
import { TASK_REPOSITORY, type TaskRepository } from '../../../port';
import { Inject } from '@nestjs/common';

@QueryHandler(GetTaskQuery)
export class GetTaskHandler implements IQueryHandler<GetTaskQuery> {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository,
  ) {}

  async execute(request: GetTaskQuery): Promise<TaskDto | null> {
    const { id } = request;
    const task = await this.taskRepository.find(id);

    return task;
  }
}
