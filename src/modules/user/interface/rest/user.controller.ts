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
import { UserDto } from '../../application/model';
import {
  GetAllUserQuery,
  GetUserQuery,
} from '../../application/use-case/query';
import {
  CreateUserCommand,
  DeleteUserCommand,
  UpdateUserCommand,
} from '../../application/use-case/command';

@Controller('users')
export class UserController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getAllUsers(): Promise<Array<UserDto>> {
    return this.queryBus.execute<GetAllUserQuery, Array<UserDto>>(
      new GetAllUserQuery(),
    );
  }

  @Get(':id')
  getUser(@Param('id') id: string): Promise<UserDto | null> {
    return this.queryBus.execute<GetUserQuery, UserDto | null>(
      new GetUserQuery(id),
    );
  }

  @Post()
  createUser(
    @Body() request: { email: string; name: string },
  ): Promise<UserDto> {
    const { email, name } = request;

    return this.commandBus.execute<CreateUserCommand, UserDto>(
      new CreateUserCommand(email, name),
    );
  }

  @Put(':id')
  updateUser(
    @Param('id') id: string,
    @Body() request: { email?: string; name?: string },
  ): Promise<UserDto> {
    const { email, name } = request;

    return this.commandBus.execute<UpdateUserCommand, UserDto>(
      new UpdateUserCommand(id, email, name),
    );
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute<DeleteUserCommand, void>(
      new DeleteUserCommand(id),
    );
  }
}
