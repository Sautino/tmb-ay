import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TaskModule } from './modules/task/task.module';
import { UserModule } from './modules/user/user.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    TaskModule,
    UserModule,
    SharedModule,

    CqrsModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
