import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TaskDto } from '../../application';
import {
  GetTaskQuery,
  GetUserTasksQuery,
} from '../../application/use-case/query';
import {
  AssignTaskToUserCommand,
  CreateTaskCommand,
  DeleteTaskCommand,
  UpdateTaskCommand,
} from '../../application/use-case/command';

@Controller('tasks')
export class TaskController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(':id')
  getTask(@Param('id') id: string): Promise<TaskDto | null> {
    return this.queryBus.execute<GetTaskQuery, TaskDto | null>(
      new GetTaskQuery(id),
    );
  }

  @Get('user/:userId')
  getUserTasks(@Param('userId') userId: string): Promise<Array<TaskDto>> {
    return this.queryBus.execute<GetUserTasksQuery, Array<TaskDto>>(
      new GetUserTasksQuery(userId),
    );
  }

  @Post()
  createTask(
    @Body() body: { title: string; description?: string },
  ): Promise<TaskDto> {
    const { title, description } = body;

    return this.commandBus.execute<CreateTaskCommand, TaskDto>(
      new CreateTaskCommand(title, description),
    );
  }

  @Put(':id')
  updateTask(
    @Param('id') id: string,
    @Body() body: { title: string; description?: string; completed?: boolean },
  ): Promise<TaskDto> {
    const { title, description, completed } = body;

    return this.commandBus.execute<UpdateTaskCommand, TaskDto>(
      new UpdateTaskCommand(id, title, description, completed),
    );
  }

  @Put(':id/assign/:userId')
  assignTaskToUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<TaskDto> {
    return this.commandBus.execute<AssignTaskToUserCommand, TaskDto>(
      new AssignTaskToUserCommand(id, userId),
    );
  }

  @Delete(':id')
  deleteTask(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute<DeleteTaskCommand, void>(
      new DeleteTaskCommand(id),
    );
  }
}
