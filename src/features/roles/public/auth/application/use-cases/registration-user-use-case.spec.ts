import { Test, TestingModule } from "@nestjs/testing";
import { CommandBus } from "@nestjs/cqrs";
import { AppModule } from "../../../../../../app.module";
import { AuthService } from "../auth.service";
import { UsersRepository } from "../../../../../infrstructura/users/users.repository";
import { Repository } from "typeorm";
import { RegistrationUserUseCase } from "./registration-user-use-case";
import { CreateUserCommand } from "../../../../sa/users/application/use-cases/create-user-use-case";


const userViewMock = {
  id: '123',
  login: 'login',
  password: 'password',
  email: 'email@email.com'
}

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
  });
  it("Should registrate a user", async () => {

    const registrateUserDTO = {
      login: `login${new Date().getHours()}${new Date().getMilliseconds()}`.slice(
        0,
        10
      ),
      password: "password",
      email: `test${new Date().getHours()}${new Date().getMilliseconds()}@test.ru`,
    };
    
    const result = await registrationUserUseCase.execute({
      registrationUser: registrateUserDTO,
    });

    expect(result).toEqual({
      isLoginAlreadyExist: false,
      isEmailAlreadyExist: false,
      isUserRegistered: true,
      isUserCreated: true
    })
  });

  it("Should not registrate a user isLoginAlreadyExist", async () => {
    const registrateUserDTO = {
      login: `login${new Date().getHours()}${new Date().getMilliseconds()}`.slice(
        0,
        10
      ),
      password: "password",
      email: `test${new Date().getHours()}${new Date().getMilliseconds()}@test.ru`,
    };

    jest.spyOn(usersRepository, 'findUserByLogin').mockImplementation(async () => userViewMock);

    const result = await registrationUserUseCase.execute({
      registrationUser: registrateUserDTO,
    });

    expect(result).toEqual({
      isLoginAlreadyExist: true,
      isEmailAlreadyExist: false,
      isUserRegistered: false,
      isUserCreated: false
    })
  });

  it("Should not registrate a user isEmailAlreadyExist", async () => {    
    const registrateUserDTO = {
      login: `login${new Date().getHours()}${new Date().getMilliseconds()}`.slice(
        0,
        10
      ),
      password: "password",
      email: `test${new Date().getHours()}${new Date().getMilliseconds()}@test.ru`,
    };
    jest.spyOn(usersRepository, 'findUserByEmail').mockImplementation(async () => userViewMock);

    const result = await registrationUserUseCase.execute({
      registrationUser: registrateUserDTO,
    });

    expect(result).toEqual({
      isLoginAlreadyExist: false,
      isEmailAlreadyExist: true,
      isUserRegistered: false,
      isUserCreated: false
    })
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
