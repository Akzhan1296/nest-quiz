import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ResultUpdatePostDTO, UpdatePostDTO } from "../../sa.posts.dto";
import { BlogsRepository } from "../../../../../../infrstructura/blogs/blogs.repository";
import { PostsRepository } from "../../../../../../infrstructura/posts/posts.repository";

export class UpdatePostBySACommand {
  constructor(public updatePostDTO: UpdatePostDTO) {}
}

@CommandHandler(UpdatePostBySACommand)
export class UpdatePostBySAUseCase
  implements ICommandHandler<UpdatePostBySACommand>
{
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository
  ) {}

  async execute(command: UpdatePostBySACommand): Promise<ResultUpdatePostDTO> {
    const { blogId, postId, content, shortDescription, title } =
      command.updatePostDTO;

    const result: ResultUpdatePostDTO = {
      isBlogFound: false,
      isPostFound: false,
      isPostUpdated: false,
    };

    const blogData = await this.blogsRepository.findBlogById(blogId);
    if (!blogData) return result;
    result.isBlogFound = true;

    const postData = await this.postsRepository.findPostById(postId);
    if (!postData) return result;
    result.isPostFound = true;

    try {
      const isPostUpdated = await this.postsRepository.updatePostById({
        postId,
        content,
        shortDescription,
        title,
      });
      result.isPostUpdated = isPostUpdated;
    } catch (err) {
      throw new Error(`Something went wrong with updating post ${err}`);
    }

    return result;
  }
}
