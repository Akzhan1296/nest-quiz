import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class LikeStatusCommentCommand {}

@CommandHandler(LikeStatusCommentCommand)
export class LikeStatusCommentUseCase
  implements ICommandHandler<LikeStatusCommentCommand>
{
  constructor() {}

  async execute() {}
}
