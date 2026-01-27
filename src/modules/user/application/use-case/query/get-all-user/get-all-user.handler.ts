import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllUserQuery } from './get-all-user.query';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY, type UserRepository } from '../../../port';
import { UserDto } from '../../../model';

@QueryHandler(GetAllUserQuery)
export class GetAllUserHandler implements IQueryHandler<GetAllUserQuery> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(request: GetAllUserQuery): Promise<Array<UserDto>> {
    const users = await this.userRepository.findAll();

    return users;
  }
}
