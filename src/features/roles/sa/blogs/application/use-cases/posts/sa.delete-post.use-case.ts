import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeletePostDTO, ResultDeletePostDTO } from "../../sa.posts.dto";
import { BlogsRepository } from "../../../../../../infrstructura/blogs/blogs.repository";
import { PostsRepository } from "../../../../../../infrstructura/posts/posts.repository";

export class DeletePostBySACommand {
  constructor(public deletePostDTO: DeletePostDTO) {}
}

@CommandHandler(DeletePostBySACommand)
export class DeletePostBySAUseCase
  implements ICommandHandler<DeletePostBySACommand>
{
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository
  ) {}

  async execute(command: DeletePostBySACommand): Promise<ResultDeletePostDTO> {
    const { blogId, postId } = command.deletePostDTO;

    const result: ResultDeletePostDTO = {
      isBlogFound: false,
      isPostFound: false,
      isPostDeleted: false,
    };

    const blogData = await this.blogsRepository.findBlogById(blogId);
    if (!blogData) return result;
    result.isBlogFound = true;

    const postData = await this.postsRepository.findPostById(postId);
    if (!postData) return result;
    result.isPostFound = true;

    try {
      const isPostDeleted = await this.postsRepository.deletePostById(postId);
      result.isPostDeleted = isPostDeleted;
    } catch (err) {
      throw new Error(`Something went wrong with deleting post ${err}`);
    }

    return result;
  }
}
