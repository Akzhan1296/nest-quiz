import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  CreateQuizQuestionDTO,
  ResultCreateQuizQuestionDTO,
} from "../quiz.dto";

export class CrateQuizQuestionBySACommand {
  constructor(public createQuizQuestionDTO: CreateQuizQuestionDTO) {}
}

@CommandHandler(CrateQuizQuestionBySACommand)
export class CreateQuizQuestionBySAUseCase
  implements ICommandHandler<CrateQuizQuestionBySACommand>
{
  constructor(private readonly quizQuestionsRepo: QuizQuestionsRepo) {}

  async execute(
    command: CrateQuizQuestionBySACommand
  ): Promise<ResultCreateQuizQuestionDTO> {
    const { question, correctAnswers } = command.createQuizQuestionDTO;

    const result: ResultCreateQuizQuestionDTO = {
      isQuizQuestionCreated: false,
      createdQuizQuestionId: null,
    };

    try {
      const newQuizQuestion = new QuizQuestion();
      newQuizQuestion.question = question;
      newQuizQuestion.correctAnswers = correctAnswers;
      newQuizQuestion.createdAt = new Date();

      const savedQuizQuestion =
        await this.quizQuestionsRepo.saveQuizQuestion(newQuizQuestion);

      result.createdQuizQuestionId = savedQuizQuestion.id;
      result.isQuizQuestionCreated = true;
    } catch (err) {
      throw new Error(err);
    }
    return result;
  }
}
