import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class UpdateCommentCommand {}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor() {}

  async execute() {}
}
