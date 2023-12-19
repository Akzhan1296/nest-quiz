import { Test, TestingModule } from "@nestjs/testing";
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import * as request from "supertest";
import {
  AuthEmailResendingInputModal,
  AuthLoginInputModal,
  AuthRegistrationConfirmInputModal,
  AuthRegistrationInputModal,
} from "../../src/features/roles/public/auth/api/auth.models";
import { AppModule } from "../../src/app.module";
import { HttpExceptionFilter } from "../../src/exception.filter";
import { useContainer } from "class-validator";
import { add } from "date-fns";
import { UsersRepository } from "../../src/features/infrstructura/users/users.repository";
import { v4 as uuidv4 } from "uuid";
import { DeleteDataController } from "../../src/features/infrstructura/deleting-all-data";

const registrationUser: AuthRegistrationInputModal = {
  login: `login${new Date().getHours()}${new Date().getMilliseconds()}`.slice(
    0,
    10
  ),
  password: "password",
  email: `test${new Date().getHours()}${new Date().getMilliseconds()}@test.ru`,
} as const;

const userByEmailMock = {
  createdAt: new Date(),
  emailExpDate: add(new Date(), {
    minutes: 1,
  }),
  isConfirmed: false,
  confirmCode: "a8904469-3781-49a1-a5d7-56007c27ee77",
  registrationId: uuidv4(),
  userId: uuidv4(),
  email: "test@test.com",
} as const;

const userByConfirmCodeMock = {
  createdAt: new Date(),
  emailExpDate: add(new Date(), {
    minutes: 1,
  }),
  isConfirmed: false,
  confirmCode: uuidv4(),
  registrationId: uuidv4(),
} as const;

describe("Auth", () => {
  let app: INestApplication;
  let usersRepository: UsersRepository;
  let deleteDataController: DeleteDataController;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useGlobalPipes(
      new ValidationPipe({
        stopAtFirstError: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: (errors) => {
          const errorsForProperty: any[] = [];

          errors.forEach((e) => {
            const constrainKey = Object.keys(e.constraints!);
            constrainKey.forEach((cKey) => {
              errorsForProperty.push({
                field: e.property,
                message: e.constraints![cKey],
              });
            });
          });

          throw new BadRequestException(errorsForProperty);
        },
      })
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    usersRepository = app.get<UsersRepository>(UsersRepository);
    deleteDataController = app.get<DeleteDataController>(DeleteDataController);
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    await deleteDataController.deleteTestData();
  });

  describe("Registration flow", () => {
    it("Should registrate user successfully", () => {
      return request(app.getHttpServer())
        .post("/auth/registration")
        .send(registrationUser as AuthRegistrationInputModal)
        .expect(204);
    });

    it("Should return 400, class validator errors", async () => {
      return request(app.getHttpServer())
        .post("/auth/registration")
        .send({
          login: "",
          email: "123",
          password: "1235678",
        } as AuthRegistrationInputModal)
        .expect(400)
        .then(({ body }) => {
          expect(body.errorsMessages).toHaveLength(2);
          expect(body.errorsMessages).toEqual([
            {
              field: "login",
              message: "login must be longer than or equal to 3 characters",
            },
            {
              field: "email",
              message:
                "email must match /^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/ regular expression",
            },
          ]);
        });
    });
  });

  describe("Registration confirmation flow", () => {
    it("Should confirm registration successfully", () => {
      jest
        .spyOn(usersRepository, "findUserByConfirmCode")
        .mockImplementation(async () => userByConfirmCodeMock);

      jest
        .spyOn(usersRepository, "confirmRegistration")
        .mockImplementation(async () => true);

      return request(app.getHttpServer())
        .post("/auth/registration-confirmation")
        .send({
          code: "45dff427-ccdd-49df-9e9d-c6b407538137",
        } as AuthRegistrationConfirmInputModal)
        .expect(204);
    });

    it("Should return 404 error ", () => {
      jest
        .spyOn(usersRepository, "findUserByConfirmCode")
        .mockImplementation(async () => null);
      return request(app.getHttpServer())
        .post("/auth/registration-confirmation")
        .send({
          code: uuidv4(), //should be different code
        } as AuthRegistrationConfirmInputModal)
        .expect(404);
    });

    it("Should return 400 error", async () => {
      jest
        .spyOn(usersRepository, "findUserByConfirmCode")
        .mockImplementation(async () => ({
          ...userByConfirmCodeMock,
          isConfirmed: true,
        }));

      request(app.getHttpServer())
        .post("/auth/registration-confirmation")
        .send({
          code: "45dff427-ccdd-49df-9e9d-c6b407538137",
        } as AuthRegistrationConfirmInputModal)
        .expect(400)
        .then(({ body }) => {
          expect(body.errorsMessages).toHaveLength(1);
          expect(body.errorsMessages).toEqual([
            {
              field: "code",
              message: "Email is already confirmed",
            },
          ]);
        });
    });
  });

  describe("Confirm email resending", () => {
    it("Should resend email", () => {
      jest
        .spyOn(usersRepository, "findUserRegistrationDataByEmail")
        .mockImplementation(async () => userByEmailMock);

      request(app.getHttpServer())
        .post("/auth/registration-email-resending")
        .send({
          email: "not-real-email@test.com",
        } as AuthEmailResendingInputModal)
        .expect(204);
    });

    it("Should return 404 error", () => {
      jest
        .spyOn(usersRepository, "findUserRegistrationDataByEmail")
        .mockImplementation(async () => null);
      return request(app.getHttpServer())
        .post("/auth/registration-email-resending")
        .send({
          email: "not-3real-email@test.com",
        } as AuthEmailResendingInputModal)
        .expect(404);
    });

    it("Should return 400 error, if email already confirmed", () => {
      jest
        .spyOn(usersRepository, "findUserRegistrationDataByEmail")
        .mockImplementation(async () => ({
          ...userByEmailMock,
          isConfirmed: true,
        }));

      request(app.getHttpServer())
        .post("/auth/registration-email-resending")
        .send({
          email: "not-real-email@test.com",
        } as AuthEmailResendingInputModal)
        .expect(400)
        .then(({ body }) => {
          expect(body.errorsMessages).toHaveLength(1);
          expect(body.errorsMessages).toEqual([
            {
              field: "code",
              message: "Email is already confirmed",
            },
          ]);
        });
    });
  });

  describe("Get user info", () => {
    it("User info", async () => {
      // adding user by SA
      await request(app.getHttpServer())
        .post("/sa/users")
        .send({
          login: "login1",
          password: "password",
          email: "login1@login.com",
        } as AuthRegistrationInputModal)
        .expect(201);

      //auth user
      const result = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          loginOrEmail: "login1",
          password: "password",
        } as AuthLoginInputModal);

      const accessToken = result.body.accessToken;
      
      //get added user info
      await request(app.getHttpServer())
        .get("/auth/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .then(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              login: 'login1',
              email: 'login1@login.com',
            })
          );
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});

//future E2E cases

// login: add user by SA -> auth in to system
// refresh: add user by SA -> auth ->  refresh token
// log out: add user by SA -> auth -> logout -> refresh token expect 401
// new-password: registration user -> confirm registration -> auth -> (expect 401) -> recovery-password -> set new password -> auth (new password 200) -> auth (old)