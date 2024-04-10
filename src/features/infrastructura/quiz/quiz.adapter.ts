import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { QuizQuestion } from "../../entity/quiz-questions-entity";
export class QuizQuestionRepo {
  constructor(
    @InjectRepository(QuizQuestion)
    private quizQuestionRepository: Repository<QuizQuestion>
  ) {}
  async findQuizQuestionById(quizQuestionId: string) {
    return this.quizQuestionRepository.findOne({
      where: { id: quizQuestionId },
    });
  }
  async saveQuizQuestion(quizQuestion) {
    return this.quizQuestionRepository.save(quizQuestion);
  }
  async deleteQuizQuestion(quizQuestion) {
    return this.quizQuestionRepository.delete(quizQuestion);
  }
}
