import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { QuizQuestionRepo } from "../../../../../infrastructura/quiz/quiz.adapter";
import { DeleteQuestionResultDTO, DeleteQuizQuestionDTO } from "../quiz.dto";

export class DeleteQuizQuestionBySACommand {
  constructor(public deleteQuizQuestionDTO: DeleteQuizQuestionDTO) {}
}

@CommandHandler(DeleteQuizQuestionBySACommand)
export class DeleteQuizQuestionUseCase
  implements ICommandHandler<DeleteQuizQuestionBySACommand>
{
  constructor(private quizQuestionRepo: QuizQuestionRepo) {}

  async execute(command: DeleteQuizQuestionBySACommand) {
    const result: DeleteQuestionResultDTO = {
      isQuestionDeleted: false,
      isQuestionFound: false,
    };

    const quizQuestion = await this.quizQuestionRepo.findQuizQuestionById(
      command.deleteQuizQuestionDTO.questionId
    );
    if (!quizQuestion) {
      return result;
    }

    try {
      await this.quizQuestionRepo.deleteQuizQuestion(quizQuestion);

      result.isQuestionFound = true;
      result.isQuestionDeleted = true;
    } catch (err) {
      throw new Error(err);
    }
    return result;
  }
}
