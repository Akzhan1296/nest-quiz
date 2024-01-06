import { HttpStatus, INestApplication } from "@nestjs/common";
import request from "supertest";
import { DeleteDataController } from "../../src/features/infrstructura/deleting-all-data";
import { initTestApp } from "../init.app";
import { creatingBlogMock, mockRequest, mockResponse } from "../__test-data__";
import { CreateBlogInputModelType } from "../../src/features/roles/sa/blogs/api/sa.blogs.models";
import { v4 as uuidv4 } from "uuid";

describe("Blogs", () => {
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

  describe("Update blog by SA", () => {
    it("Should update succesfully", async () => {
      let blogId = null;

      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .get("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          blogId = body.items[0].id;
          expect(
            body.items.some((item) => item.name === creatingBlogMock.name)
          ).toBeTruthy();

          expect(body).toEqual(
            expect.objectContaining({
              totalCount: 1,
              page: 1,
              pageSize: 10,
              pagesCount: 1,
            })
          );
        });

      await request(app.getHttpServer())
        .put(`/sa/blogs/${blogId}`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          ...creatingBlogMock,
          name: "updated name",
        } as CreateBlogInputModelType)
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .get("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          blogId = body.items[0].id;
          expect(
            body.items.some((item) => item.name === "updated name")
          ).toBeTruthy();

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

    it("Should return 404 error, if blog not found", async () => {
      await request(app.getHttpServer())
        .put(`/sa/blogs/${uuidv4()}`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          ...creatingBlogMock,
          name: "updated name",
        } as CreateBlogInputModelType)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe("Delete blog by SA", () => {
    it("Should delete succesfully", async () => {
      let blogId = null;

      await request(app.getHttpServer())
        .post("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .send(creatingBlogMock as CreateBlogInputModelType)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .get("/sa/blogs")
        .auth("admin", "qwerty", { type: "basic" })
        .then(({ body }) => {
          blogId = body.items[0].id;
          expect(
            body.items.some((item) => item.name === creatingBlogMock.name)
          ).toBeTruthy();

          expect(body).toEqual(
            expect.objectContaining({
              totalCount: 1,
              page: 1,
              pageSize: 10,
              pagesCount: 1,
            })
          );
        });

      await request(app.getHttpServer())
        .delete(`/sa/blogs/${blogId}`)
        .auth("admin", "qwerty", { type: "basic" })
        .expect(HttpStatus.NO_CONTENT);

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
    });

    it("Should return 404 error, if blog not found", async () => {
      await request(app.getHttpServer())
        .delete(`/sa/blogs/${uuidv4()}`)
        .auth("admin", "qwerty", { type: "basic" })
        .expect(HttpStatus.NOT_FOUND);
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
