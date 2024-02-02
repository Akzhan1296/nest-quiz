import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { BlogsQueryRepository } from "../../../../infrstructura/blogs/blogs.query.repository";
import { BlogsQueryType } from "../../../sa/blogs/api/sa.blogs.models";
import {
  PageSizeQueryModel,
  PaginationViewModel,
} from "../../../../../common/types";
import { PostViewModel } from "../../../../infrstructura/posts/posts.models";
import { PostsQueryRepository } from "../../../../infrstructura/posts/posts.query.repository";
import { UserIdGuard } from "../../../../../guards/userId.guard";
import { Request } from "express";

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
  @UseGuards(UserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getBlogPostsgetBlogById(
    @Req() request: Request,
    @Query() pageSize: BlogsQueryType,
    @Param() params: { blogId: string }
  ): Promise<PaginationViewModel<PostViewModel>> {
    const blog = await this.blogsQueryRepository.getBlogById(params.blogId);
    if (!blog) {
      throw new NotFoundException("posts by blogid not found");
    }
    return await this.postQuerysRepository.getPostsByBlogId(
      {
        ...pageSize,
        skip: pageSize.skip,
        blogId: params.blogId,
      } as PageSizeQueryModel,
      request.body.userId
    );
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
