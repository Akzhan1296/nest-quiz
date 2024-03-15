import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { HandleCommentLikeResult, HandleLikeCommentDTO } from "../comments.dto";
import { CommentsRepository } from "../../../../../infrstructura/comments/comments.repository";

export class HandleCommentsLikesCommand {
  constructor(public likeCommentDto: HandleLikeCommentDTO) {}
}

@CommandHandler(HandleCommentsLikesCommand)
export class LikeStatusCommentUseCase
  implements ICommandHandler<HandleCommentsLikesCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute(command: HandleCommentsLikesCommand) {
    const { commentId, userId, commentLikeStatus } = command.likeCommentDto;

    const result: HandleCommentLikeResult = {
      isCommentFound: false,
      isLikeStatusUpdated: false,
      isLikeStatusCreated: false,
    };

    // if no comment return not found
    const commentData =
      await this.commentsRepository.getCommentEntityById(commentId);
    if (!commentData) {
      return result;
    }
    result.isCommentFound = true;

    // check comment like entity, do we have it for current user ?
    const commentLikeEntityId =
      await this.commentsRepository.getCommentLikeData({
        userId,
        commentId,
      });

    // if we don't have for current user, any comment like entity, create it
    if (!commentLikeEntityId) {
      try {
        await this.commentsRepository.createCommentLikeEntity({
          commentId: commentId,
          userId: userId,
          likeStatus: commentLikeStatus,
          postId: commentData.postId,
          createdAt: new Date(),
        });

        result.isLikeStatusCreated = true;
      } catch (err) {
        throw new Error(`Something went product with like handle ${err}`);
      }
    } else {
      try {
        // if we have for current user comment like entity, just update like status
        const isUpdated = await this.commentsRepository.updateCommentLikeEntity(
          {
            likeEntityId: commentLikeEntityId,
            likeStatus: commentLikeStatus,
          },
        );
        result.isLikeStatusUpdated = isUpdated;
      } catch (err) {
        throw new Error(`Something went product with like handle ${err}`);
      }
    }

    return result;
  }
}
