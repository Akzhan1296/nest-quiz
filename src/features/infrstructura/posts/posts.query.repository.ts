import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { PostViewModel } from "./posts.models";

export class PostsQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getPostById(getPostDTO: {
    blogId: string;
    postId: string;
  }): Promise<PostViewModel | null> {
    return null;
  }
}
