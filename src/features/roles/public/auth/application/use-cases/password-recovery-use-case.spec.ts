import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { UsersRepository } from "../../../../../infrstructura/users/users.repository";
import { add } from "date-fns";
import { PasswordRecoveryUseCase } from "./password-recovery-use-case";
import { RegistrationWithUserViewDTO } from "../../../../../infrstructura/users/models/users.models";

const userByConfirmCodeMock = {
  createdAt: new Date(),
  emailExpDate: add(new Date(), {
    minutes: 1,
  }),
  isConfirmed: false,
  confirmCode: "a8904469-3781-49a1-a5d7-56007c27ee77",
  registrationId: "123",
} as const;

describe("Password recovery use-case", () => {
  let app: TestingModule;
  let usersRepository: UsersRepository;
  let passwordRecoveryUseCase: PasswordRecoveryUseCase;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    usersRepository = app.get<UsersRepository>(UsersRepository);
    passwordRecoveryUseCase = app.get<PasswordRecoveryUseCase>(
      PasswordRecoveryUseCase
    );
  });

  it("Should be defined", () => {
    expect(passwordRecoveryUseCase).toBeDefined();
    expect(usersRepository).toBeDefined();
  });
  it("Should not send recovery code, if user not found", async () => {
    jest
      .spyOn(usersRepository, "findUserRegistrationDataByEmail")
      .mockImplementation(async () => null);

    const result = await passwordRecoveryUseCase.execute({
      email: "test@test.com",
    });

    expect(result).toEqual({
      isConfirmDataUpdated: false,
      isUserFound: false,
    });
  });

  it("Should update and send recovery code, if user found", async () => {
    jest
      .spyOn(usersRepository, "findUserRegistrationDataByEmail")
      .mockImplementation(async () => ({}) as RegistrationWithUserViewDTO);

    jest
      .spyOn(usersRepository, "setNewConfirmCode")
      .mockImplementation(async () => true);

    const result = await passwordRecoveryUseCase.execute({
      email: "test@test.com",
    });

    expect(result).toEqual({
      isConfirmDataUpdated: true,
      isUserFound: true,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
