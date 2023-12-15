import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { AuthService } from "../auth.service";
import { DeviceSessionsRepository } from "../../../../../infrstructura/deviceSessions/device-sessions.repository";
import { LoginUseCase } from "./login-use-case";
import { UsersRepository } from "../../../../../infrstructura/users/users.repository";
import * as bcrypt from "bcrypt";
import { AuthMetaDataViewModel } from "../../../../../infrstructura/deviceSessions/models/device.models";

const authMock = {
  loginOrEmail: "login",
  password: "123",
  deviceName: "deviceName",
  deviceIp: "1",
};

describe("Login use case", () => {
  let app: TestingModule;
  let loginUseCase: LoginUseCase;
  let authService: AuthService;
  let deviceSessionRepository: DeviceSessionsRepository;
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    loginUseCase = app.get<LoginUseCase>(LoginUseCase);
    authService = app.get<AuthService>(AuthService);
    usersRepository = app.get<UsersRepository>(UsersRepository);
    deviceSessionRepository = app.get<DeviceSessionsRepository>(
      DeviceSessionsRepository
    );
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(loginUseCase).toBeDefined();
    expect(authService).toBeDefined();
    expect(deviceSessionRepository).toBeDefined();
    expect(usersRepository).toBeDefined();
  });
  it("Should not return tokens, if userData not found", async () => {
    jest.spyOn(authService, "checkCreds").mockImplementation(async () => null);

    const result = await loginUseCase.execute({
      authDTO: authMock,
    });

    expect(result).toEqual({
      accessToken: null,
      refreshToken: null,
      isCorrectPassword: false,
      isUserAlreadyHasAuthSession: false,
    });
  });
  it("Should update auth meta data, if already have, and return tokens", async () => {
    //mock usersRepository
    jest
      .spyOn(usersRepository, "findUserByEmail")
      .mockImplementation(async () => ({
        id: "id123",
        login: "login",
        password: "123",
        email: "email",
      }));

    // mock authSessionMetaData
    jest
      .spyOn(deviceSessionRepository, "getAuthMetaDataByDeviceNameAndUserId")
      .mockImplementation(async () => ({}) as AuthMetaDataViewModel);

    // mock CT
    jest
      .spyOn(authService, "createAccessToken")
      .mockImplementation(async () => "access token");

    // mock RT
    jest
      .spyOn(authService, "createRefreshToken")
      .mockImplementation(async () => "refresh token");

    // mock bcrypt
    jest.spyOn(bcrypt, "compare").mockImplementation(async () => true);

    const result = await loginUseCase.execute({
      authDTO: authMock,
    });

    expect(result).toEqual({
      accessToken: "access token",
      refreshToken: "refresh token",
      isCorrectPassword: true,
      isUserAlreadyHasAuthSession: true,
    });
  });
  it("Should create meta data, if no, and return tokens", async () => {
    //mock usersRepository
    jest
      .spyOn(usersRepository, "findUserByEmail")
      .mockImplementation(async () => ({
        id: "id123",
        login: "login",
        password: "123",
        email: "email",
      }));

    // mock bcrypt
    jest.spyOn(bcrypt, "compare").mockImplementation(async () => true);

    // mock authSessionMetaData
    jest
      .spyOn(deviceSessionRepository, "getAuthMetaDataByDeviceNameAndUserId")
      .mockImplementation(async () => null);
    jest
      .spyOn(deviceSessionRepository, "createAuthMetaData")
      .mockImplementation(async () => undefined);

    // mock CT
    jest
      .spyOn(authService, "createAccessToken")
      .mockImplementation(async () => "access token");

    // mock RT
    jest
      .spyOn(authService, "createRefreshToken")
      .mockImplementation(async () => "refresh token");

    const result = await loginUseCase.execute({
      authDTO: authMock,
    });

    expect(result).toEqual({
      accessToken: "access token",
      refreshToken: "refresh token",
      isCorrectPassword: true,
      isUserAlreadyHasAuthSession: false,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
