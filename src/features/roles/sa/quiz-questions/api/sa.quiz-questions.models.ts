import { MaxLength, MinLength } from "class-validator";
import { PageSizeDTO } from "../../../../../common/types";

export class CreateQuizQuestionInputModel {
  @MinLength(10)
  @MaxLength(500)
  body: string;
}

export class QuizQuestionsQueryType extends PageSizeDTO {
  // // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  // searchNameTerm = "";
  // sortBy = "createdAt";
  // sortDirection = "desc";
}

// export type CreateQuizQuestionInputModelType = {};
