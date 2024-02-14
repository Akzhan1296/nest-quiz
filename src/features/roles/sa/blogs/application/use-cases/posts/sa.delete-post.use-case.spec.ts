import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../../app.module";
import { v4 as uuidv4 } from "uuid";
import { BlogsRepository } from "../../../../../../infrstructura/blogs/blogs.repository";
import { PostsRepository } from "../../../../../../infrstructura/posts/posts.repository";
import { DeletePostBySAUseCase } from "./sa.delete-post.use-case";

describe("Delete post use case", () => {
  let app: TestingModule;
  let deletePostUseCase: DeletePostBySAUseCase;
  let blogsRepository: BlogsRepository;
  let postsRepository: PostsRepository;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    deletePostUseCase = app.get<DeletePostBySAUseCase>(DeletePostBySAUseCase);
    blogsRepository = app.get<BlogsRepository>(BlogsRepository);
    postsRepository = app.get<PostsRepository>(PostsRepository);
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(deletePostUseCase).toBeDefined();
    expect(blogsRepository).toBeDefined();
    expect(postsRepository).toBeDefined();
  });

  it("Should delete post succesfully ", async () => {
    const blogId = uuidv4();
    const postId = uuidv4();

    jest
      .spyOn(blogsRepository, "findBlogById")
      .mockImplementation(async () => blogId);
    jest
      .spyOn(postsRepository, "findPostById")
      .mockImplementation(async () => postId);

    jest
      .spyOn(postsRepository, "deletePostById")
      .mockImplementation(async () => true);

    const result = await deletePostUseCase.execute({
      deletePostDTO: {
        blogId,
        postId,
      },
    });

    expect(result).toEqual({
      isBlogFound: true,
      isPostFound: true,
      isPostDeleted: true,
    });
  });

  it("Should return 404 error is post not found ", async () => {
    const blogId = uuidv4();
    const postId = uuidv4();

    jest
      .spyOn(blogsRepository, "findBlogById")
      .mockImplementation(async () => blogId);
    jest
      .spyOn(postsRepository, "findPostById")
      .mockImplementation(async () => null);

    const result = await deletePostUseCase.execute({
      deletePostDTO: {
        blogId,
        postId,
      },
    });

    expect(result).toEqual({
      isBlogFound: true,
      isPostFound: false,
      isPostDeleted: false,
    });
  });

  it("Should return 404 blog not found ", async () => {
    const blogId = uuidv4();
    const postId = uuidv4();

    jest
      .spyOn(blogsRepository, "findBlogById")
      .mockImplementation(async () => null);
    jest
      .spyOn(postsRepository, "findPostById")
      .mockImplementation(async () => null);

    const result = await deletePostUseCase.execute({
      deletePostDTO: {
        blogId,
        postId,
      },
    });

    expect(result).toEqual({
      isBlogFound: false,
      isPostFound: false,
      isPostDeleted: false,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
