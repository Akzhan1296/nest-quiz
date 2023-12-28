import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class UpdateBlogBySACommand {
  constructor(public updateBlogDTO) {}
}

@CommandHandler(UpdateBlogBySACommand)
export class UpdateBlogBySAUseCase
  implements ICommandHandler<UpdateBlogBySACommand>
{
  async execute() {}
}
