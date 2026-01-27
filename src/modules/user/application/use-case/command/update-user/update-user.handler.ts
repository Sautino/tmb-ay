import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { UpdateUserCommand } from './update-user.command';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY, type UserRepository } from '../../../port';
import { GetUserQuery } from '../../query';
import { UserDto } from '../../../model';
import { User, UserNotFoundException } from 'src/modules/user/domain';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(request: UpdateUserCommand): Promise<any> {
    const { id, email, name } = request;

    // Check if user exists
    const user = await this.queryBus.execute<GetUserQuery, UserDto | null>(
      new GetUserQuery(id),
    );

    if (!user) {
      throw new UserNotFoundException();
    }

    // Update user details
    const userEntity = User.rehydrate(user);

    if (email) {
      userEntity.updateEmail(email);
    }

    if (name) {
      userEntity.updateName(name);
    }

    // Persist the updated user entity
    const updatedUser = await this.userRepository.update(userEntity);

    return updatedUser;
  }
}
