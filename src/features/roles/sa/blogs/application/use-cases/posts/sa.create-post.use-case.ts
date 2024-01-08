import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreatePostDTO, ResultCreatePostDTO } from "../../sa.posts.dto";
import { PostsRepository } from "../../../../../../infrstructura/posts/posts.repository";
import { BlogsRepository } from "../../../../../../infrstructura/blogs/blogs.repository";

export class CreatePostBySACommand {
  constructor(public createPostDTO: CreatePostDTO) {}
}

@CommandHandler(CreatePostBySACommand)
export class CreatePostBySAUseCase
  implements ICommandHandler<CreatePostBySACommand>
{
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository
  ) {}
  async execute(command: CreatePostBySACommand): Promise<ResultCreatePostDTO> {
    const { blogId, content, shortDescription, title } = command.createPostDTO;

    const result: ResultCreatePostDTO = {
      isBlogFound: false,
      isPostCreated: false,
      createdPostId: null,
    };

    const blogData = await this.blogsRepository.findBlogById(blogId);

    if (!blogData) return result;
    result.isBlogFound = true;

    try {
      const postId = await this.postsRepository.createPost({
        title,
        shortDescription,
        content,
        blogId: blogData.id,
        createdAt: new Date(),
      });

      result.createdPostId = postId;
      result.isPostCreated = true;
    } catch (err) {
      throw new Error(`Something went wrong with creating posts ${err}`);
    }

    return result;
  }
}
