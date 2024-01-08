import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreatePostDTO, ResultCreatePostDTO } from "../../sa.posts.dto";

export class CreatePostBySACommand {
  constructor(public createPostDTO: CreatePostDTO) {}
}

@CommandHandler(CreatePostBySACommand)
export class CreatePostBySAUseCase
  implements ICommandHandler<CreatePostBySACommand>
{
  async execute(command: CreatePostBySACommand): Promise<ResultCreatePostDTO> {
    const result: ResultCreatePostDTO = {
      isBlogFound: false,
      isPostCreated: false,
      createdPostId: null,
    };

    return result;
  }
}
