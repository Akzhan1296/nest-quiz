import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { PaginationViewModel, ValidId } from "../../../../../common/types";
import { CreateQuizQuestionInputModel } from "./sa.quiz-questions.models";
import { CrateQuizQuestionBySACommand } from "../application/use-cases/sa.create-question.use-case";
import {
  DeleteQuestionResultDTO,
  ResultCreateQuizQuestionDTO,
} from "../application/quiz.dto";
import { QuizQuestionQueryRepo } from "../../../../infrastructura/quiz/quiz.query.adapter";
import { AuthBasicGuard } from "../../../../../guards/authBasic.guard";
import { DeleteQuizQuestionBySACommand } from "../application/use-cases/sa.delete-question.use-case";
// import { DeleteQuizQuestionBySACommand } from "../application/use-cases/sa.delete-question.use-case";

@UseGuards(AuthBasicGuard)
@Controller("sa/quiz/questions")
export class SAQuizQuestionsController {
  constructor(
    private commandBus: CommandBus,
    private quizQuestionsQueryRepo: QuizQuestionQueryRepo
  ) {}

  // get quiz questions
  // @Get()
  // @HttpCode(HttpStatus.OK)
  // async getQuizQuestions(
  //   @Query() pageSize: QuizQuestionsQueryType
  // ) // : Promise<PaginationViewModel<QuizQuestionViewModel>>
  // {
  //   // return await this.quizQuestionsQueryRepo.getQuizQuestions(pageSize);
  // }

  // create new quiz question
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createQuizQuestion(
    @Body() quizQuestionInputModel: CreateQuizQuestionInputModel // : Promise<QuizQuestionViewModel>
  ) {
    const { createdQuizQuestionId } = await this.commandBus.execute<
      unknown,
      ResultCreateQuizQuestionDTO
    >(
      new CrateQuizQuestionBySACommand({
        body: quizQuestionInputModel.body,
        correctAnswers: quizQuestionInputModel.correctAnswers,
      })
    );
    return this.quizQuestionsQueryRepo.findQuizQuestionById(
      createdQuizQuestionId
    );
  }

  // delete
  // quizQuestionId
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuizQuestion(@Param() params: ValidId): Promise<boolean> {
    const result = await this.commandBus.execute<
      unknown,
      DeleteQuestionResultDTO
    >(new DeleteQuizQuestionBySACommand({ questionId: params.id }));

    if (!result.isQuestionFound) throw new NotFoundException();
    if (result.isQuestionFound) return true;
  }

  // update quiz question
  // quizQuestionId
  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuizQuestion(
    @Param() params: ValidId,
    @Body() quizQuestionInputModel: CreateQuizQuestionInputModel
  ): Promise<boolean> {
    return true;
    // const result = await this.commandBus.execute<
    //   unknown,
    //   UpdateQuizQuestionResultDTO
    // >(
    //   new UpdateQuizQuestionBySACommand({
    //     quizQuestionId: params.id,
    //     question: quizQuestionInputModel.question,
    //     answer: quizQuestionInputModel.answer,
    //     options: quizQuestionInputModel.options,
    //   })
    // );
    // if (!result.isQuizQuestionFound) throw new NotFoundException();
    // if (result.isQuizQuestionUpdated) return true;
  }
}
