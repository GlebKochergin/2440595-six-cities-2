import {DocumentType} from '@typegoose/typegoose';
import {OfferEntity} from './offer.entity.js';
import CreateOfferDto from './offer.dto.js';
import UpdateOfferDto from './update-offer.dto.js';
import {DocumentExistsInterface} from '../types.js';

export interface OfferServiceInterface extends DocumentExistsInterface{
  create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>>;
  findById(offerId: string): Promise<DocumentType<OfferEntity> | null>;
  find(count: number| undefined): Promise<DocumentType<OfferEntity>[]>;
  deleteById(offerId: string): Promise<DocumentType<OfferEntity> | null>;
  updateById(offerId: string, dto: UpdateOfferDto): Promise<DocumentType<OfferEntity> | null>;
  findPremiumByCity(city: string): Promise<DocumentType<OfferEntity>[]>;
  incComment(offerId: string): Promise<DocumentType<OfferEntity> | null>;
  exists(documentId: string): Promise<boolean>;
  updateRating(offerId: string, rating: number): Promise<void>;
  addImage(offerId: string, image?: string): Promise<void>;
  removeImage(offerId: string, image?: string): Promise<void>;
}
