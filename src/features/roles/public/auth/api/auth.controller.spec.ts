import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { CommandBus } from "@nestjs/cqrs";
import { AppModule } from "../../../../../app.module";
import { AuthRegistrationInputModal } from "./auth.models";
import { RegistrationUserCommand } from "../application/use-cases/registration-user-use-case";
import { BadRequestException } from "@nestjs/common";

const registrationUserMock: AuthRegistrationInputModal = {
  login: `login${new Date().getHours()}${new Date().getMilliseconds()}`.slice(
    0,
    10
  ),
  password: "password",
  email: `test${new Date().getHours()}${new Date().getMilliseconds()}@test.ru`,
};

describe("AuthController", () => {
  let authController: AuthController;
  let commandBus: CommandBus;
  let app: TestingModule;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    await app.init();

    authController = app.get<AuthController>(AuthController);
    commandBus = app.get<CommandBus>(CommandBus);
  });

  it("Should be defined", () => {
    expect(authController).toBeDefined();
    expect(commandBus).toBeDefined();
  });

  describe("Registration user flow", () => {
    it("Should registrate a user", async () => {
      const mockExecute = jest.fn().mockReturnValue({
        isLoginAlreadyExist: false,
        isEmailAlreadyExist: false,
        isUserRegistered: true,
      });
      jest.spyOn(commandBus, "execute").mockImplementation(mockExecute);

      // act
      let result = await authController.registration(registrationUserMock);

      // results
      expect(result).toBeTruthy();
      expect(mockExecute).toHaveBeenCalledWith(
        new RegistrationUserCommand(registrationUserMock)
      );
    });

    it("Should return 400 error if isLoginAlreadyExist", async () => {
      const mockExecute = jest.fn().mockReturnValue({
        isLoginAlreadyExist: true,
        isEmailAlreadyExist: false,
        isUserRegistered: true,
      });
      jest.spyOn(commandBus, "execute").mockImplementation(mockExecute);

      await expect(
        authController.registration(registrationUserMock)
      ).rejects.toEqual(new BadRequestException("Login is already exist"));
    });

    it("Should return 400 error if isEmailAlreadyExist", async () => {
      const mockExecute = jest.fn().mockReturnValue({
        isLoginAlreadyExist: false,
        isEmailAlreadyExist: true,
        isUserRegistered: true,
      });
      jest.spyOn(commandBus, "execute").mockImplementation(mockExecute);

      await expect(
        authController.registration(registrationUserMock)
      ).rejects.toEqual(new BadRequestException("Email is already exist"));
    });
  });

  describe("Registration confirmation flow", () => {
    it("Should confirm email", () => {});
    it("Should return 400 error is confirmation email is not correct or it was already used", () => {});
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
