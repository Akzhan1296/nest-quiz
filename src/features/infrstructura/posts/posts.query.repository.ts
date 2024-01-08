import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { PostViewModel } from "./posts.models";

export class PostsQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getPostById(getPostDTO: {
    blogId: string;
    postId: string;
  }): Promise<PostViewModel | null> {
    const { blogId, postId } = getPostDTO;
    const result = await this.dataSource.query(
      `	SELECT p.*, b."Name"
      FROM public."Posts" p
      LEFT JOIN public."Blogs" b
      on p."BlogId" = $1
      WHERE p."Id" = $2`,
      [blogId, postId]
    );

    if (!result.length) return null;

    return {
      id: result[0].Id,
      title: result[0].Title,
      shortDescription: result[0].ShortDescription,
      content: result[0].Content,
      blogId: result[0].BlogId,
      blogName: result[0].Name,
      createdAt: result[0].CreatedAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
        newestLikes: [],
      },
    };
  }
}
