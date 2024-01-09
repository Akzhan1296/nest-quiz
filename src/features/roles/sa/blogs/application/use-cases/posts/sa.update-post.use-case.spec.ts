import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../../app.module";
import { v4 as uuidv4 } from "uuid";
import { BlogsRepository } from "../../../../../../infrstructura/blogs/blogs.repository";
import { PostsRepository } from "../../../../../../infrstructura/posts/posts.repository";
import { UpdatePostBySAUseCase } from "./sa.update-post.use-case";

describe("Update post use case", () => {
  let app: TestingModule;
  let updatePostUseCase: UpdatePostBySAUseCase;
  let blogsRepository: BlogsRepository;
  let postsRepository: PostsRepository;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    updatePostUseCase = app.get<UpdatePostBySAUseCase>(UpdatePostBySAUseCase);
    blogsRepository = app.get<BlogsRepository>(BlogsRepository);
    postsRepository = app.get<PostsRepository>(PostsRepository);
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(updatePostUseCase).toBeDefined();
    expect(blogsRepository).toBeDefined();
    expect(postsRepository).toBeDefined();
  });

  it("Should create post succesfully ", async () => {
    const blogId = uuidv4();
    const postId = uuidv4();

    jest
      .spyOn(blogsRepository, "findBlogById")
      .mockImplementation(async () => blogId);
    jest
      .spyOn(postsRepository, "findPostById")
      .mockImplementation(async () => postId);

    jest
      .spyOn(postsRepository, "updatePostById")
      .mockImplementation(async () => true);

    const result = await updatePostUseCase.execute({
      updatePostDTO: {
        title: "updated title",
        shortDescription: "updated shortDescription",
        content: "updated content",
        blogId,
        postId,
      },
    });

    expect(result).toEqual({
      isBlogFound: true,
      isPostFound: true,
      isPostUpdated: true,
    });
  });
  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
