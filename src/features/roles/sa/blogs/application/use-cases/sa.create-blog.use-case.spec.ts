import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { UpdateBlogBySAUseCase } from "./sa.update-blog.use-case";
import { BlogsRepository } from "../../../../../infrstructura/blogs/blogs.repository";
import { v4 as uuidv4 } from "uuid";
import { BlogViewModel } from "../../../../../infrstructura/blogs/blogs.models";
import { CreateBlogBySAUseCase } from "./sa.create-blog.use-case";

describe("Create blog use case", () => {
  let app: TestingModule;
  let createBloguseCase: CreateBlogBySAUseCase;
  let blogsRepository: BlogsRepository;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    createBloguseCase = app.get<CreateBlogBySAUseCase>(CreateBlogBySAUseCase);
    blogsRepository = app.get<BlogsRepository>(BlogsRepository);
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(createBloguseCase).toBeDefined();
    expect(blogsRepository).toBeDefined();
  });

  it("Should create blog succesfully ", async () => {
    const blogId = uuidv4();

    jest
      .spyOn(blogsRepository, "createBlog")
      .mockImplementation(async () => blogId);

    const result = await createBloguseCase.execute({
      createBlogDTO: {
        name: "blog name",
        description: "blog description",
        websiteUrl: "website url",
      },
    });

    expect(result).toEqual({
      createdBlogId: blogId,
      isBlogCreated: true,
    });
  });
  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
