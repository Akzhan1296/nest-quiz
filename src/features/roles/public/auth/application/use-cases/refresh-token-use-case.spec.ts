import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { UpdateUserRefreshTokenUseCase } from "./refresh-token-use-case";
import { AuthService } from "../auth.service";
import { DeviceSessionsRepository } from "../../../../../infrstructura/deviceSessions/device-sessions.repository";
import { UsersRepository } from "../../../../../infrstructura/users/users.repository";

describe("Refresh token use case", () => {
  let app: TestingModule;
  let refreshTokenUseCase: UpdateUserRefreshTokenUseCase;
  let authService: AuthService;
  let usersRepository: UsersRepository;
  let deviceSessionRepository: DeviceSessionsRepository;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    refreshTokenUseCase = app.get<UpdateUserRefreshTokenUseCase>(
      UpdateUserRefreshTokenUseCase
    );
    authService = app.get<AuthService>(AuthService);
    deviceSessionRepository = app.get<DeviceSessionsRepository>(
      DeviceSessionsRepository
    );
    usersRepository = app.get<UsersRepository>(UsersRepository);

    // usersRepository = app.get<UsersRepository>(UsersRepository);
    // registrationConfirmationUserUseCase =
    //   app.get<RegistrationConfirmationUseCase>(RegistrationConfirmationUseCase);
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(refreshTokenUseCase).toBeDefined();
    expect(authService).toBeDefined();
    expect(deviceSessionRepository).toBeDefined();
    expect(usersRepository).toBeDefined();
  });
  it("Should not return tokens, if userData not found", () => {});
  it("Should not return tokens, if authMetaData not found", () => {});

  it("Should update auth meta data, if already have, and return tokens", () => {});

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
