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
    let resultView: null | PostViewModel = null;

    const builder = await this.postsRepository
      .createQueryBuilder("p")
      .select()
      .leftJoinAndSelect("p.blog", "b", `"p"."blogId" = "b"."id"`)
      .where({ id: postId })
      .getOne();

    const { title, createdAt, shortDescription, id, content, blogId, blog } = builder;

    if (builder) {
      resultView = {
        id,
        title,
        shortDescription,
        content,
        blogId,
        blogName: blog.name,
        createdAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: "none",
          newestLikes: [],
        },
      };
    }

    return resultView;
  }
}
