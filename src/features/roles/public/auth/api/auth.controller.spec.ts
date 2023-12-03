import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { CommandBus } from "@nestjs/cqrs";
import { AppModule } from "../../../../../app.module";
import { AuthRegistrationInputModal } from "./auth.models";
import { RegistrationUserCommand } from "../application/use-cases/registration-user-use-case";
import { BadRequestException } from "@nestjs/common";
import { RegistrationConfirmationCommand } from "../application/use-cases/registration-confirmation-use-case";
import { UsersRepository } from "../../../../infrstructura/users/users.repository";
import { add } from "date-fns";

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
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    await app.init();

    authController = app.get<AuthController>(AuthController);
    commandBus = app.get<CommandBus>(CommandBus);
    usersRepository = app.get<UsersRepository>(UsersRepository);
  });

  it("Should be defined", () => {
    expect(authController).toBeDefined();
    expect(commandBus).toBeDefined();
    expect(usersRepository).toBeDefined();
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
    it("Should confirm email", async () => {
      const mockExecute = jest.fn().mockReturnValue({
        isUserByConfirmCodeFound: true,
        isEmailAlreadyConfirmed: false,
        isConfirmDateExpired: false,
        isRegistrationConfirmed: true,
      });
      jest.spyOn(commandBus, "execute").mockImplementation(mockExecute);

      // act
      let result = await authController.registrationConfirmation({
        code: "45dff467-ccdd-49df-9e9d-c6b407538137",
      });

      // results
      expect(result).toBeTruthy();
      expect(mockExecute).toHaveBeenCalledWith(
        new RegistrationConfirmationCommand({
          code: "45dff467-ccdd-49df-9e9d-c6b407538137",
        })
      );
    });
    it("Should return 400 error if confirmation code is already confirmed", async () => {
      const mockExecute = jest.fn().mockReturnValue({
        isUserByConfirmCodeFound: true,
        isEmailAlreadyConfirmed: true,
        isConfirmDateExpired: false,
        isRegistrationConfirmed: false,
      });

      const userByConfirmCodeMock = {
        createdAt: new Date(),
        emailExpDate: add(new Date(), {
          minutes: 1,
        }),
        isConfirmed: true,
        confirmCode: "a8904469-3781-49a1-a5d7-56007c27ee77",
        registrationId: "123",
      } as const;

      jest.spyOn(commandBus, "execute").mockImplementation(mockExecute);

      jest
        .spyOn(usersRepository, "findUserByConfirmCode")
        .mockImplementation(async () => userByConfirmCodeMock);

      //expect
      await expect(
        authController.registrationConfirmation({
          code: "45dff467-ccdd-49df-9e9d-c6b407538122",
        })
      ).rejects.toEqual(new BadRequestException("Email is already confirmed"));
    });
    it("Should return 400 error if confirmation date is expired", async() => {
      const mockExecute = jest.fn().mockReturnValue({
        isUserByConfirmCodeFound: true,
        isEmailAlreadyConfirmed: false,
        isConfirmDateExpired: true,
        isRegistrationConfirmed: false,
      });

      const userByConfirmCodeMock = {
        createdAt: new Date(),
        emailExpDate: add(new Date(), {
          minutes: -1,
        }),
        isConfirmed: true,
        confirmCode: "a8904469-3781-49a1-a5d7-56007c27ee77",
        registrationId: "123",
      } as const;

      jest.spyOn(commandBus, "execute").mockImplementation(mockExecute);

      jest
        .spyOn(usersRepository, "findUserByConfirmCode")
        .mockImplementation(async () => userByConfirmCodeMock);

      //expect
      await expect(
        authController.registrationConfirmation({
          code: "45dff467-ccdd-49df-9e9d-c6b407538122",
        })
      ).rejects.toEqual(new BadRequestException("Date is already expired"));
    });
    it("Should return 404 error if user by confirmationcode is not found", async() => {
      const mockExecute = jest.fn().mockReturnValue({
        isUserByConfirmCodeFound: false,
        isEmailAlreadyConfirmed: false,
        isConfirmDateExpired: true,
        isRegistrationConfirmed: false,
      });

      jest.spyOn(commandBus, "execute").mockImplementation(mockExecute);

      jest
        .spyOn(usersRepository, "findUserByConfirmCode")
        .mockImplementation(async () => null);

      //expect
      await expect(
        authController.registrationConfirmation({
          code: "45dff467-ccdd-49df-9e9d-c6b407538122",
        })
      ).rejects.toEqual(new BadRequestException("User by this confirm code not found"));
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
