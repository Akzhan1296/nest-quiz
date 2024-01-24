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
import { CreateBlogBySAUseCase } from "./features/roles/sa/blogs/application/use-cases/sa.create-blog.use-case";
import { DeleteBlogBySAUseCase } from "./features/roles/sa/blogs/application/use-cases/sa.delete-blog.use-case";
import { UpdateBlogBySAUseCase } from "./features/roles/sa/blogs/application/use-cases/sa.update-blog.use-case";
import { BlogsRepository } from "./features/infrstructura/blogs/blogs.repository";
import { BlogsQueryRepository } from "./features/infrstructura/blogs/blogs.query.repository";
import { SABlogsController } from "./features/roles/sa/blogs/api/sa.blogs.controller";
import { CreatePostBySAUseCase } from "./features/roles/sa/blogs/application/use-cases/posts/sa.create-post.use-case";
import { DeletePostBySAUseCase } from "./features/roles/sa/blogs/application/use-cases/posts/sa.delete-post.use-case";
import { UpdatePostBySAUseCase } from "./features/roles/sa/blogs/application/use-cases/posts/sa.update-post.use-case";
import { PostsRepository } from "./features/infrstructura/posts/posts.repository";
import { PostsQueryRepository } from "./features/infrstructura/posts/posts.query.repository";
import { PublicBlogs } from "./features/roles/public/blogs/api/public-blogs.controller";
import { PublicPosts } from "./features/roles/public/posts/api/public-posts.controller";
import { CreateCommentUseCase } from "./features/roles/public/comments/application/use-cases/create-comment-use-case";
import { CommentsRepository } from "./features/infrstructura/comments/comments.repository";
import { CommentsQueryRepository } from "./features/infrstructura/comments/comments.query.repository";

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
const saBlogs = [
  CreateBlogBySAUseCase,
  DeleteBlogBySAUseCase,
  UpdateBlogBySAUseCase,
];
const saPosts = [
  CreatePostBySAUseCase,
  DeletePostBySAUseCase,
  UpdatePostBySAUseCase,
];
const commentsUseCases = [CreateCommentUseCase];

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
          console.log(configService.get("localDB"));
          return configService.get("localDB");
        } else {
          console.log(configService.get("remoteDB"));
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
    SABlogsController,
    PublicBlogs,
    PublicPosts,
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
    BlogsRepository,
    BlogsQueryRepository,
    PostsRepository,
    PostsQueryRepository,
    CommentsRepository,
    CommentsQueryRepository,
    ...userUseCases,
    ...authUseCases,
    ...deviceUseCases,
    ...saBlogs,
    ...saPosts,
    ...commentsUseCases,
  ],
})
export class AppModule {}
