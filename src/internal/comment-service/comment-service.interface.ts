import {DocumentType} from '@typegoose/typegoose/lib/types.js';
import CreateCommentDto from './create-comment.dto.js';
import {CommentEntity} from './comment.entity.js';

export interface CommentServiceInterface {
  createForOffer(dto: CreateCommentDto): Promise<DocumentType<CommentEntity>>;
  findById(commentId: string): Promise<DocumentType<CommentEntity> | null>
  findByOfferId(offerId: string): Promise<DocumentType<CommentEntity>[]>
  deleteByOfferId(offerId: string): Promise<number | null>;
}
