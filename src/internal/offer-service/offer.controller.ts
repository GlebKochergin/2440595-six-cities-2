import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import {AppComponent, HttpMethod, ParamsCity, ParamsOffer, ParamsOffersCount} from '../types.js';
import {Controller} from '../../cli-application/controller/controller.abstract.js';
import {LoggerInterface} from '../../cli-application/logger/logger.interface.js';
import {fillDTO} from '../helpers.js';
import {OfferRdo} from './offer.rdo.js';
import CreateOfferDto from './offer.dto.js';
import UpdateOfferDto from './update-offer.dto.js';
import {OfferServiceInterface} from './offer-service.interface.js';
import {UserServiceInterface} from '../user-service/user-service.interface.js';
import {CommentServiceInterface} from '../comment-service/comment-service.interface.js';
import {ValidateObjectIdMiddleware} from '../../cli-application/middleware/object-id.validate.middleware.js';
import {DtoValidateMiddleware} from '../../cli-application/middleware/dto.validate.middleware.js';
import {DocumentExistsMiddleware} from '../../cli-application/middleware/doc.exists.middleware.js';
import {CreateOfferRequest} from './create-offer-request.js';
import {FavoriteFullOfferDto} from './favorite-full-offer.rdo.js';
import {PrivateRouteMiddleware} from '../../cli-application/middleware/private.route.middleware.js';

@injectable()
export default class OfferController extends Controller {
  constructor(@inject(AppComponent.LoggerInterface) logger: LoggerInterface,
              @inject(AppComponent.OfferServiceInterface) private readonly offerService: OfferServiceInterface,
              @inject(AppComponent.UserServiceInterface) private readonly userService: UserServiceInterface,
              @inject(AppComponent.CommentServiceInterface) private readonly commentService: CommentServiceInterface,
  ) {
    super(logger);
    this.addRoute({
      path: '/',
      method: HttpMethod.Get,
      handler: this.index
    });

    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(),
        new DtoValidateMiddleware(CreateOfferDto)
      ]
    });

    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.show,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });

    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Patch,
      handler: this.update,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DtoValidateMiddleware(UpdateOfferDto),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });

    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId')
      ]
    });

    this.addRoute({
      path: '/premium/:city',
      method: HttpMethod.Get,
      handler: this.showPremium
    });

    this.addRoute({
      path: '/favorites/:offerId',
      method: HttpMethod.Post,
      handler: this.addFavorite,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });

    this.addRoute({
      path: '/favorites/:offerId',
      method: HttpMethod.Delete,
      handler: this.deleteFavorite,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });

    this.addRoute({
      path: '/favorites',
      method: HttpMethod.Get,
      handler: this.showFavorites,
      middlewares:[
        new PrivateRouteMiddleware()
      ]
    });
  }

  public async index({params}: Request<ParamsOffersCount>, res: Response): Promise<void> {
    const offerCount = params.count ? parseInt(`${params.count}`, 10) : undefined;
    const offers = await this.offerService.find(offerCount);
    this.ok(res, fillDTO(OfferRdo, offers));
  }

  public async create({body}: CreateOfferRequest, res: Response): Promise<void> {
    const result = await this.offerService.create(body);
    this.created(res, result);
  }

  public async show({params}: Request<ParamsOffer>, res: Response): Promise<void> {
    const offer = await this.offerService.findById(params.offerId);
    this.ok(res, fillDTO(OfferRdo, offer));
  }

  public async update({params, body}: Request<ParamsOffer, unknown, UpdateOfferDto>, res: Response): Promise<void> {
    const updatedOffer = await this.offerService.updateById(params.offerId, body);
    this.ok(res, updatedOffer);
  }

  public async delete({params}: Request<ParamsOffer>, res: Response): Promise<void> {
    await this.offerService.deleteById(params.offerId);
    await this.commentService.deleteByOfferId(params.offerId);
    this.noContent(res, `Предложение ${params.offerId} было удалено.`);
  }

  public async showPremium({params}: Request<ParamsCity>, res: Response): Promise<void> {
    const offers = await this.offerService.findPremiumByCity(params.city);
    this.ok(res, fillDTO(OfferRdo, offers));
  }

  public async showFavorites({ user }: Request, _res: Response): Promise<void> {
    const offers = await this.userService.findFavorites(user.id);
    this.ok(_res, fillDTO(FavoriteFullOfferDto, offers));
  }

  public async addFavorite({ params, user }: Request<ParamsOffer>, res: Response): Promise<void> {
    await this.userService.addToFavoritesById(params.offerId, user.id);
    this.noContent(res, {message: 'Offer was added to favorite'});
  }

  public async deleteFavorite({ params, user }: Request<ParamsOffer>, res: Response): Promise<void> {
    await this.userService.removeFromFavoritesById(params.offerId, user.id);
    this.noContent(res, {message: 'Offer was removed from favorite'});
  }
}
