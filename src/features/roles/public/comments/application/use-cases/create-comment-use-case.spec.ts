import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { PostsRepository } from "../../../../../infrstructura/posts/posts.repository";
import { CommentsRepository } from "../../../../../infrstructura/comments/comments.repository";
import { CreateCommentUseCase } from "./create-comment-use-case";
import { OnlyPostDataView } from "../../../../../infrstructura/posts/posts.models";
import { v4 as uuidv4 } from "uuid";

describe("CreateCommentUseCase", () => {
  let app: TestingModule;
  let postsRepository: PostsRepository;
  let commentsRepository: CommentsRepository;
  let createCommentUseCase: CreateCommentUseCase;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    postsRepository = app.get<PostsRepository>(PostsRepository);
    commentsRepository = app.get<CommentsRepository>(CommentsRepository);
    createCommentUseCase = app.get<CreateCommentUseCase>(CreateCommentUseCase);
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(postsRepository).toBeDefined();
    expect(commentsRepository).toBeDefined();
    expect(createCommentUseCase).toBeDefined();
  });

  it("Should create comment succesfully", async () => {
    const commentId = uuidv4();

    jest
      .spyOn(postsRepository, "findPostById")
      .mockImplementation(async () => ({}) as OnlyPostDataView);

    jest
      .spyOn(commentsRepository, "createCommentForPost")
      .mockImplementation(() => commentId);

    const result = await createCommentUseCase.execute({
      createCommentDTO: {
        userLogin: "",
        userId: "",
        postId: "",
        content: "",
      },
    });

    expect(result).toEqual({
      isPostFound: true,
      isCommentCreated: true,
      commentId,
    });
  });

  it("Should NOT create comment, if post did NOT found", async () => {
    jest
      .spyOn(postsRepository, "findPostById")
      .mockImplementation(async () => null);

    const result = await createCommentUseCase.execute({
      createCommentDTO: {
        userLogin: "",
        userId: "",
        postId: "",
        content: "",
      },
    });

    expect(result).toEqual({
      isPostFound: false,
      isCommentCreated: false,
      commentId: null,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });
});
