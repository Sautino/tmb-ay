import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from './get-user.query';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY, type UserRepository } from '../../../port';
import { UserDto } from '../../../model';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(request: GetUserQuery): Promise<UserDto | null> {
    const { id } = request;
    const user = await this.userRepository.find(id);

    return user;
  }
}
