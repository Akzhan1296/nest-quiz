import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CreateCommentType } from "./models/comments.models";

export class CommentsQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getCommentById(commentId: string, userId: string | null) {
    const result = await this.dataSource.query(
      `    
      SELECT "Id", "Content", "UserId", "UserLogin", "CreatedAt", "PostId",
      (SELECT "LikeStatus" FROM public."CommentLikesStatuses" 
       WHERE public."CommentLikesStatuses"."UserId" = $2) as "UserStatus",
       (SELECT count(*) FROM public."CommentLikesStatuses" 
       WHERE public."CommentLikesStatuses"."LikeStatus" = 'Like') as "LikesCount",
       (SELECT count(*) FROM public."CommentLikesStatuses" 
       WHERE public."CommentLikesStatuses"."LikeStatus" = 'Dislike') as "DislikesCount"
      FROM public."Comments" as c
      WHERE "Id" = $1`,
      [commentId, userId]
    );

    return {
      id: result[0].Id,
      content: result[0].Content,
      commentatorInfo: {
        userId: result[0].UserId,
        userLogin: result[0].UserLogin,
      },
      createdAt: result[0].CreatedAt,
      likesInfo: {
        likesCount: result[0].LikesCount,
        dislikesCount: result[0].DislikesCount,
        myStatus: result[0].UserStatus ? result[0].UserStatus : "None",
      },
    };
  }
}
