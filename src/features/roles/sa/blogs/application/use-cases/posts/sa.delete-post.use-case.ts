import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeletePostDTO, ResultDeletePostDTO } from "../../sa.posts.dto";

export class DeletePostBySACommand {
  constructor(public deletePostDTO: DeletePostDTO) {}
}

@CommandHandler(DeletePostBySACommand)
export class DeletePostBySAUseCase
  implements ICommandHandler<DeletePostBySACommand>
{
  async execute(command: DeletePostBySACommand): Promise<ResultDeletePostDTO> {
    const result: ResultDeletePostDTO = {};

    return result;
  }
}
