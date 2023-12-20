import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { DeviceSessionsRepository } from "../../../../../infrstructura/deviceSessions/device-sessions.repository";
import { UsersRepository } from "../../../../../infrstructura/users/users.repository";
import { LogOutUseCase } from "./logout-use-case";

describe("Logout use case", () => {
  let app: TestingModule;
  let logOutUseCase: LogOutUseCase;
  let deviceSessionRepository: DeviceSessionsRepository;
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    logOutUseCase = app.get<LogOutUseCase>(LogOutUseCase);
    usersRepository = app.get<UsersRepository>(UsersRepository);
    deviceSessionRepository = app.get<DeviceSessionsRepository>(
      DeviceSessionsRepository
    );
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(deviceSessionRepository).toBeDefined();
    expect(usersRepository).toBeDefined();
  });
  it("Should not handle delete, if userData not found", async () => {});

  it("Should not handle delete, if auth meta data not found", async () => {});

  it("Should log out, if auth meta found", async () => {});

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
