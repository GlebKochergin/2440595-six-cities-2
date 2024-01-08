import typegoose, {defaultClasses, getModelForClass, Ref, Severity} from '@typegoose/typegoose';
import {City, Facility, Housing, Coordinates} from '../types.js';
import {UserEntity} from '../user-service/user.entity.js';
import mongoose from 'mongoose';
import {
  IMAGES_COUNT,
  MAX_COST, MAX_COUNT_ROOM,
  MAX_DESCRIPTION_LENGTH, MAX_GUEST_COUNT, MAX_NAME_LENGTH,
  MAX_RATING,
  MIN_COST, MIN_COUNT_ROOM,
  MIN_DESCRIPTION_LENGTH, MIN_GUEST_COUNT, MIN_NAME_LENGTH,
  MIN_RATING
} from '../helpers.js';

const {prop, modelOptions} = typegoose;

export interface OfferEntity extends defaultClasses.Base {
}

@modelOptions({
  schemaOptions: {
    collection: 'offers'
  }
})
export class OfferEntity extends defaultClasses.TimeStamps {

  @prop({
    type: () => String,
    required: true,
    enum: City
  })
  public city!: City;

  @prop({
    type: () => Number,
    default: 0
  })
  public commentsCount!: number;

  @prop({
    type: () => Number,
    required: true,
    min: [MIN_COST, 'Min cost is 100'],
    max: [MAX_COST, 'Max cost is 100000']
  })
  public cost!: number;

  @prop({
    type: () => String,
    required: true,
    trim: true,
    minlength: [MIN_DESCRIPTION_LENGTH, 'Min length for description is 20'],
    maxlength: [MAX_DESCRIPTION_LENGTH, 'Max length for description is 1024']
  })
  public description!: string;

  @prop({
    type: () => [String],
    required: true,
    enum: Facility
  })
  public facilities!: Facility[];

  @prop({
    type: () => Number,
    required: true,
    min: [MIN_GUEST_COUNT, 'Min count of guests is 1'],
    max: [MAX_GUEST_COUNT, 'Max count of guests is 10']
  })
  public guestCount!: number;

  @prop({
    type: () => String,
    required: true,
    enum: Housing
  })
  public housingType!: Housing;

  @prop({
    type: () => [String],
    minCount: [IMAGES_COUNT, 'Images should be 6'],
    maxCount: [IMAGES_COUNT, 'Images should be 6']
  })
  public images!: string[];

  @prop({
    type: () => String,
    required: true,
    trim: true,
    minlength: [MIN_NAME_LENGTH, 'Min length for name is 10'],
    maxlength: [MAX_NAME_LENGTH, 'Max length for name is 15']
  })
  public name!: string;

  @prop({
    ref: UserEntity,
    required: true
  })
  public userId!: Ref<UserEntity>;

  @prop({
    type: () => Boolean,
    required: true,
    default: false
  })
  public premium!: boolean;

  @prop({
    type: () => String,
    default: ''
  })
  public previewImage!: string;

  @prop({
    type: () => Date
  })
  public publicationDate!: Date;

  @prop({
    type: () => Number,
    default: 1,
    min: [MIN_RATING, 'Min rating is 1'],
    max: [MAX_RATING, 'Max rating is 5']
  })
  public rating!: number;

  @prop({
    type: () => Number,
    required: true,
    min: [MIN_COUNT_ROOM, 'Min room count is 1'],
    max: [MAX_COUNT_ROOM, 'Max room count is 8']
  })
  public roomCount!: number;

  @prop({
    type: () => mongoose.Schema.Types.Mixed,
    required: true,
    allowMixed: Severity.ALLOW
  })
  public coordinates!: Coordinates;
}

export const OfferModel = getModelForClass(OfferEntity);
