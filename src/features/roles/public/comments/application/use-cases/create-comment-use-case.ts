import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateCommentDTO, CreateCommentResult } from "../comments.dto";
import { PostsRepository } from "../../../../../infrstructura/posts/posts.repository";
import { CommentsRepository } from "../../../../../infrstructura/comments/comments.repository";

export class CreateCommentCommand {
  constructor(public createCommentDTO: CreateCommentDTO) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    private postsRepository: PostsRepository,
    private commentsRepository: CommentsRepository
  ) {}

  async execute(command: CreateCommentCommand): Promise<CreateCommentResult> {
    const result: CreateCommentResult = {
      isPostFound: false,
      isCommentCreated: false,
      commentId: null,
    };

    const { userLogin, userId, content, postId } = command.createCommentDTO;

    const postData = this.postsRepository.findPostById(postId);
    if (!postData) return result;
    result.isPostFound = true;

    try {
      let commentId = await this.commentsRepository.createCommentForPost({
        createdAt: new Date(),
        userLogin,
        userId,
        content,
        postId,
      });

      result.isCommentCreated = true;
      result.commentId = commentId;
    } catch (err) {
      throw new Error("Something went wrong on comment creating");
    }

    return result;
  }
}
