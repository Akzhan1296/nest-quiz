import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Comment } from "../../entity/comments-entity";
import { CommentViewModel } from "./models/comments.models";
import { PageSizeQueryModel } from "../../../common/types";
import { Paginated } from "../../../common/paginated";

@Injectable()
export class CommentsQueryRepo {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>
  ) {}

  async getCommentsByPostId(
    postId: string,
    userId: string | null,
    pageParams: PageSizeQueryModel
  ) {
    const { sortBy, sortDirection, skip, pageSize } = pageParams;

    const result = await this.commentsRepository
      .createQueryBuilder("c")
      .select(["c.*"])
      .where("c.postId = :postId")
      .setParameter("postId", postId)
      .orderBy(
        `c.${sortBy}`,
        `${sortDirection.toUpperCase()}` as "ASC" | "DESC"
      )
      .skip(skip)
      .take(pageSize)
      .getRawMany();

    const count = await this.commentsRepository
      .createQueryBuilder("c")
      .select(["c.*"])
      .where("c.postId = :postId")
      .setParameter("postId", postId)
      .getCount();

    const mappedComments = result.map((comment) => ({
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
      },
    }));

    return Paginated.transformPagination(
      {
        ...pageParams,
        totalCount: count,
      },
      mappedComments
    );
  }

  async getCommentById(
    commentId: string,
    userId: string | null
  ): Promise<CommentViewModel> {
    const comment = await this.commentsRepository
      .createQueryBuilder("c")
      .select([
        "c.*",

        // (() => {
        //   const subQuery = commentLikesStatusRepository
        //     .createQueryBuilder("cls")
        //     .select("cls.LikeStatus")
        //     .where("cls.UserId = :userId")
        //     .andWhere("cls.CommentId = :commentId")
        //     .getSql();
        //   return `(${subQuery}) as UserStatus`;
        // })(),
        // (() => {
        //   const subQuery = commentLikesStatusRepository
        //     .createQueryBuilder("cls")
        //     .select("COUNT(*)")
        //     .where("cls.LikeStatus = 'Like'")
        //     .andWhere("cls.CommentId = :commentId")
        //     .getSql();
        //   return `(${subQuery}) as LikesCount`;
        // })(),
        // (() => {
        //   const subQuery = commentLikesStatusRepository
        //     .createQueryBuilder("cls")
        //     .select("COUNT(*)")
        //     .where("cls.LikeStatus = 'Dislike'")
        //     .andWhere("cls.CommentId = :commentId")
        //     .getSql();
        //   return `(${subQuery}) as DislikesCount`;
        // })(),
      ])
      .where("c.id = :commentId")
      .setParameter("commentId", commentId)
      .setParameter("userId", userId)
      .getRawOne();

    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
      },
    };
  }
}
