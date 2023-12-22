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
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

const mockRequest = {
  headers: {
    "user-agent": "device name",
  },
} as unknown as Request;

const mockResponse = {
  cookie: jest.fn(),
  status: jest.fn(() => mockResponse),
  send: jest.fn(() => true),
} as unknown as Response;

describe("Devices E2E", () => {
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
    await deleteDataController.deleteTestData(mockRequest, mockResponse);
  });

  it("Get devices list ", async () => {
    // adding user by SA
    await request(app.getHttpServer())
      .post("/sa/users")
      .auth("admin", "qwerty", { type: "basic" })
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

  it("Deleting all  devices except current", async () => {
    // adding user by SA
    await request(app.getHttpServer())
      .post("/sa/users")
      .auth("admin", "qwerty", { type: "basic" })
      .send({
        login: "login123",
        password: "password",
        email: "login1@login.com",
      } as AuthRegistrationInputModal)
      .expect(HttpStatus.CREATED);

    //auth user
    const result = await request(app.getHttpServer())
      .post("/auth/login")
      .set("User-Agent", "1234")
      .send({
        loginOrEmail: "login123",
        password: "password",
      } as AuthLoginInputModal);

    await request(app.getHttpServer())
      .post("/auth/login")
      .set("User-Agent", "123")
      .send({
        loginOrEmail: "login123",
        password: "password",
      } as AuthLoginInputModal);

    const refreshToken = result.headers["set-cookie"][0].split("=")[1];

    // get gevice id
    const devices = await request(app.getHttpServer())
      .get("/security/devices")
      .set("Cookie", `refreshToken=${refreshToken}`);

    expect(devices.body).toHaveLength(2);

    // delete current device by id
    await request(app.getHttpServer())
      .delete(`/security/devices`)
      .set("Cookie", `refreshToken=${refreshToken}`)
      .expect(HttpStatus.NO_CONTENT);

    // get gevice id
    const devices1 = await request(app.getHttpServer())
      .get("/security/devices")
      .set("Cookie", `refreshToken=${refreshToken}`);

    expect(devices1.body).toHaveLength(1);
  });
  describe("Deleting device by ID", () => {
    it("Shoud delete user's current device by ID", async () => {
      // adding user by SA
      await request(app.getHttpServer())
        .post("/sa/users")
        .auth("admin", "qwerty", { type: "basic" })
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

      // get gevice id
      const devices = await request(app.getHttpServer())
        .get("/security/devices")
        .set("Cookie", `refreshToken=${refreshToken}`);

      expect(devices.body).toHaveLength(1);

      // delete current device by id
      await request(app.getHttpServer())
        .delete(`/security/devices/${devices.body[0].deviceId}`)
        .set("Cookie", `refreshToken=${refreshToken}`)
        .expect(HttpStatus.NO_CONTENT);

      // should get 401
      await request(app.getHttpServer())
        .get("/security/devices")
        .set("Cookie", `refreshToken=${refreshToken}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("Shoud return 403 error, if user try to delete somebody's device", async () => {
      // adding user by SA
      await request(app.getHttpServer())
        .post("/sa/users")
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          login: "login1",
          password: "password",
          email: "login1@login.com",
        } as AuthRegistrationInputModal)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post("/sa/users")
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          login: "login2",
          password: "password",
          email: "login2@login.com",
        } as AuthRegistrationInputModal)
        .expect(HttpStatus.CREATED);

      //auth user 1
      const result = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          loginOrEmail: "login1",
          password: "password",
        } as AuthLoginInputModal);

      const refreshToken = result.headers["set-cookie"][0].split("=")[1];

      // get gevice id for user 1
      const devices = await request(app.getHttpServer())
        .get("/security/devices")
        .set("Cookie", `refreshToken=${refreshToken}`);

      expect(devices.body).toHaveLength(1);

      //auth user 2
      const result2 = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          loginOrEmail: "login2",
          password: "password",
        } as AuthLoginInputModal);

      const refreshToken2 = result2.headers["set-cookie"][0].split("=")[1];

      // delete current device by id
      await request(app.getHttpServer())
        .delete(`/security/devices/${devices.body[0].deviceId}`)
        .set("Cookie", `refreshToken=${refreshToken2}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it("Shoud return 404 error, if no device", async () => {
      // adding user by SA
      await request(app.getHttpServer())
        .post("/sa/users")
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          login: "login1",
          password: "password",
          email: "login1@login.com",
        } as AuthRegistrationInputModal)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post("/sa/users")
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          login: "login2",
          password: "password",
          email: "login2@login.com",
        } as AuthRegistrationInputModal)
        .expect(HttpStatus.CREATED);

      //auth user 1
      const result = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          loginOrEmail: "login1",
          password: "password",
        } as AuthLoginInputModal);

      const refreshToken = result.headers["set-cookie"][0].split("=")[1];

      // try to delete with no id
      await request(app.getHttpServer())
        .delete(`/security/devices/${uuidv4()}`)
        .set("Cookie", `refreshToken=${refreshToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
