import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteCommentDTO, DeleteCommentResult } from "../comments.dto";
import { CommentsRepository } from "../../../../../infrstructura/comments/comments.repository";

export class DeleteCommentCommand {
  constructor(public deleteCommentDTO: DeleteCommentDTO) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute(command: DeleteCommentCommand) {
    const { commentId, userId } = command.deleteCommentDTO;

    const result: DeleteCommentResult = {
      isCommentFound: false,
      isCommentDeleted: false,
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

    const isAnyCommentLikesData = 
      await this.commentsRepository.isAnyCommentLikesData(commentId);

    if (isAnyCommentLikesData) {
      try {
        await this.commentsRepository.deleteCommentLikeEntities(commentId);
      } catch (err) {
        throw new Error(
          `Something went wrong with deleting comments likes entity ${err}`
        );
      }
    }

    try {
      const isCommentDeleted =
        await this.commentsRepository.deleteCommentById(commentId);

      result.isCommentDeleted = isCommentDeleted;
    } catch (err) {
      throw new Error(
        `Something went wrong with deleting comment entity ${err}`
      );
    }

    return result;
  }
}
