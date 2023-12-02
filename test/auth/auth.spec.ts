import { Test, TestingModule } from "@nestjs/testing";
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import * as request from "supertest";
import { AuthRegistrationInputModal } from "../../src/features/roles/public/auth/api/auth.models";
import { AppModule } from "../../src/app.module";
import { HttpExceptionFilter } from "../../src/exception.filter";
import { useContainer } from "class-validator";
describe("Auth", () => {
  const registrationUser: AuthRegistrationInputModal = {
    login: `login${new Date().getHours()}${new Date().getMilliseconds()}`.slice(0,10),
    password: "password",
    email: `test${new Date().getHours()}${new Date().getMilliseconds()}@test.ru`,
  };

  let app: INestApplication;

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
    it('Should confirm registration successfully', () => {

    })
  })

  afterAll(async () => {
    await app.close();
  });
});
