import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteBlogResultDTO } from "../sa.blogs.dto";
import { BlogsRepository } from "../../../../../infrstructura/blogs/blogs.repository";

export class DeleteBlogBySACommand {
  constructor(
    public deleteBlogDTO: {
      blogId: string;
    }
  ) {}
}

@CommandHandler(DeleteBlogBySACommand)
export class DeleteBlogBySAUseCase
  implements ICommandHandler<DeleteBlogBySACommand>
{
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: DeleteBlogBySACommand): Promise<DeleteBlogResultDTO> {
    const result: DeleteBlogResultDTO = {
      isBlogDeleted: false,
      isBlogFound: false,
    };

    const { blogId } = command.deleteBlogDTO;

    const blogData = await this.blogsRepository.findBlogById(blogId);
    if (!blogData) return result;

    result.isBlogFound = true;

    try {
      await this.blogsRepository.deleteBlogById(blogId);
      result.isBlogDeleted = true;
    } catch (err) {
      throw new Error(`Something went wrong with deleting blog${err}`);
    }

    return result;
  }
}
