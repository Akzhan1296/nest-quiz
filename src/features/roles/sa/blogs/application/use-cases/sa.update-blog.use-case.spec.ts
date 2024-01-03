import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { UpdateBlogBySAUseCase } from "./sa.update-blog.use-case";
import { BlogsRepository } from "../../../../../infrstructura/blogs/blogs.repository";
import { v4 as uuidv4 } from "uuid";
import { BlogViewModel } from "../../../../../infrstructura/blogs/blogs.models";

describe("Update blog use case", () => {
  let app: TestingModule;
  let updateBlogUseCase: UpdateBlogBySAUseCase;
  let blogsRepository: BlogsRepository;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    updateBlogUseCase = app.get<UpdateBlogBySAUseCase>(UpdateBlogBySAUseCase);
    blogsRepository = app.get<BlogsRepository>(BlogsRepository);
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(updateBlogUseCase).toBeDefined();
    expect(blogsRepository).toBeDefined();
  });

  it("Should update blog succesfully ", async () => {
    const blogId = uuidv4();

    jest
      .spyOn(blogsRepository, "findBlogById")
      .mockImplementation(async () => ({}) as Promise<BlogViewModel>);

    jest
      .spyOn(blogsRepository, "updateBlogById")
      .mockImplementation(async () => true);

    const result = await updateBlogUseCase.execute({
      updateBlogDTO: {
        name: "blog name",
        description: "blog description",
        websiteUrl: "website url",
        blogId,
      },
    });

    expect(result).toEqual({
      isBlogFound: true,
      isBlogUpdated: true,
    });
  });

  it("Should return 404 error", async () => {
    const blogId = uuidv4();

    jest
      .spyOn(blogsRepository, "findBlogById")
      .mockImplementation(async () => null);

    jest
      .spyOn(blogsRepository, "updateBlogById")
      .mockImplementation(async () => false);

    const result = await updateBlogUseCase.execute({
      updateBlogDTO: {
        name: "blog name",
        description: "blog description",
        websiteUrl: "website url",
        blogId,
      },
    });
    expect(result).toEqual({
      isBlogFound: false,
      isBlogUpdated: false,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
