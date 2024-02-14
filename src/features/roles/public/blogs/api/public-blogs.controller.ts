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
  ValidId,
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

  // blogId
  @Get(":id/posts")
  @UseGuards(UserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getBlogPostsgetBlogById(
    @Req() request: Request,
    @Query() pageSize: BlogsQueryType,
    @Param() params: ValidId
  ): Promise<PaginationViewModel<PostViewModel>> {
    const blog = await this.blogsQueryRepository.getBlogById(params.id);
    if (!blog) {
      throw new NotFoundException("posts by blogId not found");
    }
    return await this.postQuerysRepository.getPostsByBlogId(
      {
        ...pageSize,
        skip: pageSize.skip,
        blogId: params.id,
      } as PageSizeQueryModel,
      request.body.userId
    );
  }

  // blogId
  @Get(":id")
  @HttpCode(HttpStatus.OK)
  async getBlogById(@Param() params: ValidId) {
    const blog = await this.blogsQueryRepository.getBlogById(params.id);
    if (!blog) {
      throw new NotFoundException("posts by blogId not found");
    }
    return blog;
  }
}
