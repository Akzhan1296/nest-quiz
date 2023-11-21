import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'postgres',
      password: 'postgres ',
      database: 'postgres',
      autoLoadEntities: false,
      synchronize: false,
    }),
    UsersModule,
  ],
})
export class AppModule {}
