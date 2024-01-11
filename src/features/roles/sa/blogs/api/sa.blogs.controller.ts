import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import {
  BlogsQueryType,
  CreateBlogInputModelType,
  CreatePostInputType,
} from "./sa.blogs.models";
import {
  PageSizeQueryModel,
  PaginationViewModel,
} from "../../../../../common/types";
import { BlogViewModel } from "../../../../infrstructura/blogs/blogs.models";
import { BlogsQueryRepository } from "../../../../infrstructura/blogs/blogs.query.repository";
import { CommandBus } from "@nestjs/cqrs";
import { CreateBlogBySACommand } from "../application/use-cases/sa.create-blog.use-case";
import {
  DeleteBlogResultDTO,
  ResultCreateBlogDTO,
  UpdateBlogResultDTO,
} from "../application/sa.blogs.dto";
import { AuthBasicGuard } from "../../../../../guards/authBasic.guard";
import { UpdateBlogBySACommand } from "../application/use-cases/sa.update-blog.use-case";
import { DeleteBlogBySACommand } from "../application/use-cases/sa.delete-blog.use-case";
import { PostViewModel } from "../../../../infrstructura/posts/posts.models";
import {
  ResultCreatePostDTO,
  ResultDeletePostDTO,
  ResultUpdatePostDTO,
} from "../application/sa.posts.dto";
import { CreatePostBySACommand } from "../application/use-cases/posts/sa.create-post.use-case";
import { PostsQueryRepository } from "../../../../infrstructura/posts/posts.query.repository";
import { UpdatePostBySACommand } from "../application/use-cases/posts/sa.update-post.use-case";
import { DeletePostBySACommand } from "../application/use-cases/posts/sa.delete-post.use-case";

@UseGuards(AuthBasicGuard)
@Controller("sa/blogs")
export class SABlogsController {
  constructor(
    private commandBus: CommandBus,
    private blogsQueryRepository: BlogsQueryRepository,
    private postQuerysRepository: PostsQueryRepository
  ) {}

  // get blogs
  @Get()
  @HttpCode(HttpStatus.OK)
  async getBlogs(
    @Query() pageSize: BlogsQueryType
  ): Promise<PaginationViewModel<BlogViewModel>> {
    console.log(pageSize)
    return await this.blogsQueryRepository.getBlogs(pageSize);
  }

  // create new blog
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(
    @Body() blogInputModel: CreateBlogInputModelType
  ): Promise<BlogViewModel> {
    const { createdBlogId } = await this.commandBus.execute<
      unknown,
      ResultCreateBlogDTO
    >(
      new CreateBlogBySACommand({
        name: blogInputModel.name,
        description: blogInputModel.description,
        websiteUrl: blogInputModel.websiteUrl,
      })
    );

    const blogViewModel = this.blogsQueryRepository.getBlogById(createdBlogId);
    return blogViewModel;
  }

  // update blog
  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param() params: { id: string },
    @Body() blogInputModel: CreateBlogInputModelType
  ): Promise<boolean> {
    const result = await this.commandBus.execute<unknown, UpdateBlogResultDTO>(
      new UpdateBlogBySACommand({
        blogId: params.id,
        description: blogInputModel.description,
        name: blogInputModel.name,
        websiteUrl: blogInputModel.websiteUrl,
      })
    );

    if (!result.isBlogFound) throw new NotFoundException();
    if (result.isBlogUpdated) return true;
  }

  // delete
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param() params: { id: string }): Promise<boolean> {
    const result = await this.commandBus.execute<unknown, DeleteBlogResultDTO>(
      new DeleteBlogBySACommand({
        blogId: params.id,
      })
    );

    if (!result.isBlogFound) throw new NotFoundException();
    if (result.isBlogDeleted) return true;
    return true;
  }

  // POSTS
  // get blog posts
  @HttpCode(HttpStatus.OK)
  @Get(":blogId/posts")
  async getBlogPosts(
    @Query() pageSize: BlogsQueryType,
    @Param() params: { blogId: string }
  ): Promise<PaginationViewModel<PostViewModel>> {
    const blog = await this.blogsQueryRepository.getBlogById(params.blogId);
    if (!blog) {
      throw new NotFoundException("posts by blogid not found");
    }
    return await this.postQuerysRepository.getPostsByBlogId({
      ...pageSize,
      skip: pageSize.skip,
      blogId: params.blogId,
    } as PageSizeQueryModel);
  }

  //create post by blog id
  @Post(":blogId/posts")
  @HttpCode(HttpStatus.CREATED)
  async createPostByBlogId(
    @Param() params: { blogId: string },
    @Body() postInputModel: CreatePostInputType
  ): Promise<PostViewModel> {
    const result = await this.commandBus.execute<unknown, ResultCreatePostDTO>(
      new CreatePostBySACommand({
        blogId: params.blogId,
        title: postInputModel.title,
        shortDescription: postInputModel.shortDescription,
        content: postInputModel.content,
      })
    );

    if (!result.isBlogFound) throw new NotFoundException();

    if (result.isPostCreated) {
      const postViewModel = this.postQuerysRepository.getPostByPostId(result.createdPostId);
      return postViewModel;
    }
  }

  // update post by blog id
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(":blogId/posts/:postId")
  async updatePostByBlogId(
    @Param() params: { blogId: string; postId: string },
    @Body() postInputModel: CreatePostInputType
  ) {
    const result = await this.commandBus.execute<unknown, ResultUpdatePostDTO>(
      new UpdatePostBySACommand({
        blogId: params.blogId,
        postId: params.postId,
        title: postInputModel.title,
        shortDescription: postInputModel.shortDescription,
        content: postInputModel.content,
      })
    );

    if (!result.isBlogFound) throw new NotFoundException();
    if (!result.isPostFound) throw new NotFoundException();

    return result.isPostUpdated;
  }

  //delete post by blog id
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":blogId/posts/:postId")
  async deletePostByBlogId(
    @Param() params: { blogId: string; postId: string }
  ) {
    const result = await this.commandBus.execute<unknown, ResultDeletePostDTO>(
      new DeletePostBySACommand({
        blogId: params.blogId,
        postId: params.postId,
      })
    );
    if (!result.isBlogFound) throw new NotFoundException();
    if (!result.isPostFound) throw new NotFoundException();
    return result.isPostDeleted;
  }
}
