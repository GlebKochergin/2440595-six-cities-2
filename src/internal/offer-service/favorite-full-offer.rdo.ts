import { Expose } from 'class-transformer';
import { City, Housing } from '../types.js';

export class FavoriteFullOfferDto {
  @Expose()
  public id!: string;

  @Expose()
    name!: string;

  @Expose({
    name: 'createdAt'
  })
    publicationDate!: Date;

  @Expose()
    description!: string;

  @Expose()
    city!: City;

  @Expose()
    previewImage!: string;

  @Expose()
    premium!: boolean;

  favorite = true;

  @Expose()
    rating!: number;

  @Expose()
    housingType!: Housing;

  @Expose()
    cost!: number;

  @Expose()
    commentsCount!: number;
}
