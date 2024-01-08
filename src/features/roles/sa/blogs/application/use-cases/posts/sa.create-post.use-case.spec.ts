import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../../app.module";
import { v4 as uuidv4 } from "uuid";
import { BlogsRepository } from "../../../../../../infrstructura/blogs/blogs.repository";
import { PostsRepository } from "../../../../../../infrstructura/posts/posts.repository";
import { CreatePostBySAUseCase } from "./sa.create-post.use-case";

describe("Create post use case", () => {
  let app: TestingModule;
  let createPostUseCase: CreatePostBySAUseCase;
  let blogsRepository: BlogsRepository;
  let postsRepository: PostsRepository;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    createPostUseCase = app.get<CreatePostBySAUseCase>(CreatePostBySAUseCase);
    blogsRepository = app.get<BlogsRepository>(BlogsRepository);
    postsRepository = app.get<PostsRepository>(PostsRepository);
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(createPostUseCase).toBeDefined();
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
      .spyOn(postsRepository, "createPost")
      .mockImplementation(async () => postId);

    const result = await createPostUseCase.execute({
      createPostDTO: {
        title: "title",
        shortDescription: "shortDescription",
        content: "content",
        blogId,
      },
    });

    expect(result).toEqual({
      isBlogFound: true,
      isPostCreated: true,
      createdPostId: postId,
    });
  });
  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
