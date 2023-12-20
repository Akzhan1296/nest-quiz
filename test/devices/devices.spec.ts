import { Test, TestingModule } from "@nestjs/testing";
import {
  BadRequestException,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import cookieParser from "cookie-parser";
import request from "supertest";
import {
  AuthLoginInputModal,
  AuthRegistrationInputModal,
} from "../../src/features/roles/public/auth/api/auth.models";
import { AppModule } from "../../src/app.module";
import { HttpExceptionFilter } from "../../src/exception.filter";
import { useContainer } from "class-validator";
import { DeleteDataController } from "../../src/features/infrstructura/deleting-all-data";

describe("Auth", () => {
  let app: INestApplication;
  let deleteDataController: DeleteDataController;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.use(cookieParser());

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

    deleteDataController = app.get<DeleteDataController>(DeleteDataController);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await deleteDataController.deleteTestData();
  });

  it("Get devices list ", async () => {
    // adding user by SA
    await request(app.getHttpServer())
      .post("/sa/users")
      .send({
        login: "login1",
        password: "password",
        email: "login1@login.com",
      } as AuthRegistrationInputModal)
      .expect(HttpStatus.CREATED);

    //auth user
    const result = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        loginOrEmail: "login1",
        password: "password",
      } as AuthLoginInputModal);

    const refreshToken = result.headers["set-cookie"][0].split("=")[1];

    await request(app.getHttpServer())
      .get("/security/devices")
      .set("Cookie", `refreshToken=${refreshToken}`)
      .then(({ body }) => {
        expect(body).toHaveLength(1);
      });
  });


  // TODO: implement E2E
  describe("Deleting device", () => {
    it("Shoud delete user current device", async () => {
      // adding user by SA
      await request(app.getHttpServer())
        .post("/sa/users")
        .send({
          login: "login1",
          password: "password",
          email: "login1@login.com",
        } as AuthRegistrationInputModal)
        .expect(HttpStatus.CREATED);

      //auth user
      const result = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          loginOrEmail: "login1",
          password: "password",
        } as AuthLoginInputModal);

      const refreshToken = result.headers["set-cookie"][0].split("=")[1];

      await request(app.getHttpServer())
        .get("/security/devices")
        .set("Cookie", `refreshToken=${refreshToken}`)
        .then(({ body }) => {
          expect(body).toHaveLength(1);
        });
    });

    it("Should return 403 error, if user try to delete somebody's device ", async () => {
      // adding user by SA
      await request(app.getHttpServer())
        .post("/sa/users")
        .send({
          login: "login1",
          password: "password",
          email: "login1@login.com",
        } as AuthRegistrationInputModal)
        .expect(HttpStatus.CREATED);

      //auth user
      const result = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          loginOrEmail: "login1",
          password: "password",
        } as AuthLoginInputModal);

      const refreshToken = result.headers["set-cookie"][0].split("=")[1];

      await request(app.getHttpServer())
        .get("/security/devices")
        .set("Cookie", `refreshToken=${refreshToken}`)
        .then(({ body }) => {
          expect(body).toHaveLength(1);
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
