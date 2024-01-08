import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ResultUpdatePostDTO, UpdatePostDTO } from "../../sa.posts.dto";

export class UpdatePostBySACommand {
  constructor(public updatePostDTO: UpdatePostDTO) {}
}

@CommandHandler(UpdatePostBySACommand)
export class UpdatePostBySAUseCase
  implements ICommandHandler<UpdatePostBySACommand>
{
  async execute(command: UpdatePostBySACommand): Promise<ResultUpdatePostDTO> {
    const result: ResultUpdatePostDTO = {};

    return result;
  }
}
