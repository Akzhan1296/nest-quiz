import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class DeleteBlogBySACommand {
  constructor(public deleteBlogDTO) {}
}

@CommandHandler(DeleteBlogBySACommand)
export class DeleteBlogBySAUseCase implements ICommandHandler<DeleteBlogBySACommand> {
  async execute() {}
}
