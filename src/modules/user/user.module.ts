import { Module } from '@nestjs/common';
import { UserController } from './interface';
import { PrismaUserRepository } from './infrastructure';
import { USER_REPOSITORY, USER_USE_CASES } from './application';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    ...USER_USE_CASES,

    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
  ],
})
export class UserModule {}
