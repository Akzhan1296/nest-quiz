import { HttpStatus, INestApplication } from "@nestjs/common";
import request from "supertest";
import { DeleteDataController } from "../../src/features/infrstructura/deleting-all-data";
import { initTestApp } from "../init.app";
import { mockRequest, mockResponse } from "../__test-data__";
import { v4 as uuidv4 } from "uuid";

describe("Comments", () => {
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

  describe("Create comment", () => {
    it("Should create comment successfully", () => {});
    it("Should NOT create comment, if user not authorized", () => {});
    it("Should return 404, if post not found", () => {});
    it("Shouldreturn 400, if inputs are invalid", () => {});
  });

  describe("Handle comment like", () => {
    it("Should add like for comment, if comment found", () => {});
    it("Should return 404, if comment not found", () => {});
    it("Should return 400, if inputs are invalid", () => {});
    it("Should add like for comment, and return by owner, CHECK my status (Like)", () => {});
    it("Should add like for comment by authorized user, and get by not authorized user, CHECK my status (none)", () => {});
  });

  afterAll(async () => {
    await app.close();
  });
});
