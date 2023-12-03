import {UserEntity} from './user.entity.js';
import {DocumentType} from '@typegoose/typegoose/lib/types.js';
import UserDto from './user.dto.js';
import {inject, injectable} from 'inversify';
import { AppComponent } from '../types.js';
import {LoggerInterface} from '../../cli-application/logger/logger.interface.js';
import {types} from '@typegoose/typegoose';
import {UserServiceInterface} from './user-service.interface.js';
import {OfferEntity} from '../offer-service/offer.entity.js';

@injectable()
export default class UserService implements UserServiceInterface {

  constructor(
    @inject(AppComponent.LoggerInterface) private readonly logger: LoggerInterface,
    @inject(AppComponent.UserModel) private readonly userModel: types.ModelType<UserEntity>
  ) {
  }

  public async create(dto: UserDto, salt: string): Promise<DocumentType<UserEntity>> {
    const user = new UserEntity(dto);
    user.setPassword(dto.password, salt);

    const result = await this.userModel.create(dto);
    this.logger.info(`Новый пользователь создан: ${user.email}`);

    return result;
  }

  public async findFavorites(userId: string): Promise<DocumentType<OfferEntity>[]> {
    const offers = await this.userModel.findById(userId).select('favorite');
    if (!offers) {
      return [];
    }

    return this.userModel
      .find({_id: { $in: offers.favorite }});
  }

  public async findByEmail(email: string): Promise<DocumentType<UserEntity> | null> {
    return this.userModel.findOne({email});
  }

  public async findOrCreate(dto: UserDto, salt: string): Promise<DocumentType<UserEntity>> {
    const existedUser = await this.findByEmail(dto.email);

    if (existedUser) {
      return existedUser;
    }

    return this.create(dto, salt);
  }

  public async findById(userId: string): Promise<DocumentType<UserEntity> | null> {
    return this.userModel.findOne({'_id': userId});
  }

  public async addToFavoritesById(userId: string, offerId: string): Promise<DocumentType<OfferEntity>[] | null> {
    return this.userModel.findByIdAndUpdate(userId, {$push: {favorite: offerId}, new: true});
  }

  public async removeFromFavoritesById(userId: string, offerId: string): Promise<DocumentType<OfferEntity>[] | null> {
    return this.userModel.findByIdAndUpdate(userId, {$pull: {favorite: offerId}, new: true});
  }
}
