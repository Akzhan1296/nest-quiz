import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
} from "@nestjs/common";
import { BlogsQueryRepository } from "../../../../infrstructura/blogs/blogs.query.repository";
import { BlogsQueryType } from "../../../sa/blogs/api/sa.blogs.models";
import { PaginationViewModel } from "../../../../../common/types";
import { PostViewModel } from "../../../../infrstructura/posts/posts.models";
import { PostsQueryRepository } from "../../../../infrstructura/posts/posts.query.repository";

@Controller("posts")
export class PublicPosts {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postQuerysRepository: PostsQueryRepository
  ) {}

  @Get("")
  @HttpCode(HttpStatus.OK)
  async getPosts(
    @Query() pageSize: BlogsQueryType
  ): Promise<PaginationViewModel<PostViewModel>> {

    console.log(pageSize)

    return await this.postQuerysRepository.getPosts(pageSize);
  }

  @Get(":postId")
  @HttpCode(HttpStatus.OK)
  async getPostById(@Param() params: { postId: string }) {
    const post = await this.postQuerysRepository.getPostByPostId(params.postId);
    if (!post) {
      throw new NotFoundException("post by id not found");
    }
    return post;
  }
}
