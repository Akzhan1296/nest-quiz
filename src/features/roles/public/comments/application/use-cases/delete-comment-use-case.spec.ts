import { Test, TestingModule } from "@nestjs/testing";
import { CommentsRepository } from "../../../../../infrstructura/comments/comments.repository";
import { AppModule } from "../../../../../../app.module";
import { DeleteCommentUseCase } from "./delete-comment-use-case";
import { v4 as uuidv4 } from "uuid";
import { CommentDataView } from "../../../../../infrstructura/comments/models/comments.models";

describe("DeleteCommentUseCase", () => {
  let app: TestingModule;
  let commentsRepository: CommentsRepository;
  let deleteCommentUseCase: DeleteCommentUseCase;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    commentsRepository = app.get<CommentsRepository>(CommentsRepository);
    deleteCommentUseCase = app.get<DeleteCommentUseCase>(DeleteCommentUseCase);
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(commentsRepository).toBeDefined();
    expect(deleteCommentUseCase).toBeDefined();
  });

  it("Should delete comment", async () => {
    const userId = uuidv4();

    jest
      .spyOn(commentsRepository, "getCommentEntityById")
      .mockImplementation(async () => ({ userId }) as CommentDataView);

    jest
      .spyOn(commentsRepository, "deleteCommentById")
      .mockImplementation(async () => true);

    jest
      .spyOn(commentsRepository, "isAnyCommentLikesData")
      .mockImplementation(async () => false);

    const result = await deleteCommentUseCase.execute({
      deleteCommentDTO: {
        commentId: "",
        userId,
      },
    });

    expect(result).toEqual({
      isCommentFound: true,
      isCommentDeleted: true,
      isForbidden: false,
    });
  });
  it("Should return 403 error", async () => {
    jest
      .spyOn(commentsRepository, "getCommentEntityById")
      .mockImplementation(
        async () => ({ userId: uuidv4() }) as CommentDataView
      );

    const result = await deleteCommentUseCase.execute({
      deleteCommentDTO: {
        commentId: "",
        userId: uuidv4(),
      },
    });

    expect(result).toEqual({
      isCommentFound: true,
      isCommentDeleted: false,
      isForbidden: true,
    });
  });
  it("Should return 404 error", async () => {
    jest
      .spyOn(commentsRepository, "getCommentEntityById")
      .mockImplementation(async () => null);

    const result = await deleteCommentUseCase.execute({
      deleteCommentDTO: {
        commentId: "",
        userId: "",
      },
    });

    expect(result).toEqual({
      isCommentFound: false,
      isCommentDeleted: false,
      isForbidden: false,
    });
  });
});
