import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { UsersRepository } from "../../../../../infrstructura/users/users.repository";
import { RegistrationConfirmationUseCase } from "./registration-confirmation-use-case";
import { add } from "date-fns";
import { v4 as uuidv4 } from "uuid";

const userByConfirmCodeMock = {
  createdAt: new Date(),
  emailExpDate: add(new Date(), {
    minutes: 1,
  }),
  isConfirmed: false,
  confirmCode: "a8904469-3781-49a1-a5d7-56007c27ee77",
  registrationId: uuidv4(),
  userId: uuidv4()
} as const;

describe("Registration confirmation use-case", () => {
  let app: TestingModule;
  let usersRepository: UsersRepository;
  let registrationConfirmationUserUseCase: RegistrationConfirmationUseCase;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    usersRepository = app.get<UsersRepository>(UsersRepository);
    registrationConfirmationUserUseCase =
      app.get<RegistrationConfirmationUseCase>(RegistrationConfirmationUseCase);
  });

  it("Should be defined", () => {
    expect(registrationConfirmationUserUseCase).toBeDefined();
    expect(usersRepository).toBeDefined();
  });
  it("Should confirm registration", async () => {
    jest
      .spyOn(usersRepository, "findRegistrationDataByConfirmCode")
      .mockImplementation(async () => userByConfirmCodeMock);

    jest
    .spyOn(usersRepository, "confirmRegistration")
    .mockImplementation(async () => true);

    const result = await registrationConfirmationUserUseCase.execute({
      confirmCode: { code: "a8904469-3781-49a1-a5d7-56007c27ee77" },
    });

    expect(result).toEqual({
      isUserByConfirmCodeFound: true,
      isEmailAlreadyConfirmed: false,
      isConfirmDateExpired: false,
      isRegistrationConfirmed: true,
    });
  });

  it("Should return isEmailAlreadyConfirmed: true, if email already confirmed", async () => {
    jest
      .spyOn(usersRepository, "findRegistrationDataByConfirmCode")
      .mockImplementation(async () => ({
        ...userByConfirmCodeMock,
        isConfirmed: true,
      }));

    const result = await registrationConfirmationUserUseCase.execute({
      confirmCode: { code: "a8904469-3781-49a1-a5d7-56007c27ee77" },
    });

    expect(result).toEqual({
      isUserByConfirmCodeFound: true,
      isEmailAlreadyConfirmed: true,
      isConfirmDateExpired: false,
      isRegistrationConfirmed: false,
    });
  });

  it("Should return isConfirmDateExpired: true, if exp date is already expired", async () => {
    jest
      .spyOn(usersRepository, "findRegistrationDataByConfirmCode")
      .mockImplementation(async () => ({
        ...userByConfirmCodeMock,
        emailExpDate: add(new Date(), {
          minutes: -10,
        }),
      }));

    const result = await registrationConfirmationUserUseCase.execute({
      confirmCode: { code: "a8904469-3781-49a1-a5d7-56007c27ee77" },
    });

    expect(result).toEqual({
      isUserByConfirmCodeFound: true,
      isEmailAlreadyConfirmed: false,
      isConfirmDateExpired: true,
      isRegistrationConfirmed: false,
    });
  });

  it("Should return isUserByConfirmCodeFound: false, if user by confirm code not found", async () => {
    jest
      .spyOn(usersRepository, "findRegistrationDataByConfirmCode")
      .mockImplementation(async () => null);

    const result = await registrationConfirmationUserUseCase.execute({
      confirmCode: { code: "a8904469-3781-49a1-a5d7-56007c27ee77" },
    });

    expect(result).toEqual({
      isUserByConfirmCodeFound: false,
      isEmailAlreadyConfirmed: false,
      isConfirmDateExpired: false,
      isRegistrationConfirmed: false,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
