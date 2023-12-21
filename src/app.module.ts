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
import { LogOutUseCase } from "./features/roles/public/auth/application/use-cases/logout-use-case";
import { PasswordRecoveryUseCase } from "./features/roles/public/auth/application/use-cases/password-recovery-use-case";
import { NewPasswordUseCase } from "./features/roles/public/auth/application/use-cases/new-password-use-case";
import { DevicesController } from "./features/roles/public/devices/api/device.controller";
import { DeviceSessionsQueryRepository } from "./features/infrstructura/deviceSessions/device-sessions.query.repository";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DeleteCurrentDeviceUseCase } from "./features/roles/public/devices/application/use-cases/delete-current-device-use-case";
import { DeleteDevicesExceptCurrentUseCase } from "./features/roles/public/devices/application/use-cases/delete-all-devices-use-case";
import { BlockIpsService } from "./features/infrstructura/ip-retriction.service";
import { BlockIpsRepository } from "./features/infrstructura/ip/ip.repository";

import configuration from "./config";

const userUseCases = [CreateUserUseCase, DeleteUserUseCase];
const authUseCases = [
  RegistrationUserUseCase,
  RegistrationConfirmationUseCase,
  EmailResendingUseCase,
  LoginUseCase,
  UpdateUserRefreshTokenUseCase,
  LogOutUseCase,
  PasswordRecoveryUseCase,
  NewPasswordUseCase,
];
const deviceUseCases = [
  DeleteCurrentDeviceUseCase,
  DeleteDevicesExceptCurrentUseCase,
];

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const env = process.env.ENV;

        if (env === "TESTING") {
          console.log(configService.get("localDB"))
          return configService.get("localDB");
        } else {
          console.log(configService.get("remoteDB"))
          return configService.get("remoteDB");
        }
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    UsersController,
    DevicesController,
    DeleteDataController,
  ],
  providers: [
    JwtService,
    AppService,
    AuthService,
    BlockIpsService,
    BlockIpsRepository,
    UsersQueryRepository,
    UsersRepository,
    DeviceSessionsRepository,
    DeleteAllTestingData,
    DeviceSessionsQueryRepository,
    ...userUseCases,
    ...authUseCases,
    ...deviceUseCases,
  ],
})
export class AppModule {}
