import { Test, TestingModule } from "@nestjs/testing";
import { CommentsRepository } from "../../../../../infrstructura/comments/comments.repository";
import { AppModule } from "../../../../../../app.module";
import { v4 as uuidv4 } from "uuid";
import { CommentDataView } from "../../../../../infrstructura/comments/models/comments.models";
import { UpdateCommentUseCase } from "./update-comment-use-case";

describe("UpdateCommentUseCase", () => {
  let app: TestingModule;
  let commentsRepository: CommentsRepository;
  let updateCommentUseCase: UpdateCommentUseCase;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await app.init();

    commentsRepository = app.get<CommentsRepository>(CommentsRepository);
    updateCommentUseCase = app.get<UpdateCommentUseCase>(UpdateCommentUseCase);
  });

  it("Should be defined", () => {
    expect(app).toBeDefined();
    expect(commentsRepository).toBeDefined();
    expect(updateCommentUseCase).toBeDefined();
  });

  it("Should update comment", async () => {
    const userId = uuidv4();

    jest
      .spyOn(commentsRepository, "getCommentEntityById")
      .mockImplementation(async () => ({ userId }) as CommentDataView);

    jest
      .spyOn(commentsRepository, "updateCommentById")
      .mockImplementation(async () => true);

    const result = await updateCommentUseCase.execute({
      updateCommentDTO: {
        commentId: "",
        userId,
        content: "",
      },
    });

    expect(result).toEqual({
      isCommentFound: true,
      isCommentUpdated: true,
      isForbidden: false,
    });
  });
  it("Should return 403 error", async () => {
    jest
      .spyOn(commentsRepository, "getCommentEntityById")
      .mockImplementation(
        async () => ({ userId: uuidv4() }) as CommentDataView
      );

    const result = await updateCommentUseCase.execute({
      updateCommentDTO: {
        commentId: "",
        userId: uuidv4(),
        content: "",
      },
    });

    expect(result).toEqual({
      isCommentFound: true,
      isCommentUpdated: false,
      isForbidden: true,
    });
  });
  it("Should return 404 error", async () => {
    jest
      .spyOn(commentsRepository, "getCommentEntityById")
      .mockImplementation(async () => null);

    const result = await updateCommentUseCase.execute({
      updateCommentDTO: {
        commentId: "",
        userId: "",
        content: "",
      },
    });

    expect(result).toEqual({
      isCommentFound: false,
      isCommentUpdated: false,
      isForbidden: false,
    });
  });
});
