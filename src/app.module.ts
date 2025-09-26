import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TaskModule } from './task/task.module';
import { PrismaModule } from './prisma/prisma.module'; 
import { AuthModule } from './auth/auth.module';
import { KpiModule } from './kpi/kpi.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    PrismaModule, 
    UsersModule, 
    TaskModule, 
    AuthModule, 
    KpiModule, 
    FilesModule
  ],
  controllers: [AppController],
  providers: [AppService], 
})
export class AppModule {}