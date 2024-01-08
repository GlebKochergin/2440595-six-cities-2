import { Expose, Type } from 'class-transformer';
import {City, Coordinates, Facility, Housing, User} from '../types.js';
import UserRdo from '../../internal/user-service/user.rdo.js';

export class OfferRdo {
  @Expose()
  public id!: string;

  @Expose()
    description!: string;

  @Expose()
    name!: string;

  @Expose({
    name: 'createdAt'
  })
    publicationDate!: Date;

  @Expose()
    city!: City;

  @Expose()
    previewImage!: string;

  @Expose()
    images!: string[];

  @Expose()
    premium!: boolean;

  @Expose()
    favorite!: boolean;

  @Expose()
    rating!: number;

  @Expose()
    housingType!: Housing;

  @Expose()
    cost!: number;

  @Expose()
    commentsCount!: number;

  @Expose()
    roomCount!: number;

  @Expose()
    guestCount!: number;

  @Expose()
    facilities!: Facility[];

  @Expose({name: 'userId'})
  @Type(() => UserRdo)
    offerAuthor!: User;

  @Expose()
    coordinates!: Coordinates;
}
