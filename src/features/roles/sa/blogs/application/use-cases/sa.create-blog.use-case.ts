import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateBlogDTO, ResultCreateBlogDTO } from "../sa.blogs.dto";
import { BlogsRepository } from "../../../../../infrstructura/blogs/blogs.repository";

export class CreateBlogBySACommand {
  constructor(public createBlogDTO: CreateBlogDTO) {}
}

@CommandHandler(CreateBlogBySACommand)
export class CreateBlogBySAUseCase
  implements ICommandHandler<CreateBlogBySACommand>
{
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogBySACommand): Promise<ResultCreateBlogDTO> {
    const { description, websiteUrl, name } = command.createBlogDTO;

    const result: ResultCreateBlogDTO = {
      isBlogCreated: false,
      createdBlogId: null,
    };

    try {
      const blogId = await this.blogsRepository.createBlog({
        description,
        websiteUrl,
        name,
        createdAt: new Date(),
        isMembership: false,
      });
      result.createdBlogId = blogId;
      result.isBlogCreated = true;
    } catch (err) {
      throw new Error(err);
    }
    return result;
  }
}
