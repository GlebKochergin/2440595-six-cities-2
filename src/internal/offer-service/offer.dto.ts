import { City, Housing, Facility, Coordinates } from '../types.js';
import {
  ArrayMinSize,
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean, IsDateString,
  IsEnum,
  IsObject,
  Max,
  MaxLength,
  Min,
  MinLength
} from 'class-validator';
import {IMAGES_COUNT, MAX_PREVIEW_IMAGE_LENGTH} from '../helpers.js';

export default class CreateOfferDto {
  @MinLength(10, {message: 'Min length for name is 10'})
  @MaxLength(100, {message: 'Max length for name is 100'})
  public name!: string;

  @MinLength(20, {message: 'Min length for description is 20'})
  @MaxLength(1024, {message: 'Max length for description is 1024'})
  public description!: string;

  @IsDateString({}, { message: 'postDate must be a valid ISO string' })
  public publicationDate!: Date;

  @IsEnum(City, {message: 'type must be one of the city'})
  public city!: City;

  @MaxLength(MAX_PREVIEW_IMAGE_LENGTH, { message: 'Maximum preview length is 256' })
  public previewImage!: string;

  @IsArray({ message: 'pictures must be an array' })
  @ArrayMinSize(IMAGES_COUNT, { message: 'Should be 6 images' })
  @ArrayMaxSize(IMAGES_COUNT, { message: 'Should be 6 images' })
  public images!: string[];

  @IsBoolean({message: 'field premium must be boolean'})
  public premium!: boolean;

  @Min(1, {message: 'rating must be an integer from 1 to 5'})
  @Max(5, {message: 'rating must be an integer from 1 to 5'})
  public rating!: number;

  @IsEnum(Housing, {message: 'type must be one of the housing types'})
  public housingType!: Housing;

  @Min(1, {message: 'Min count of rooms is 1'})
  @Max(8, {message: 'Max count of rooms is 8'})
  public roomCount!: number;

  @Min(1, {message: 'Min count of guests is 1'})
  @Max(10, {message: 'Max count of guests is 10'})
  public guestCount!: number;

  @Min(100, {message: 'Min cost is 100'})
  @Max(100000, {message: 'Max cost is 100000'})
  public cost!: number;

  @IsArray({message: 'field facilities must be an array'})
  @IsEnum(Facility, {each: true, message: 'type must be one of the facilities'})
  @ArrayNotEmpty({message: 'There should be at least 1 facility'})
  public facilities!: Facility[];

  public userId!: string;

  @IsObject({message: 'There should be object CoordinatesType'})
  public coordinates!: Coordinates;
}
