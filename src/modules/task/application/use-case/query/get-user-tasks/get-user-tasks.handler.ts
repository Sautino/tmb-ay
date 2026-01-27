import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserTasksQuery } from './get-user-tasks.query';
import { TASK_REPOSITORY, type TaskRepository } from '../../../port';
import { Inject } from '@nestjs/common';
import { TaskDto } from '../../../model';

@QueryHandler(GetUserTasksQuery)
export class GetUserTasksHandler implements IQueryHandler<GetUserTasksQuery> {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository,
  ) {}

  async execute(request: GetUserTasksQuery): Promise<Array<TaskDto>> {
    const { userId } = request;
    const tasks = await this.taskRepository.findByUserId(userId);

    return tasks;
  }
}
