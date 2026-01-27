import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTaskCommand } from './create-task.command';
import { Inject } from '@nestjs/common';
import { TASK_REPOSITORY, type TaskRepository } from '../../../port';
import { TaskDto } from '../../../model';
import { Task } from 'src/modules/task/domain';

@CommandHandler(CreateTaskCommand)
export class CreateTaskHandler implements ICommandHandler<CreateTaskCommand> {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository,
  ) {}

  async execute(request: CreateTaskCommand): Promise<TaskDto> {
    const { title, description } = request;
    const taskEntity = Task.create(title, description);
    const newTask = await this.taskRepository.create(taskEntity);

    return newTask;
  }
}
