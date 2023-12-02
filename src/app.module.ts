import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

//controllers
import { AuthController } from './features/roles/public/auth/api/auth.controller';

//useCases
import { RegistrationUserUseCase } from './features/roles/public/auth/application/use-cases/registration-user-use-case';
import { CreateUserUseCase } from './features/roles/sa/users/application/use-cases/create-user-use-case';
import { UsersRepository } from './features/infrstructura/users/users.repository';
import { AuthService } from './features/roles/public/auth/application/auth.service';
import { CqrsModule } from '@nestjs/cqrs';
import { RegistrationConfirmationUseCase } from './features/roles/public/auth/application/use-cases/registration-confirmation-use-case';


//repository
const userUseCases = [CreateUserUseCase];
const authUseCases = [RegistrationUserUseCase, RegistrationConfirmationUseCase];

@Module({
  imports: [
    CqrsModule,
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
  ],
  controllers: [    AppController,
    AuthController],
  providers: [
    AppService,
    AuthService,
    UsersRepository,
    ...userUseCases,
    ...authUseCases,
  ]
})
export class AppModule {}
