import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateCommentDTO, UpdateCommentResult } from "../comments.dto";
import { CommentsRepository } from "../../../../../infrstructura/comments/comments.repository";

export class UpdateCommentCommand {
  constructor(public updateCommentDTO: UpdateCommentDTO) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand) {
    const { commentId, userId, content } = command.updateCommentDTO;

    const result: UpdateCommentResult = {
      isCommentFound: false,
      isCommentUpdated: false,
      isForbidden: false,
    };

    const commentData =
      await this.commentsRepository.getCommentEntityById(commentId);
    if (!commentData) return result;
    result.isCommentFound = true;

    if (commentData.userId !== userId) {
      result.isForbidden = true;
      return result;
    }

    try {
      const isUpdated = await this.commentsRepository.updateCommentById({
        commentId,
        content,
      });
      result.isCommentUpdated = isUpdated;
    } catch (err) {
      throw new Error(`Something went wrong with updating comment ${err}`);
    }

    return result;
  }
}
