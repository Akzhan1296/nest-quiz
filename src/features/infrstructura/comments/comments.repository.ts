import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CreateCommentType } from "./models/comments.models";

export class CommentsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createCommentForPost(
    createCommentDTO: CreateCommentType
  ): Promise<string> {
    const { createdAt, content, postId, userId, userLogin } = createCommentDTO;

    const result = await this.dataSource.query(
      `INSERT INTO public."Comments"(
        "Content", "UserId", "UserLogin", "CreatedAt",  "PostId")
          VALUES ($1, $2, $3, $4, $5)
        RETURNING "Id"`,
      [content, userId, userLogin, createdAt, postId]
    );

    return result[0].Id;
  }

  async getCommentById() {}
}
