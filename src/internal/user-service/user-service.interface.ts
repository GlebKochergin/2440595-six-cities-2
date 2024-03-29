import {DocumentType} from '@typegoose/typegoose';
import UserDto from './user.dto.js';
import {UserEntity} from './user.entity.js';
import {OfferEntity} from '../offer-service/offer.entity.js';
import LoginUserDto from './login-user.dto.js';
import UpdateUserDto from './update.user.dto.js';

export interface UserServiceInterface {
  create(dto: UserDto, salt: string): Promise<DocumentType<UserEntity>>;
  findByEmail(email: string): Promise<DocumentType<UserEntity> | null>;
  findOrCreate(dto: UserDto, salt: string): Promise<DocumentType<UserEntity>>;
  findById(userId: string): Promise<DocumentType<UserEntity> | null>;
  updateById(userId: string, dto: UpdateUserDto): Promise<DocumentType<UserEntity> | null>;
  verifyUser(dto: LoginUserDto, salt: string): Promise<DocumentType<UserEntity> | null>;
  findFavorites(userId: string): Promise<DocumentType<OfferEntity>[]>
  addToFavoritesById(userId: string, offerId: string): Promise<void>;
  removeFromFavoritesById(userId: string, offerId: string): Promise<void>;
}
