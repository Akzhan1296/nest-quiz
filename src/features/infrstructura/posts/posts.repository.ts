import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CreatePost, PostViewModel } from "./posts.models";

export class PostsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createPost(createPostDTO: CreatePost): Promise<PostViewModel | null> {
    return null;
  }
}
