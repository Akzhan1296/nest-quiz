import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
} from "@nestjs/common";
import { BlogsQueryRepository } from "../../../../../infrstructura/blogs/blogs.query.repository";
import { BlogsQueryType } from "../../../../sa/blogs/api/sa.blogs.models";
import {
  PageSizeQueryModel,
  PaginationViewModel,
} from "../../../../../../common/types";
import { PostViewModel } from "../../../../../infrstructura/posts/posts.models";
import { PostsQueryRepository } from "../../../../../infrstructura/posts/posts.query.repository";

@Controller("blogs")
export class PublicBlogs {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postQuerysRepository: PostsQueryRepository
  ) {}

  @Get("")
  @HttpCode(HttpStatus.OK)
  async getBlogs(@Query() pageSize: BlogsQueryType) {
    return await this.blogsQueryRepository.getBlogs(pageSize);
  }

  @Get(":blogId/posts")
  @HttpCode(HttpStatus.OK)
  async getBlogPostsgetBlogById(
    @Query() pageSize: BlogsQueryType,
    @Param() params: { blogId: string }
  ): Promise<PaginationViewModel<PostViewModel>> {
    const blog = await this.blogsQueryRepository.getBlogById(params.blogId);
    if (!blog) {
      throw new NotFoundException("posts by blogid not found");
    }
    return await this.postQuerysRepository.getPosts({
      ...pageSize,
      skip: pageSize.skip,
      blogId: params.blogId,
    } as PageSizeQueryModel);
  }

  @Get(":blogId")
  @HttpCode(HttpStatus.OK)
  async getBlogById(@Param() params: { blogId: string }) {
    const blog = await this.blogsQueryRepository.getBlogById(params.blogId);
    if (!blog) {
      throw new NotFoundException("posts by blogid not found");
    }
    return blog;
  }
}
