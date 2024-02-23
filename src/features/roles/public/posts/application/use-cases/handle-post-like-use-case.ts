import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { HandlePostCommentDTO, HandlePostLikeResult } from "../posts.dto";
import { PostsRepository } from "../../../../../infrstructura/posts/posts.repository";

export class HandlePostLikesCommand {
  constructor(public likePostDto: HandlePostCommentDTO) {}
}

@CommandHandler(HandlePostLikesCommand)
export class LikeStatusPostUseCase
  implements ICommandHandler<HandlePostLikesCommand>
{
  constructor(private postsRepository: PostsRepository) {}

  async execute(command: HandlePostLikesCommand) {
    const { postId, userId, postLikeStatus, userLogin } = command.likePostDto;

    const result: HandlePostLikeResult = {
      isPostFound: false,
      isLikeStatusUpdated: false,
      isLikeStatusCreated: false,
    };

    // if no post return not found
    const postData = await this.postsRepository.findPostById(postId);
    if (!postData) {
      return result;
    }
    result.isPostFound = true;

    // check comment like entity, do we have it for current user ?
    const postLikeEntityId = await this.postsRepository.getPostLikeData({
      userId,
      postId,
    });

    // if we don't have for current user, any comment like entity, create it
    if (!postLikeEntityId) {
      try {
        await this.postsRepository.createPostLikeData({
          userId: userId,
          likeStatus: postLikeStatus,
          postId: postData.id,
          createdAt: new Date(),
          userLogin: userLogin,
        });

        result.isLikeStatusCreated = true;
      } catch (err) {
        throw new Error(`Something went product with post like handle ${err}`);
      }
    } else {
      try {
        // if we have for current user post like entity, just update like status
        const isUpdated = await this.postsRepository.updatePostLikeEntity({
          postLikeEntityId,
          postLikeStatus,
        });
        result.isLikeStatusUpdated = isUpdated;
      } catch (err) {
        throw new Error(`Something went product with like handle ${err}`);
      }
    }

    return result;
  }
}
