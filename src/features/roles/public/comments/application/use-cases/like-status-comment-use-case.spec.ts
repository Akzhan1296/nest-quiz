import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../../../../../app.module";
import { CommentsRepository } from "../../../../../infrstructura/comments/comments.repository";
import { LikeStatusCommentUseCase } from "./like-status-comment-use-case";
import { CommentDataView } from "../../../../../infrstructura/comments/models/comments.models";

describe("LikeStatusCommentUseCase", () => {
  let app: TestingModule;
  let commentsRepository: CommentsRepository;
  let likeStatusCommentuseCase: LikeStatusCommentUseCase;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();
    commentsRepository = app.get<CommentsRepository>(CommentsRepository);
    likeStatusCommentuseCase = app.get<LikeStatusCommentUseCase>(
      LikeStatusCommentUseCase,
    );
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(commentsRepository).toBeDefined();
    expect(likeStatusCommentuseCase).toBeDefined();
  });

  it("Should NOT create comment like entity, if comment not found", async () => {
    jest
      .spyOn(commentsRepository, "getCommentEntityById")
      .mockImplementation(async () => null);

    const result = await likeStatusCommentuseCase.execute({
      likeCommentDto: {
        commentId: "",
        commentLikeStatus: "Like",
        userId: "",
      },
    });

    expect(result).toEqual({
      isCommentFound: false,
      isLikeStatusUpdated: false,
      isLikeStatusCreated: false,
    });
  });

  it("Should CREATE comment like entity, if comment found and comment entity not found", async () => {
    jest
      .spyOn(commentsRepository, "getCommentEntityById")
      .mockImplementation(async () => ({}) as CommentDataView);

    jest
      .spyOn(commentsRepository, "getCommentLikeData")
      .mockImplementation(async () => null);

    jest
      .spyOn(commentsRepository, "createCommentLikeEntity")
      .mockImplementation(async () => "");

    const result = await likeStatusCommentuseCase.execute({
      likeCommentDto: {
        commentId: "",
        commentLikeStatus: "Like",
        userId: "",
      },
    });

    expect(result).toEqual({
      isCommentFound: true,
      isLikeStatusUpdated: false,
      isLikeStatusCreated: true,
    });
  });

  it("Should UPDATE comment like entity, if comment found and comment entity found", async () => {
    jest
      .spyOn(commentsRepository, "getCommentEntityById")
      .mockImplementation(async () => ({}) as CommentDataView);

    jest
      .spyOn(commentsRepository, "getCommentLikeData")
      .mockImplementation(async () => "123");

    jest
      .spyOn(commentsRepository, "updateCommentLikeEntity")
      .mockImplementation(async () => true);

    const result = await likeStatusCommentuseCase.execute({
      likeCommentDto: {
        commentId: "",
        commentLikeStatus: "Like",
        userId: "",
      },
    });

    expect(result).toEqual({
      isCommentFound: true,
      isLikeStatusUpdated: true,
      isLikeStatusCreated: false,
    });
  });
});
