import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserByEmailQuery } from './get-user-by-email.query';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY, type UserRepository } from '../../../port';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(request: GetUserByEmailQuery): Promise<any> {
    const { email } = request;
    const user = await this.userRepository.findByEmail(email);

    return user;
  }
}
