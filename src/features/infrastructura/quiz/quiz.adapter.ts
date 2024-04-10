import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { QuizQuestion } from "../../entity/quiz-questions-entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class QuizQuestionRepo {
  constructor(
    @InjectRepository(QuizQuestion)
    private quizQuestionRepository: Repository<QuizQuestion>
  ) {}
  async findQuizQuestionById(quizQuestionId: string) {
    return this.quizQuestionRepository.findOneBy({
      id: quizQuestionId,
    });
  }
  async saveQuizQuestion(quizQuestion: QuizQuestion) {
    return this.quizQuestionRepository.save(quizQuestion);
  }
  async deleteQuizQuestion(quizQuestion: QuizQuestion) {
    return this.quizQuestionRepository.delete({ id: quizQuestion.id });
  }
}
