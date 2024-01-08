import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import {AppComponent, HttpMethod, ParamsCity, ParamsOffer, ParamsOffersCount} from '../types.js';
import {Controller} from '../../controller/controller.abstract.js';
import {LoggerInterface} from '../../logger/logger.interface.js';
import {fillDTO} from '../helpers.js';
import {OfferRdo} from './offer.rdo.js';
import CreateOfferDto from './offer.dto.js';
import UpdateOfferDto from './update-offer.dto.js';
import {OfferServiceInterface} from './offer-service.interface.js';
import {UserServiceInterface} from '../user-service/user-service.interface.js';
import {CommentServiceInterface} from '../comment-service/comment-service.interface.js';
import {ValidateObjectIdMiddleware} from '../../middleware/object-id.validate.middleware.js';
import {DtoValidateMiddleware} from '../../middleware/dto.validate.middleware.js';
import {DocumentExistsMiddleware} from '../../middleware/doc.exists.middleware.js';
import {FavoriteFullOfferDto} from './favorite-full-offer.rdo.js';
import {PrivateRouteMiddleware} from '../../middleware/private.route.middleware.js';
import {ConfigInterface} from '../../config/config.interface.js';
import {ConfigSchema} from '../../config/config.schema.js';
import {UploadMiddleware} from '../../middleware/upload.middleware.js';
import UploadImageResponse from './upload.image.response.js';
import {RequestBody, RequestParams} from '../../http/http.requests.js';
import {HttpError} from '../../http/http.error.js';
import {StatusCodes} from 'http-status-codes';
import {FullOfferRdo} from './full-offer.rdo.js';

@injectable()
export default class OfferController extends Controller {
  constructor(@inject(AppComponent.LoggerInterface) logger: LoggerInterface,
              @inject(AppComponent.OfferServiceInterface) private readonly offerService: OfferServiceInterface,
              @inject(AppComponent.UserServiceInterface) private readonly userService: UserServiceInterface,
              @inject(AppComponent.CommentServiceInterface) private readonly commentService: CommentServiceInterface,
              @inject(AppComponent.ConfigInterface) configService: ConfigInterface<ConfigSchema>
  ) {
    super(logger, configService);
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
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
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
      path: '/users/favorites',
      method: HttpMethod.Get,
      handler: this.showFavorites,
      middlewares:[
        new PrivateRouteMiddleware()
      ]
    });
    this.addRoute({
      path: '/:offerId/preview-image',
      method: HttpMethod.Post,
      handler: this.uploadPreviewImage,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new UploadMiddleware(this.configService.get('UPLOAD_DIRECTORY'), 'previewImage'),
      ]
    });
    this.addRoute({
      path: '/:offerId/image',
      method: HttpMethod.Post,
      handler: this.uploadImage,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new UploadMiddleware(this.configService.get('UPLOAD_DIRECTORY'), 'image'),
      ]
    });
    this.addRoute({
      path: '/:offerId/image',
      method: HttpMethod.Delete,
      handler: this.removeImage,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new UploadMiddleware(this.configService.get('UPLOAD_DIRECTORY'), 'image'),
      ]
    });
  }

  public async index({params}: Request<ParamsOffersCount>, res: Response): Promise<void> {
    const offerCount = params.count ? parseInt(`${params.count}`, 10) : undefined;
    const offers = await this.offerService.find(offerCount);
    this.ok(res, fillDTO(FullOfferRdo, offers));
  }

  public async create({ body, user }: Request<RequestParams, RequestBody, CreateOfferDto>, res: Response): Promise<void> {
    const result = await this.offerService.create({ ...body, userId: user.id });
    const offer = await this.offerService.findById(result.id);
    this.created(res, fillDTO(OfferRdo, offer));
  }

  public async show({params}: Request<ParamsOffer>, res: Response): Promise<void> {
    const offer = await this.offerService.findById(params.offerId);
    this.ok(res, fillDTO(OfferRdo, offer));
  }

  public async update({params, body, user}: Request<ParamsOffer, unknown, UpdateOfferDto>, res: Response): Promise<void> {
    const offer = await this.offerService.findById(params.offerId);
    if (offer?.userId?.id !== user.id) {
      throw new HttpError(StatusCodes.BAD_REQUEST,
        'Offer was created other user',
        'UpdateOffer');
    }
    const updatedOffer = await this.offerService.updateById(params.offerId, body);
    this.ok(res, fillDTO(OfferRdo, updatedOffer));
  }

  public async uploadPreviewImage(req: Request<ParamsOffer>, res: Response) {
    const offer = await this.offerService.findById(req.params.offerId);
    if (offer?.userId?.id !== req.user.id) {
      throw new HttpError(StatusCodes.BAD_REQUEST,
        'Offer was created other user',
        'uploadPreviewImage');
    }
    const {offerId} = req.params;
    const updateDto = { previewImage: req.file?.filename };
    await this.offerService.updateById(offerId, updateDto);
    this.created(res, fillDTO(UploadImageResponse, {updateDto}));
  }

  public async uploadImage(req: Request<ParamsOffer>, res: Response) {
    const offer = await this.offerService.findById(req.params.offerId);
    if (offer?.userId?.id !== req.user.id) {
      throw new HttpError(StatusCodes.BAD_REQUEST,
        'Offer was created other user',
        'uploadImage');
    }
    const {offerId} = req.params;
    await this.offerService.addImage(offerId, req.file?.filename);
    this.noContent(res, 'Image was added');
  }

  public async removeImage(req: Request<ParamsOffer>, res: Response) {
    const offer = await this.offerService.findById(req.params.offerId);
    if (offer?.userId?.id !== req.user.id) {
      throw new HttpError(StatusCodes.BAD_REQUEST,
        'Offer was created other user',
        'removeImage');
    }
    const {offerId} = req.params;
    await this.offerService.removeImage(offerId, req.file?.filename);
    this.noContent(res, 'Image was removed');
  }

  public async delete({params}: Request<ParamsOffer>, res: Response): Promise<void> {
    await this.offerService.deleteById(params.offerId);
    await this.commentService.deleteByOfferId(params.offerId);
    this.noContent(res, `Предложение ${params.offerId} было удалено.`);
  }

  public async showPremium({params}: Request<ParamsCity>, res: Response): Promise<void> {
    const offers = await this.offerService.findPremiumByCity(params.city);
    this.ok(res, fillDTO(FullOfferRdo, offers));
  }

  public async showFavorites(req: Request, _res: Response): Promise<void> {
    const {user} = req;
    const offers = await this.userService.findFavorites(user.id);
    this.ok(_res, fillDTO(FavoriteFullOfferDto, offers));
  }

  public async addFavorite({ params, user }: Request<ParamsOffer>, res: Response): Promise<void> {
    await this.userService.addToFavoritesById(user.id, params.offerId);
    this.noContent(res, {message: 'Offer was added to favorite'});
  }

  public async deleteFavorite({ params, user }: Request<ParamsOffer>, res: Response): Promise<void> {
    await this.userService.removeFromFavoritesById(user.id, params.offerId);
    this.noContent(res, {message: 'Offer was removed from favorite'});
  }
}
