import { IsIn, MaxLength, MinLength } from "class-validator";

const likes = ["None", "Like", "Dislike"] as const;
export type Likes = (typeof likes)[number];

export class CommentLikeStatus {
  @IsIn(likes)
  likeStatus: Likes;
}

export class CommentInputModelType {
  @MaxLength(100)
  @MinLength(20)
  content: string;
}
