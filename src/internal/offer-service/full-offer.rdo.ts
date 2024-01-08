import { Expose } from 'class-transformer';
import { City, Housing } from '../types.js';

export class FullOfferRdo {
  @Expose()
  public id!: string;

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
}
