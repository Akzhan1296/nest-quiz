import {
  Body,
  Controller,
  Put,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CommentLikeStatus } from "./comments.input.models";
import { AuthGuard } from "../../../../../guards/auth.guard";
import { CommandBus } from "@nestjs/cqrs";
import { Request } from "express";
import { HandleCommentsLikesCommand } from "../application/use-cases/like-status-comment-use-case";
import { CommentViewModel } from "../../../../infrstructura/comments/models/comments.models";
import { CommentsQueryRepository } from "../../../../infrstructura/comments/comments.query.repository";
import { UserIdGuard } from "../../../../../guards/userId.guard";

@Controller("comments")
export class PublicComments {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly commentsQueryRepository: CommentsQueryRepository
  ) {}

  @UseGuards(UserIdGuard)
  @Get(":commentId")
  async getCommentById(
    @Req() request: Request,
    @Param() params: { commentId: string }
  ): Promise<CommentViewModel> {
    return this.commentsQueryRepository.getCommentById(
      params.commentId,
      request.body.userId
    );
  }

  @Put(":commentId/like-status")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async handleCommentLikeStatus(
    @Req() request: Request,
    @Param() params: { commentId: string },
    @Body() commentLikeStatus: CommentLikeStatus
  ) {
    return this.commandBus.execute(
      new HandleCommentsLikesCommand({
        commentId: params.commentId,
        commentLikeStatus: commentLikeStatus.likeStatus,
        userId: request.body.userId,
      })
    );
  }

  @Get(":commentId")
  async getCommentLikeStatus() {}
}
