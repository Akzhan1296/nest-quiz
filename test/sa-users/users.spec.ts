import { Test, TestingModule } from "@nestjs/testing";
import {
  BadRequestException,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import request from "supertest";
import { AuthRegistrationInputModal } from "../../src/features/roles/public/auth/api/auth.models";
import { AppModule } from "../../src/app.module";
import { HttpExceptionFilter } from "../../src/exception.filter";
import { useContainer } from "class-validator";
import { DeleteDataController } from "../../src/features/infrstructura/deleting-all-data";

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
    deleteDataController = app.get<DeleteDataController>(DeleteDataController);

    await app.init();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await deleteDataController.deleteTestData();
  });

  describe("Create user by SA", () => {
    it("Should create user successfully", () => {
      return request(app.getHttpServer())
        .post("/sa/users")
        .send(registrationUser as AuthRegistrationInputModal)
        .expect(HttpStatus.CREATED);
    });
    it("Should return 400 error, validation errors", async () => {
      return request(app.getHttpServer())
        .post("/sa/users")
        .send({
          password: "           ",
          email: "123",
          login: "",
        } as AuthRegistrationInputModal)
        .expect(400)
        .then(({ body }) => {
          expect(body.errorsMessages).toHaveLength(3);
          expect(body.errorsMessages).toEqual([
            {
              field: "login",
              message: "login must be longer than or equal to 3 characters",
            },
            {
              field: "password",
              message: "not valid password",
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

  describe("Gettings users by SA", () => {
    it("Get users", async () => {
      await request(app.getHttpServer())
        .post("/sa/users")
        .send({
          login: "login1",
          password: "password",
          email: "login1@login.com",
        } as AuthRegistrationInputModal)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post("/sa/users")
        .send({
          login: "login2",
          password: "password",
          email: "login2@login.com",
        } as AuthRegistrationInputModal)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .get("/sa/users")
        .then(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              totalCount: 2,
              page: 1,
              pageSize: 10,
              pagesCount: 1,
            })
          );
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
