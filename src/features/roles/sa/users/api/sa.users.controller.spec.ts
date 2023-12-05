import { Test, TestingModule } from "@nestjs/testing";
import { CommandBus } from "@nestjs/cqrs";
import { AppModule } from "../../../../../app.module";
import { UsersController } from "./sa.users.controller";
import { AddUserInputModel } from "./sa.users.models";
import { CreateUserCommand } from "../application/use-cases/create-user-use-case";

const createUserMock: AddUserInputModel = {
  login: "login",
  password: "password",
  email: "test@test.com",
};

describe("AuthController", () => {
  let usersController: UsersController;
  let commandBus: CommandBus;
  let app: TestingModule;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    usersController = app.get<UsersController>(UsersController);
    commandBus = app.get<CommandBus>(CommandBus);
  });

  it("Should be defined", () => {
    expect(usersController).toBeDefined();
    expect(commandBus).toBeDefined();
  });

  describe("Registration user flow", () => {
    it("Should add user by SA", async () => {
      const mockExecute = jest.fn().mockReturnValue({
        isLoginAlreadyExist: false,
        isEmailAlreadyExist: false,
        isUserRegistered: true,
      });
      jest.spyOn(commandBus, "execute").mockImplementation(mockExecute);

      // act
      let result = await usersController.createUser(createUserMock);

      // results
      expect(result).toBeTruthy();
      expect(mockExecute).toHaveBeenCalledWith(
        new CreateUserCommand(createUserMock)
      );
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
