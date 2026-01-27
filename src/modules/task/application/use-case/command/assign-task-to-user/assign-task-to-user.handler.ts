import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { AssignTaskToUserCommand } from './assign-task-to-user.command';
import { TASK_REPOSITORY, type TaskRepository } from '../../../port';
import { Inject } from '@nestjs/common';
import { TaskDto } from '../../../model';
import { GetTaskQuery } from '../../query';
import { Task } from 'src/modules/task/domain';

@CommandHandler(AssignTaskToUserCommand)
export class AssignTaskToUserHandler implements ICommandHandler<AssignTaskToUserCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    @Inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository,
  ) {}

  async execute(request: AssignTaskToUserCommand): Promise<TaskDto> {
    const { id, userId } = request;

    // Check if user exists --> if not throw error

    const task = await this.queryBus.execute<GetTaskQuery, TaskDto | null>(
      new GetTaskQuery(id),
    );

    if (!task) {
      throw Error('Task not found');
    }

    const taskEntity = Task.rehydrate(task);
    taskEntity.assignToUser(userId);

    const updatedTask = await this.taskRepository.update(taskEntity);

    return updatedTask;
  }
}
