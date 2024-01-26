import { IsIn } from "class-validator";

const likes = ["None", "Like", "Dislike"] as const;
export type Likes = (typeof likes)[number];

export class CommentLikeStatus {
  @IsIn(likes)
  likeStatus: Likes;
}
