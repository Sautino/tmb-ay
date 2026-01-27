import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { DeleteUserCommand } from './delete-user.command';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY, type UserRepository } from '../../../port';
import { GetUserQuery } from '../../query';
import { UserDto } from '../../../model';
import { UserNotFoundException } from 'src/modules/user/domain';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(request: DeleteUserCommand): Promise<void> {
    const { id } = request;

    // Check if user exists
    const user = await this.queryBus.execute<GetUserQuery, UserDto | null>(
      new GetUserQuery(id),
    );

    if (!user) {
      throw new UserNotFoundException();
    }

    // Delete the user
    await this.userRepository.delete(id);
  }
}
