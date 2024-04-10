import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import {
  CreateQuizQuestionDTO,
  ResultCreateQuizQuestionDTO,
} from "../quiz.dto";
import { QuizQuestionRepo } from "../../../../../infrastructura/quiz/quiz.adapter";
import { QuizQuestion } from "../../../../../entity/quiz-questions-entity";

export class CrateQuizQuestionBySACommand {
  constructor(public createQuizQuestionDTO: CreateQuizQuestionDTO) {}
}

@CommandHandler(CrateQuizQuestionBySACommand)
export class CreateQuizQuestionBySAUseCase
  implements ICommandHandler<CrateQuizQuestionBySACommand>
{
  constructor(private readonly quizQuestionsRepo: QuizQuestionRepo) {}

  async execute(
    command: CrateQuizQuestionBySACommand
  ): Promise<ResultCreateQuizQuestionDTO> {
    const { body, correctAnswers } = command.createQuizQuestionDTO;

    const result: ResultCreateQuizQuestionDTO = {
      isQuizQuestionCreated: false,
      createdQuizQuestionId: null,
    };

    try {
      const newQuizQuestion = new QuizQuestion();
      newQuizQuestion.body = body;
      newQuizQuestion.correctAnswers = correctAnswers;
      newQuizQuestion.createdAt = new Date();
      newQuizQuestion.updatedAt = null;
      
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
