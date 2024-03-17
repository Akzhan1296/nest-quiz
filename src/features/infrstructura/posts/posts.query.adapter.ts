import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Post } from "../../entity/posts-entity";
import { PostViewModel } from "./posts.models";
import { PageSizeQueryModel, PaginationViewModel } from "../../../common/types";
import { Paginated } from "../../../common/paginated";

@Injectable()
export class PostsQueryRepo {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>
  ) {}

  private getMappedPostItems(result): PostViewModel[] {
    return result.map((r) => ({
      id: r.id,
      title: r.title,
      shortDescription: r.shortDescription,
      content: r.content,
      blogId: r.blogId,
      blogName: r.blog.name,
      createdAt: r.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
        newestLikes: [],
      },
    }));
  }

  async getPostByPostId(
    postId: string,
    userId: string | null
  ): Promise<PostViewModel | null> {
    // for future tasks
    console.log(userId);

    let resultView: null | PostViewModel = null;

    const builder = await this.postsRepository
      .createQueryBuilder("p")
      .select()
      .leftJoinAndSelect("p.blog", "b", `"p"."blogId" = "b"."id"`)
      .where({ id: postId })
      .getOne();

    if (builder) {
      const { title, createdAt, shortDescription, id, content, blogId, blog } =
        builder;
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
          myStatus: "None",
          newestLikes: [],
        },
      };
    }

    return resultView;
  }

  async getPostsByBlogId(
    pageParams: PageSizeQueryModel,
    userId: string | null
  ): Promise<PaginationViewModel<PostViewModel>> {
    //for future task
    console.log(userId);

    const { sortBy, sortDirection, skip, pageSize, blogId } = pageParams;

    const builder = await this.postsRepository
      .createQueryBuilder("p")
      .select()
      .leftJoinAndSelect("p.blog", "b", `"p"."blogId" = "b"."id"`)
      .where({ blogId })
      .orderBy(
        `p.${sortBy}`,
        `${sortDirection.toUpperCase()}` as "ASC" | "DESC"
      )
      .skip(skip)
      .take(pageSize)
      .getMany();

    const count = await this.postsRepository
      .createQueryBuilder("p")
      .select()
      .leftJoinAndSelect("p.blog", "b", `"p"."blogId" = "b"."id"`)
      .where({ blogId })
      .orderBy(
        `p.${sortBy}`,
        `${sortDirection.toUpperCase()}` as "ASC" | "DESC"
      )
      .skip(skip)
      .take(pageSize)
      .getCount();

    return Paginated.transformPagination<PostViewModel>(
      {
        ...pageParams,
        totalCount: +count,
      },
      this.getMappedPostItems(builder)
    );
  }

  async getPosts(
    pageParams: PageSizeQueryModel,
    userId: string | null
  ): Promise<PaginationViewModel<PostViewModel>> {
    // for future tasks
    console.log(userId);

    const { sortBy, sortDirection, skip, pageSize } = pageParams;

    const fieldEntityMapping = {
      id: "p",
      title: "p",
      shortDescription: "p",
      content: "p",
      createdAt: "p",
      blogId: "p",
      blogName: "b",
      websiteUrl: "b",
      description: "b",
      isMembership: "b",
    };

    const sortByField = sortBy === "blogName" ? "name" : sortBy;

    const builder = await this.postsRepository
      .createQueryBuilder("p")
      .select(["p.*", "b.name"])
      .leftJoin("p.blog", "b", `"p"."blogId" = "b"."id"`)
      .orderBy(
        `${fieldEntityMapping[sortBy]}.${sortByField}`,
        `${sortDirection.toUpperCase()}` as "ASC" | "DESC"
      )
      .skip(skip)
      .take(pageSize)
      .getRawMany();

    const mappedPosts = builder.map((r) => ({
      id: r.id,
      title: r.title,
      shortDescription: r.shortDescription,
      content: r.content,
      blogId: r.blogId,
      blogName: r.b_name,
      createdAt: r.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
        newestLikes: [],
      },
    }));

    const count = await this.postsRepository
      .createQueryBuilder("p")
      .select(["p.*", "b.name"])
      .leftJoin("p.blog", "b", `"p"."blogId" = "b"."id"`)
      .orderBy(
        `${fieldEntityMapping[sortBy]}.${sortByField}`,
        `${sortDirection.toUpperCase()}` as "ASC" | "DESC"
      )
      .skip(skip)
      .take(pageSize)
      .getCount();

    return Paginated.transformPagination<PostViewModel>(
      {
        ...pageParams,
        totalCount: +count,
      },
      mappedPosts
    );
  }
}
