import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { PostViewModel } from "./posts.models";
import { PageSizeQueryModel, PaginationViewModel } from "../../../common/types";
import { transformFirstLetter } from "../../../utils/upperFirstLetter";
import { Paginated } from "../../../common/paginated";

export class PostsQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  private getMappedPostItems(result): PostViewModel[] {
    return result.map((r) => ({
      id: r.Id,
      title: r.Title,
      shortDescription: r.ShortDescription,
      content: r.Content,
      blogId: r.BlogId,
      blogName: r.BlogName,
      createdAt: r.CreatedAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
        newestLikes: [],
      },
    }));
  }

  async getPostByPostId(postId: string): Promise<PostViewModel | null> {
    const result = await this.dataSource.query(
      `	SELECT p.*, b."BlogName"
      FROM public."Posts" p
      LEFT JOIN public."Blogs" b
      on p."BlogId" = b."Id"
      WHERE p."Id" = $1`,
      [postId]
    );

    if (!result.length) return null;

    return {
      id: result[0].Id,
      title: result[0].Title,
      shortDescription: result[0].ShortDescription,
      content: result[0].Content,
      blogId: result[0].BlogId,
      blogName: result[0].BlogName,
      createdAt: result[0].CreatedAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
        newestLikes: [],
      },
    };
  }

  async getPostsByBlogId(
    pageParams: PageSizeQueryModel
  ): Promise<PaginationViewModel<PostViewModel>> {
    const { sortBy, sortDirection, skip, pageSize, blogId } = pageParams;
    const orderBy = transformFirstLetter(sortBy);

    let result = await this.dataSource.query(
      `	SELECT p.*, b."BlogName"
        FROM public."Posts" p
        LEFT JOIN public."Blogs" b
        ON p."BlogId" = b."Id"
        WHERE p."BlogId" = $3
        ORDER BY "${orderBy}" ${sortDirection}
        LIMIT $1 OFFSET $2
      `,
      [pageSize, skip, blogId]
    );

    let count = await this.dataSource.query(
      `
      SELECT count (*)
      FROM public."Posts"
      WHERE "BlogId" = $1
    `,
      [blogId]
    );

    return Paginated.transformPagination<PostViewModel>(
      {
        ...pageParams,
        totalCount: +count[0].count,
      },
      this.getMappedPostItems(result)
    );
  }

  async getPosts(
    pageParams: PageSizeQueryModel
  ): Promise<PaginationViewModel<PostViewModel>> {
    const { sortBy, sortDirection, skip, pageSize } = pageParams;
    const orderBy = transformFirstLetter(sortBy);

    let result = await this.dataSource.query(
      `	SELECT p.*, b."BlogName"
        FROM public."Posts" p
        LEFT JOIN public."Blogs" b
        on p."BlogId" = b."Id"
        ORDER BY "${orderBy}" ${sortDirection}
        LIMIT $1 OFFSET $2
      `,
      [pageSize, skip]
    );

    let count = await this.dataSource.query(
      `
      SELECT count (*)
      FROM public."Posts"
    `
    );

    return Paginated.transformPagination<PostViewModel>(
      {
        ...pageParams,
        totalCount: +count[0].count,
      },
      this.getMappedPostItems(result)
    );
  }
}
