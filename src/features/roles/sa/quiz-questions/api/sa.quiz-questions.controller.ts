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
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { PaginationViewModel, ValidId } from "../../../../../common/types";
import {
  CreateQuizQuestionInputModel,
  QuizQuestionsQueryType,
} from "./sa.quiz-questions.models";

@Controller("sa/quiz/questions")
export class SAQuizQuestionsController {
  constructor(
    private commandBus: CommandBus // private quizQuestionsQueryRepo: QuizQuestionsQueryRepo
  ) {}

  // get quiz questions
  @Get()
  @HttpCode(HttpStatus.OK)
  async getQuizQuestions(
    @Query() pageSize: QuizQuestionsQueryType
  ) // : Promise<PaginationViewModel<QuizQuestionViewModel>>
  {
    // return await this.quizQuestionsQueryRepo.getQuizQuestions(pageSize);
  }

  // create new quiz question
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createQuizQuestion(
    @Body() quizQuestionInputModel: CreateQuizQuestionInputModel // : Promise<QuizQuestionViewModel>
  ) {
    // const { createdQuizQuestionId } = await this.commandBus.execute<
    //   unknown,
    //   ResultCreateQuizQuestionDTO
    // >(
    //   new CreateQuizQuestionBySACommand({
    //     question: quizQuestionInputModel.question,
    //     answer: quizQuestionInputModel.answer,
    //     options: quizQuestionInputModel.options,
    //   })
    // );
    // return this.quizQuestionsQueryRepo.getQuizQuestionById(
    //   createdQuizQuestionId
    // );
  }

  // delete
  // quizQuestionId
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuizQuestion(@Param() params: ValidId): Promise<boolean> {
    return true
    // const result = await this.commandBus.execute<
    //   unknown,
    //   DeleteQuizQuestionResultDTO
    // >(new DeleteQuizQuestionBySACommand({ quizQuestionId: params.id }));
    // if (!result.isQuizQuestionFound) throw new NotFoundException();
    // if (result.isQuizQuestionDeleted) return true;
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
