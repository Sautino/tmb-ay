import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY, type UserRepository } from '../../../port';
import { UserDto } from '../../../model';
import { GetUserByEmailQuery } from '../../query';
import { User, UserAlreadyExistsException } from 'src/modules/user/domain';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(request: CreateUserCommand): Promise<UserDto> {
    const { email, name } = request;

    // Check if user with the same email already exists
    const user = await this.queryBus.execute<
      GetUserByEmailQuery,
      UserDto | null
    >(new GetUserByEmailQuery(email));

    if (user) {
      throw new UserAlreadyExistsException();
    }

    // Create new user entity
    const userEntity = User.create(email, name);

    // Persist the new user entity
    const createdUser = await this.userRepository.create(userEntity);

    return createdUser;
  }
}
