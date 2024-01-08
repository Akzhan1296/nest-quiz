import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CreatePost, PostViewModel } from "./posts.models";

export class PostsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createPost(createPostDTO: CreatePost): Promise<string> {
    const { createdAt, blogId, content, shortDescription, title } =
      createPostDTO;

    const result = await this.dataSource.query(
      `INSERT INTO public."Posts"(
        "Title", "ShortDescription", "Content", "CreatedAt", "BlogId")
        VALUES ( $1, $2, $3, $4, $5)
        RETURNING "Id";
        `,
      [title, shortDescription, content, createdAt, blogId]
    );

    return result[0].Id;
  }
}
