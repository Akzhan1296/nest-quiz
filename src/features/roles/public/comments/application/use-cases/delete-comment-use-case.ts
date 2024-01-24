import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class DeleteCommentCommand {}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor() {}

  async execute() {}
}
