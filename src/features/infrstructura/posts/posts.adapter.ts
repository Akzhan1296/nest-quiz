import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Post } from "../../entity/posts-entity";

@Injectable()
export class PostsRepo {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>
  ) {}

  async findPostById(postId: string): Promise<Post | null> {
    return this.postsRepository.findOneBy({ id: postId });
  }

  async savePost(post: Post): Promise<Post> {
    return this.postsRepository.save(post);
  }

  async deletePost(post: Post) {
    return this.postsRepository.delete(post);
  }
}
