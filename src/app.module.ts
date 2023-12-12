import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CqrsModule } from "@nestjs/cqrs";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

//controllers
import { AuthController } from "./features/roles/public/auth/api/auth.controller";
import { UsersController } from "./features/roles/sa/users/api/sa.users.controller";

//service
import { AuthService } from "./features/roles/public/auth/application/auth.service";

//useCases
import { RegistrationUserUseCase } from "./features/roles/public/auth/application/use-cases/registration-user-use-case";
import { CreateUserUseCase } from "./features/roles/sa/users/application/use-cases/create-user-use-case";
import { RegistrationConfirmationUseCase } from "./features/roles/public/auth/application/use-cases/registration-confirmation-use-case";
import { EmailResendingUseCase } from "./features/roles/public/auth/application/use-cases/registration-email-resendings-use-case";
import { DeleteUserUseCase } from "./features/roles/sa/users/application/use-cases/delete-user-use-case";

//repository
import { UsersRepository } from "./features/infrstructura/users/users.repository";
import {
  DeleteAllTestingData,
  DeleteDataController,
} from "./features/infrstructura/deleting-all-data";
import { UsersQueryRepository } from "./features/infrstructura/users/users.query.repository";
import { LoginUseCase } from "./features/roles/public/auth/application/use-cases/login-use-case";
import { JwtService } from "@nestjs/jwt";
import { DeviceSessionsRepository } from "./features/infrstructura/deviceSessions/device-sessions.repository";
import { UpdateUserRefreshTokenUseCase } from "./features/roles/public/auth/application/use-cases/refresh-token-use-case";

const userUseCases = [CreateUserUseCase, DeleteUserUseCase];
const authUseCases = [
  RegistrationUserUseCase,
  RegistrationConfirmationUseCase,
  EmailResendingUseCase,
  LoginUseCase,
  UpdateUserRefreshTokenUseCase,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "127.0.0.1",
      port: 5432,
      username: "postgres",
      password: "postgres ",
      database: "postgres",
      autoLoadEntities: false,
      synchronize: false,
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    UsersController,
    DeleteDataController,
  ],
  providers: [
    JwtService,
    AppService,
    AuthService,
    UsersQueryRepository,
    UsersRepository,
    DeviceSessionsRepository,
    DeleteAllTestingData,
    ...userUseCases,
    ...authUseCases,
  ],
})
export class AppModule {}
