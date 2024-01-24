import { MaxLength, MinLength } from "class-validator";

export class CreateCommentInputModel {
  @MinLength(20)
  @MaxLength(300)
  public content: string;
}
