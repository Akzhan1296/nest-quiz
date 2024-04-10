import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CqrsModule } from "@nestjs/cqrs";
import { ConfigModule, ConfigService } from "@nestjs/config";
import configuration from "./config";

//controllers
import { AppController } from "./app.controller";
import { AuthController } from "./features/roles/public/auth/api/auth.controller";
import { DevicesController } from "./features/roles/public/devices/api/device.controller";
import { PublicPostsController } from "./features/roles/public/posts/api/public-posts.controller";
import { PublicBlogsController } from "./features/roles/public/blogs/api/public-blogs.controller";
import { PublicCommentsController } from "./features/roles/public/comments/api/public-comments.controller";
import { SAUsersController } from "./features/roles/sa/users/api/sa.users.controller";
import { SABlogsController } from "./features/roles/sa/blogs/api/sa.blogs.controller";
import { SAQuizQuestionsController } from "./features/roles/sa/quiz-questions/api/sa.quiz-questions.controller";

//service
import { AppService } from "./app.service";
import { AuthService } from "./features/roles/public/auth/application/auth.service";
import { JwtService } from "@nestjs/jwt";
import { BlockIpsService } from "./features/infrastructura/ip-retriction.service";

//deleting-all-data
import {
  DeleteAllTestingData,
  DeleteDataController,
} from "./features/infrastructura/deleting-all-data";

//useCases
import { RegistrationUserUseCase } from "./features/roles/public/auth/application/use-cases/registration-user-use-case";
import { CreateUserUseCase } from "./features/roles/sa/users/application/use-cases/create-user-use-case";
import { RegistrationConfirmationUseCase } from "./features/roles/public/auth/application/use-cases/registration-confirmation-use-case";
import { EmailResendingUseCase } from "./features/roles/public/auth/application/use-cases/registration-email-resendings-use-case";
import { DeleteUserUseCase } from "./features/roles/sa/users/application/use-cases/delete-user-use-case";
import { LoginUseCase } from "./features/roles/public/auth/application/use-cases/login-use-case";
import { UpdateUserRefreshTokenUseCase } from "./features/roles/public/auth/application/use-cases/refresh-token-use-case";
import { LogOutUseCase } from "./features/roles/public/auth/application/use-cases/logout-use-case";
import { PasswordRecoveryUseCase } from "./features/roles/public/auth/application/use-cases/password-recovery-use-case";
import { NewPasswordUseCase } from "./features/roles/public/auth/application/use-cases/new-password-use-case";
import { DeleteCurrentDeviceUseCase } from "./features/roles/public/devices/application/use-cases/delete-current-device-use-case";
import { DeleteDevicesExceptCurrentUseCase } from "./features/roles/public/devices/application/use-cases/delete-all-devices-use-case";
import { CreateBlogBySAUseCase } from "./features/roles/sa/blogs/application/use-cases/sa.create-blog.use-case";
import { DeleteBlogBySAUseCase } from "./features/roles/sa/blogs/application/use-cases/sa.delete-blog.use-case";
import { UpdateBlogBySAUseCase } from "./features/roles/sa/blogs/application/use-cases/sa.update-blog.use-case";
import { CreatePostBySAUseCase } from "./features/roles/sa/blogs/application/use-cases/posts/sa.create-post.use-case";
import { DeletePostBySAUseCase } from "./features/roles/sa/blogs/application/use-cases/posts/sa.delete-post.use-case";
import { UpdatePostBySAUseCase } from "./features/roles/sa/blogs/application/use-cases/posts/sa.update-post.use-case";
import { CreateCommentUseCase } from "./features/roles/public/comments/application/use-cases/create-comment-use-case";
import { LikeStatusCommentUseCase } from "./features/roles/public/comments/application/use-cases/like-status-comment-use-case";
import { DeleteCommentUseCase } from "./features/roles/public/comments/application/use-cases/delete-comment-use-case";
import { UpdateCommentUseCase } from "./features/roles/public/comments/application/use-cases/update-comment-use-case";
import { LikeStatusPostUseCase } from "./features/roles/public/posts/application/use-cases/handle-post-like-use-case";

// entity
import { User } from "./features/entity/users-entity";
import { Registration } from "./features/entity/registration-entity";
import { AuthSession } from "./features/entity/auth-session-entity";
import { Ips } from "./features/entity/ips-entity";
import { Post } from "./features/entity/posts-entity";
import { Comment } from "./features/entity/comments-entity";
import { Blog } from "./features/entity/blogs-entity";
import { CommentLike } from "./features/entity/comment-likes-entity";
import { PostLike } from "./features/entity/post-likes-entity";

// repository
import { BlogsRepo } from "./features/infrastructura/blogs/blogs.adapter";
import { BlogsQueryRepo } from "./features/infrastructura/blogs/blogs.query.adapter";
import { UsersRepo } from "./features/infrastructura/users/users.adapter";
import { UsersQueryRepo } from "./features/infrastructura/users/users.query.adapter";
import { DeviceSessionRepo } from "./features/infrastructura/deviceSessions/device-sessions.adapter";
import { DeviceSessionQueryRepo } from "./features/infrastructura/deviceSessions/device-sessions.query.adapter";
import { BlockIpsRepo } from "./features/infrastructura/ip/ip.adapter";
import { PostsRepo } from "./features/infrastructura/posts/posts.adapter";
import { PostsQueryRepo } from "./features/infrastructura/posts/posts.query.adapter";
import { CommentsRepo } from "./features/infrastructura/comments/comments.adapter";
import { CommentsQueryRepo } from "./features/infrastructura/comments/comments.query.adapter";
import { QuizQuestionQueryRepo } from "./features/infrastructura/quiz/quiz.query.adapter";
import { QuizQuestionRepo } from "./features/infrastructura/quiz/quiz.adapter";

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
const saBlogsUseCases = [
  CreateBlogBySAUseCase,
  DeleteBlogBySAUseCase,
  UpdateBlogBySAUseCase,
];
const saPostsUseCases = [
  CreatePostBySAUseCase,
  DeletePostBySAUseCase,
  UpdatePostBySAUseCase,
];
const publicPostsUseCases = [LikeStatusPostUseCase];
const commentsUseCases = [
  CreateCommentUseCase,
  LikeStatusCommentUseCase,
  DeleteCommentUseCase,
  UpdateCommentUseCase,
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
        if (env === "TYPEORM") {
          console.log(configService.get("typeorm2"));
          return configService.get("typeorm2");
        }

        if (env === "TESTING") {
          console.log(configService.get("localDB"));
          return configService.get("localDB");
        }

        if (env === "DEV") {
          console.log(configService.get("remoteDB"));
          return configService.get("remoteDB");
        }
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      Registration,
      AuthSession,
      Ips,
      Post,
      Comment,
      Blog,
      CommentLike,
      PostLike,
    ]),
  ],
  controllers: [
    AppController,
    AuthController,
    DevicesController,
    DeleteDataController,
    PublicBlogsController,
    PublicPostsController,
    PublicCommentsController,
    SAUsersController,
    SABlogsController,
    SAQuizQuestionsController,
  ],
  providers: [
    JwtService,
    AppService,
    AuthService,
    BlockIpsService,
    DeleteAllTestingData,
    BlogsRepo,
    BlogsQueryRepo,
    UsersRepo,
    UsersQueryRepo,
    DeviceSessionRepo,
    DeviceSessionQueryRepo,
    BlockIpsRepo,
    PostsRepo,
    PostsQueryRepo,
    CommentsRepo,
    CommentsQueryRepo,
    QuizQuestionRepo,
    QuizQuestionQueryRepo,
    ...userUseCases,
    ...authUseCases,
    ...deviceUseCases,
    ...saBlogsUseCases,
    ...saPostsUseCases,
    ...commentsUseCases,
    ...publicPostsUseCases,
  ],
})
export class AppModule {}
