import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CreatePostDTO, OnlyPostDataView, UpdatePostDTO } from "./posts.models";

export class PostsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findPostById(postId: string): Promise<OnlyPostDataView | null> {
    let result = await this.dataSource.query(
      `
      SELECT *
	  FROM public."Posts"
	  WHERE "Id" = $1`,
      [postId]
    );

    if (result.length === 0) return null;

    return {
      id: result[0].Id,
      title: result[0].Title,
      shortDescription: result[0].ShortDescription,
      content: result[0].Content,
      createdAt: result[0].CreatedAt,
    };
  }

  async createPost(createPostDTO: CreatePostDTO): Promise<string> {
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

  async updatePostById(updatePostDTO: UpdatePostDTO): Promise<boolean> {
    const { content, postId, shortDescription, title } = updatePostDTO;

    let result = await this.dataSource.query(
      `UPDATE public."Posts"
        SET "Content"= $2, "ShortDescription" = $3, "Title" = $4
        WHERE "Id" = $1`,
      [postId, content, shortDescription, title]
    );
    // result = [[], 1 | 0]
    return !!result[1];
  }

  async deletePostById(postId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      ` 
	      DELETE FROM public."Posts"
	      WHERE "Id" = $1
        `,
      [postId]
    );

    return !!result[1];
  }
}
