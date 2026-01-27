import { Module } from '@nestjs/common';
import { PrismaModule } from './persistence';

@Module({
  imports: [PrismaModule],
})
export class SharedModule {}
