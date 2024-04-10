import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { QuizQuestion } from "../../entity/quiz-questions-entity";
export class QuizQuestionQueryRepo {
  constructor(
    @InjectRepository(QuizQuestion)
    private quizQuestionRepository: Repository<QuizQuestion>
  ) {}
  async findQuizQuestionById(quizQuestionId: string) {
    return this.quizQuestionRepository.findOne({
      where: { id: quizQuestionId },
    });
  }
  // async findQuizQuestionByAnswer(quizQuestionAnswer) {
  //   return this.quizQuestionRepository.findOne({ answer: quizQuestionAnswer });
  // }
  // async findQuizQuestionByBody(quizQuestionBody) {
  //   return this.quizQuestionRepository.findOne({ body: quizQuestionBody });
  // }
  // async findQuizQuestionByCorrectAnswers(quizQuestionCorrectAnswers) {
  //   return this.quizQuestionRepository.findOne({
  //     correctAnswers: quizQuestionCorrectAnswers,
  //   });
  // }
  // async findQuizQuestionByPublished(quizQuestionPublished) {
  //   return this.quizQuestionRepository.findOne({
  //     published: quizQuestionPublished,
  //   });
  // }
  // async findQuizQuestionByCreatedAt(quizQuestionCreatedAt) {
  //   return this.quizQuestionRepository.findOne({
  //     createdAt: quizQuestionCreatedAt,
  //   });
  // }
  // async findQuizQuestionByUpdatedAt(quizQuestionUpdatedAt) {
  //   return this.quizQuestionRepository.findOne({
  //     updatedAt: quizQuestionUpdatedAt,
  //   });
  // }
}
