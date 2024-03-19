import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
import { Comment } from "../../entity/comments-entity";

@Injectable()
export class CommentsRepo {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>
  ) {}

  async findCommentById(commentId: string): Promise<Comment | null> {
    return this.commentsRepository.findOneBy({ id: commentId });
  }

  async saveComment(comment: Comment): Promise<Comment> {
    return this.commentsRepository.save(comment);
  }

  async deleteComment(comment: Comment): Promise<DeleteResult> {
    return this.commentsRepository.delete(comment);
  }
}
