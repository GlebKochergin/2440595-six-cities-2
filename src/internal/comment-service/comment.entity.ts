import typegoose, {getModelForClass, Ref, defaultClasses} from '@typegoose/typegoose';
import {UserEntity} from '../user-service/user.entity.js';
import {OfferEntity} from '../offer-service/offer.entity.js';

const {prop, modelOptions} = typegoose;

export interface CommentEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'comments'
  }
})
export class CommentEntity extends defaultClasses.TimeStamps {
  @prop({
    type: () => String,
    required: true,
    minlength: [5, 'Min length for comment is 5'],
    maxlength: [1024, 'Max length for comment is 1024']
  })
  public text!: string;

  @prop({
    ref: OfferEntity,
    required: true
  })
  public offerId!: Ref<OfferEntity>;

  @prop({
    type: () => Date
  })
  public publicationDate!: Date;

  @prop({
    ref: UserEntity,
    required: true,
  })
  public userId!: Ref<UserEntity>;

  @prop({
    type: () => Number,
    required: true,
    min: [1, 'Min rating is 1'],
    max: [5, 'Max rating is 5']
  })
  public rating!: number;
}

export const CommentModel = getModelForClass(CommentEntity);
