import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateBlogDTO, UpdateBlogResultDTO } from "../sa.blogs.dto";
import { BlogsRepository } from "../../../../../infrstructura/blogs/blogs.repository";

export class UpdateBlogBySACommand {
  constructor(public updateBlogDTO: UpdateBlogDTO) {}
}

@CommandHandler(UpdateBlogBySACommand)
export class UpdateBlogBySAUseCase
  implements ICommandHandler<UpdateBlogBySACommand>
{
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogBySACommand): Promise<UpdateBlogResultDTO> {
    const { blogId, description, name, websiteUrl } = command.updateBlogDTO;

    const result: UpdateBlogResultDTO = {
      isBlogFound: false,
      isBlogUpdated: null,
    };

    const blogData = await this.blogsRepository.findBlogById(blogId);
    if (!blogData) return result;
    result.isBlogFound = true;

    try {
      const isUpdated = await this.blogsRepository.updateBlogById({
        blogId,
        description,
        name,
        websiteUrl,
      });
      result.isBlogUpdated = isUpdated;
    } catch (err) {
      throw new Error(
        `Something went wrong during updating blog by id ${blogId} ${err}`
      );
    }

    return result;
  }
}
