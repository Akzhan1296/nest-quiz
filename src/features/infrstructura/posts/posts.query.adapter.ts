import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Post } from "../../entity/posts-entity";
import { PostViewModel } from "./posts.models";

@Injectable()
export class PostsQueryRepo {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>
  ) {}

  async getPostByPostId(postId: string): Promise<PostViewModel | null> {
    const resultView: null | PostViewModel = null;

    const builder = await this.postsRepository
      .createQueryBuilder()
      .where({ id: postId })
      .getOne();

    // const { name, createdAt, description, id, isMembership, websiteUrl } =
    //   builder;

    // if (builder) {
    //   resultView = {
    //     name,
    //     id,
    //     websiteUrl,
    //     createdAt,
    //     description,
    //     isMembership,
    //   };
    // }

    return resultView;
  }
}
