import { InjectRepository } from "@nestjs/typeorm";
import { Blog } from "../../entity/blogs-entity";
import { Repository } from "typeorm";
import { BlogViewModel } from "./blogs.models";
import { Paginated } from "../../../common/paginated";
import { transformFirstLetter } from "../../../utils/upperFirstLetter";
import { PageSizeQueryModel, PaginationViewModel } from "../../../common/types";

export class BlogsQueryRepo {
  constructor(
    @InjectRepository(Blog)
    private blogsRepository: Repository<Blog>
  ) {}

  async getBlogById(blogId: string): Promise<BlogViewModel | null> {
    const builder = await this.blogsRepository
      .createQueryBuilder("b")
      .where({ id: blogId })
      .getOne();

    const { blogName, createdAt, description, id, isMembership, websiteUrl } =
      builder;

    return builder
      ? {
          name: blogName,
          id,
          websiteUrl,
          createdAt,
          description,
          isMembership,
        }
      : null;
  }

  // async getBlogs(
  //   pageParams: PageSizeQueryModel
  // ): Promise<PaginationViewModel<BlogViewModel>> {
  //   const { sortBy, sortDirection, skip, pageSize, searchNameTerm } =
  //     pageParams;

  //   const orderBy =
  //     sortBy === "name"
  //       ? transformFirstLetter("blogName")
  //       : transformFirstLetter(sortBy);

  //   const result = await this.dataSource.query(
  //     `
  //       SELECT "Id", "BlogName", "WebsiteUrl", "Description", "IsMembership", "CreatedAt"
  //       FROM public."Blogs"
  //       WHERE "BlogName"  ILIKE $1
  //       ORDER BY "${orderBy}" ${sortDirection}
  //       LIMIT $2 OFFSET $3
  //     `,
  //     [`%${searchNameTerm}%`, pageSize, skip]
  //   );

  //   const count = await this.dataSource.query(
  //     `
  //     SELECT count (*)
  //     FROM public."Blogs"
  //     WHERE "BlogName"  ILIKE $1
  //   `,
  //     [`%${searchNameTerm}%`]
  //   );

  //   const mappedResult: BlogViewModel[] = result.map((r) => ({
  //     name: r.BlogName,
  //     id: r.Id,
  //     websiteUrl: r.WebsiteUrl,
  //     createdAt: r.CreatedAt,
  //     description: r.Description,
  //     isMembership: r.IsMembership,
  //   }));

  //   return Paginated.transformPagination<BlogViewModel>(
  //     {
  //       ...pageParams,
  //       totalCount: +count[0].count,
  //     },
  //     mappedResult
  //   );
}
