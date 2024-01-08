import {Container} from 'inversify';
import {types} from '@typegoose/typegoose';
import OfferService from './offer.service.js';
import {OfferEntity, OfferModel} from './offer.entity.js';
import {OfferServiceInterface} from './offer-service.interface.js';
import { AppComponent } from '../types.js';
import {Controller} from '../../controller/controller.abstract.js';
import OfferController from '../offer-service/offer.controller.js';

export function createOfferContainer() {
  const offerContainer = new Container();

  offerContainer.bind<OfferServiceInterface>(AppComponent.OfferServiceInterface).to(OfferService);
  offerContainer.bind<types.ModelType<OfferEntity>>(AppComponent.OfferModel).toConstantValue(OfferModel);
  offerContainer.bind<Controller>(AppComponent.OfferController).to(OfferController).inSingletonScope();

  return offerContainer;
}
