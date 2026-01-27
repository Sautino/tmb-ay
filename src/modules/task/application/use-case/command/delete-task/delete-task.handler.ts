import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteTaskCommand } from './delete-task.command';
import { Inject } from '@nestjs/common';
import { TASK_REPOSITORY, type TaskRepository } from '../../../port';

@CommandHandler(DeleteTaskCommand)
export class DeleteTaskHandler implements ICommandHandler<DeleteTaskCommand> {
  constructor(
    @Inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository,
  ) {}

  async execute(request: DeleteTaskCommand): Promise<void> {
    const { id } = request;

    // Check if task exists --> if not throw error

    await this.taskRepository.delete(id);
  }
}
