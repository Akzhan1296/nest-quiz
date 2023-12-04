import { Test, TestingModule } from "@nestjs/testing";
import { CommandBus } from "@nestjs/cqrs";
import { AppModule } from "../../../../../../app.module";
import { AuthService } from "../auth.service";
import { UsersRepository } from "../../../../../infrstructura/users/users.repository";
import { RegistrationUserUseCase } from "./registration-user-use-case";

const userViewMock = {
  id: "123",
  login: "login",
  password: "password",
  email: "email@email.com",
};

const registrateUserInputMock = {
  login: "login",
  password: "password",
  email: "email@email.com",
};

describe("Registration use-case", () => {
  let commandBus: CommandBus;
  let authService: AuthService;
  let usersRepository: UsersRepository;
  let app: TestingModule;
  let registrationUserUseCase: RegistrationUserUseCase;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    commandBus = app.get<CommandBus>(CommandBus);
    authService = app.get<AuthService>(AuthService);
    usersRepository = app.get<UsersRepository>(UsersRepository);
    registrationUserUseCase = app.get<RegistrationUserUseCase>(
      RegistrationUserUseCase
    );
  });

  it("Should be defined", () => {
    expect(commandBus).toBeDefined();
    expect(authService).toBeDefined();
    expect(usersRepository).toBeDefined();
    expect(registrationUserUseCase).toBeDefined();
  });
  it("Should registrate a user", async () => {
    jest
      .spyOn(usersRepository, "findUserByLogin")
      .mockImplementation(async () => null);

    jest
      .spyOn(usersRepository, "findUserByEmail")
      .mockImplementation(async () => null);

    const result = await registrationUserUseCase.execute({
      registrationUser: registrateUserInputMock,
    });

    expect(result).toEqual({
      isLoginAlreadyExist: false,
      isEmailAlreadyExist: false,
      isUserRegistered: true,
      isUserCreated: true,
    });
  });

  it("Should not registrate a user if isLoginAlreadyExist", async () => {
    jest
      .spyOn(usersRepository, "findUserByLogin")
      .mockImplementation(async () => userViewMock);

    jest
      .spyOn(usersRepository, "findUserByEmail")
      .mockImplementation(async () => null);

    const result = await registrationUserUseCase.execute({
      registrationUser: registrateUserInputMock,
    });

    expect(result).toEqual({
      isLoginAlreadyExist: true,
      isEmailAlreadyExist: false,
      isUserRegistered: false,
      isUserCreated: false,
    });
  });

  it("Should not registrate a user if isEmailAlreadyExist", async () => {
    jest
      .spyOn(usersRepository, "findUserByLogin")
      .mockImplementation(async () => null);

    jest
      .spyOn(usersRepository, "findUserByEmail")
      .mockImplementation(async () => userViewMock);

    const result = await registrationUserUseCase.execute({
      registrationUser: registrateUserInputMock,
    });

    expect(result).toEqual({
      isLoginAlreadyExist: false,
      isEmailAlreadyExist: true,
      isUserRegistered: false,
      isUserCreated: false,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
