import { HttpStatus, INestApplication } from "@nestjs/common";
import request from "supertest";
import { DeleteDataController } from "../../src/features/infrstructura/deleting-all-data";
import { initTestApp } from "../init.app";
import {
  creatingBlogMock,
  mockRequest,
  mockResponse,
} from "../__test-data__";
import { CreateBlogInputModelType } from "../../src/features/roles/sa/blogs/api/sa.blogs.models";

describe("Users", () => {
  let app: INestApplication;
  let deleteDataController: DeleteDataController;

  beforeAll(async () => {
    app = await initTestApp();
    await app.init();
    deleteDataController = app.get<DeleteDataController>(DeleteDataController);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await deleteDataController.deleteTestData(mockRequest, mockResponse);
  });

  describe("Create blogs by SA", () => {
    it("Should create blog successfully", () => {
      return request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);
    });

    it("Should return 401 if no headers", () => {
      return request(app.getHttpServer())
        .post("/sa/blogs")
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("Should return 400 error, validation errors", async () => {
      return request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          name: "",
          websiteUrl: "",
          description: "",
        } as CreateBlogInputModelType)
        .expect(400)
        .then(({ body }) => {
          expect(body.errorsMessages).toHaveLength(2);
          expect(body.errorsMessages).toEqual([
            {
              field: "name",
              message: "name should not be empty",
            },
            {
              field: "websiteUrl",
              message:
                "websiteUrl must match ^https://([a-zA-Z0-9_-]+.)+[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*/?$ regular expression",
            },
          ]);
        });
    });
    it("Should get blogs list", async () => {
      await request(app.getHttpServer())
        .get("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              totalCount: 0,
              page: 1,
              pageSize: 10,
              pagesCount: 0,
            })
          );
        });

      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .get("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              totalCount: 1,
              page: 1,
              pageSize: 10,
              pagesCount: 1,
            })
          );
        });
    });
  });

  describe("Posts by SA", () => {
    it("Should create post successfully", () => {
      // return request(app.getHttpServer())
      //   .post("/sa/users")
      //   .auth("admin", "qwerty", { type: "basic" })
      //   .send(registrationUser as AuthRegistrationInputModal)
      //   .expect(HttpStatus.CREATED);
    });

    it("Should return 401 if no headers", () => {
      // return request(app.getHttpServer())
      //   .post("/sa/users")
      //   .auth("admin", "qwerty", { type: "basic" })
      //   .send(registrationUser as AuthRegistrationInputModal)
      //   .expect(HttpStatus.CREATED);
    });

    it("Should return 400 error, validation errors", async () => {
      // return request(app.getHttpServer())
      //   .post("/sa/users")
      //   .auth("admin", "qwerty", { type: "basic" })
      //   .send({
      //     password: "           ",
      //     email: "123",
      //     login: "",
      //   } as AuthRegistrationInputModal)
      //   .expect(400)
      //   .then(({ body }) => {
      //     expect(body.errorsMessages).toHaveLength(3);
      //     expect(body.errorsMessages).toEqual([
      //       {
      //         field: "login",
      //         message: "login must be longer than or equal to 3 characters",
      //       },
      //       {
      //         field: "password",
      //         message: "not valid password",
      //       },
      //       {
      //         field: "email",
      //         message:
      //           "email must match /^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/ regular expression",
      //       },
      //     ]);
      //   });
    });
    it("Should get posts list", () => {});
  });

  afterAll(async () => {
    await app.close();
  });
});
