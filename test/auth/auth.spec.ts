import { Test, TestingModule } from "@nestjs/testing";
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import * as request from "supertest";
import { AuthRegistrationConfirmInputModal, AuthRegistrationInputModal } from "../../src/features/roles/public/auth/api/auth.models";
import { AppModule } from "../../src/app.module";
import { HttpExceptionFilter } from "../../src/exception.filter";
import { useContainer } from "class-validator";
import { add } from "date-fns";
import { UsersRepository } from "../../src/features/infrstructura/users/users.repository";


describe("Auth", () => {
  const registrationUser: AuthRegistrationInputModal = {
    login: `login${new Date().getHours()}${new Date().getMilliseconds()}`.slice(0,10),
    password: "password",
    email: `test${new Date().getHours()}${new Date().getMilliseconds()}@test.ru`,
  };

  let app: INestApplication;
  let usersRepository: UsersRepository;

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

  });

  describe('Registration flow',() => {
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
  })

  describe('Registration confirmation flow', () => {
    it("Should confirm registration successfully", () => {
      const userByConfirmCodeMock = {
        createdAt: new Date(),
        emailExpDate: add(new Date(), {
          minutes: 1,
        }),
        isConfirmed: false,
        confirmCode: "45dff427-ccdd-49df-9e9d-c6b407538137",
        registrationId: "123",
      } as const;

      jest
      .spyOn(usersRepository, "findUserByConfirmCode")
      .mockImplementation(async () => userByConfirmCodeMock);

    jest
    .spyOn(usersRepository, "confirmRegistration")
    .mockImplementation(async () => true);

      return request(app.getHttpServer())
        .post("/auth/registration-confirmation")
        .send({code: "45dff427-ccdd-49df-9e9d-c6b407538137"} as AuthRegistrationConfirmInputModal)
        .expect(204);
    });

    it("Should return 404 error ", () => {
      jest
      .spyOn(usersRepository, "findUserByConfirmCode")
      .mockImplementation(async () => null);
      return request(app.getHttpServer())
        .post("/auth/registration-confirmation")
        .send({code: "55dff337-ccdd-49df-9e9d-c6b407538137"} as AuthRegistrationConfirmInputModal)
        .expect(404);
    });

    it("Should return 400 error", async () => {
      const userByConfirmCodeMock = {
        createdAt: new Date(),
        emailExpDate: add(new Date(), {
          minutes: 1,
        }),
        isConfirmed: true,
        confirmCode: "45dff427-ccdd-49df-9e9d-c6b407538137",
        registrationId: "123",
      } as const;

      jest
      .spyOn(usersRepository, "findUserByConfirmCode")
      .mockImplementation(async () => userByConfirmCodeMock);

       request(app.getHttpServer())
        .post("/auth/registration-confirmation")
        .send({code: "45dff427-ccdd-49df-9e9d-c6b407538137"} as AuthRegistrationConfirmInputModal)
        .expect(400)
        .then(({ body }) => {
          expect(body.errorsMessages).toHaveLength(1);
          expect(body.errorsMessages).toEqual([
            {
              field: "code",
              message: "Email is already confirmed",
            }
          ]);
        });
    });
  })

  afterAll(async () => {
    await app.close();
  });
});
