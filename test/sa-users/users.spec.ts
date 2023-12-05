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

const registrationUser: AuthRegistrationInputModal = {
  login: `login${new Date().getHours()}${new Date().getMilliseconds()}`.slice(
    0,
    10
  ),
  password: "password",
  email: `test${new Date().getHours()}${new Date().getMilliseconds()}@test.ru`,
} as const;

describe("Auth", () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Create user by SA", () => {
    it("Should create user successfully", () => {
      return request(app.getHttpServer())
        .post("/sa/users")
        .send(registrationUser as AuthRegistrationInputModal)
        .expect(201);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
