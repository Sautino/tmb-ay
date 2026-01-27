import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { UpdateTaskCommand } from './update-task.command';
import { TASK_REPOSITORY, type TaskRepository } from '../../../port';
import { Inject } from '@nestjs/common';
import { TaskDto } from '../../../model';
import { GetTaskQuery } from '../../query';
import { Task } from 'src/modules/task/domain';

@CommandHandler(UpdateTaskCommand)
export class UpdateTaskHandler implements ICommandHandler<UpdateTaskCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    @Inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository,
  ) {}

  async execute(request: UpdateTaskCommand): Promise<TaskDto> {
    const { id, title, description, completed } = request;
    const task = await this.queryBus.execute<GetTaskQuery, TaskDto | null>(
      new GetTaskQuery(id),
    );

    if (!task) {
      throw Error('Task not found');
    }

    const taskEntity = Task.rehydrate(task);

    if (title !== undefined) {
      taskEntity.updateTitle(title);
    }

    if (description !== undefined) {
      taskEntity.updateDescription(description);
    }

    if (completed !== undefined) {
      taskEntity.updateCompleted(completed);
    }

    const updatedTask = await this.taskRepository.update(taskEntity);

    return updatedTask;
  }
}
