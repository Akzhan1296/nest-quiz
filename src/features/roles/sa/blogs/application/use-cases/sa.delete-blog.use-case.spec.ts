import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { BlogsRepository } from "../../../../../infrstructura/blogs/blogs.repository";
import { v4 as uuidv4 } from "uuid";
import { BlogViewModel } from "../../../../../infrstructura/blogs/blogs.models";
import { DeleteBlogBySAUseCase } from "./sa.delete-blog.use-case";

describe("Delete blog use case", () => {
  let app: TestingModule;
  let deleteBlogUseCase: DeleteBlogBySAUseCase;
  let blogsRepository: BlogsRepository;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    deleteBlogUseCase = app.get<DeleteBlogBySAUseCase>(DeleteBlogBySAUseCase);
    blogsRepository = app.get<BlogsRepository>(BlogsRepository);
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(deleteBlogUseCase).toBeDefined();
    expect(blogsRepository).toBeDefined();
  });

  it("Should delete blog succesfully ", async () => {
    const blogId = uuidv4();

    jest
      .spyOn(blogsRepository, "findBlogById")
      .mockImplementation(async () => ({}) as Promise<BlogViewModel>);

    jest
      .spyOn(blogsRepository, "deleteBlogById")
      .mockImplementation(async () => true);

    const result = await deleteBlogUseCase.execute({
      deleteBlogDTO: {
        blogId,
      },
    });

    expect(result).toEqual({
      isBlogFound: true,
      isBlogDeleted: true,
    });
  });

  it("Should return 404 error", async () => {
    const blogId = uuidv4();

    jest
      .spyOn(blogsRepository, "findBlogById")
      .mockImplementation(async () => null);

    jest
      .spyOn(blogsRepository, "deleteBlogById")
      .mockImplementation(async () => false);

    const result = await deleteBlogUseCase.execute({
      deleteBlogDTO: {
        blogId,
      },
    });
    expect(result).toEqual({
      isBlogFound: false,
      isBlogDeleted: false,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
