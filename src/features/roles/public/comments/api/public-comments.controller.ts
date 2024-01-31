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
  Delete,
  ForbiddenException,
} from "@nestjs/common";
import { CommentLikeStatus } from "./comments.input.models";
import { AuthGuard } from "../../../../../guards/auth.guard";
import { CommandBus } from "@nestjs/cqrs";
import { Request } from "express";
import { HandleCommentsLikesCommand } from "../application/use-cases/like-status-comment-use-case";
import { CommentViewModel } from "../../../../infrstructura/comments/models/comments.models";
import { CommentsQueryRepository } from "../../../../infrstructura/comments/comments.query.repository";
import { UserIdGuard } from "../../../../../guards/userId.guard";
import {
  DeleteCommentResult,
  HandleCommentLikeResult,
} from "../application/comments.dto";
import { DeleteCommentCommand } from "../application/use-cases/delete-comment-use-case";

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
    const result = await this.commentsQueryRepository.getCommentById(
      params.commentId,
      request.body.userId
    );
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  @Put(":commentId/like-status")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async handleCommentLikeStatus(
    @Req() request: Request,
    @Param() params: { commentId: string },
    @Body() commentLikeStatus: CommentLikeStatus
  ) {
    const result = await this.commandBus.execute<
      unknown,
      HandleCommentLikeResult
    >(
      new HandleCommentsLikesCommand({
        commentId: params.commentId,
        commentLikeStatus: commentLikeStatus.likeStatus,
        userId: request.body.userId,
      })
    );

    if (!result.isCommentFound) {
      throw new NotFoundException();
    }
  }

  @Delete(":commentId")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Req() request: Request,
    @Param() params: { commentId: string }
  ): Promise<boolean> {

    const result = await this.commandBus.execute<unknown, DeleteCommentResult>(
      new DeleteCommentCommand({
        userId: request.body.userId,
        commentId: params.commentId,
      })
    );
    if (result.isForbidden) {
      throw new ForbiddenException();
    }
    if (!result.isCommentFound) {
      throw new NotFoundException();
    }
    return result.isCommentDeleted;
  }
}
