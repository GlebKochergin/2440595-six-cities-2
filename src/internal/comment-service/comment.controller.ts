import {Request, Response} from 'express';
import {inject, injectable} from 'inversify';
import {Controller} from '../../controller/controller.abstract.js';
import {AppComponent, HttpMethod, ParamsOffer} from '../types.js';
import {LoggerInterface} from '../../logger/logger.interface.js';
import {CommentServiceInterface} from './comment-service.interface.js';
import CreateCommentDto from './create-comment.dto.js';
import {fillDTO} from '../helpers.js';
import CommentRdo from './comment.rdo.js';
import {DtoValidateMiddleware} from '../../middleware/dto.validate.middleware.js';
import {DocumentExistsMiddleware} from '../../middleware/doc.exists.middleware.js';
import {OfferServiceInterface} from '../offer-service/offer-service.interface.js';
import {PrivateRouteMiddleware} from '../../middleware/private.route.middleware.js';
import {ConfigInterface} from '../../config/config.interface.js';
import {ConfigSchema} from '../../config/config.schema.js';
import {ValidateObjectIdMiddleware} from '../../middleware/object-id.validate.middleware.js';


@injectable()
export default class CommentController extends Controller {
  constructor(
    @inject(AppComponent.LoggerInterface) protected readonly logger: LoggerInterface,
    @inject(AppComponent.CommentServiceInterface) private readonly commentService: CommentServiceInterface,
    @inject(AppComponent.OfferServiceInterface) private readonly offerService: OfferServiceInterface,
    @inject(AppComponent.ConfigInterface) configService: ConfigInterface<ConfigSchema>
  ) {
    super(logger, configService);

    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(),
        new DtoValidateMiddleware(CreateCommentDto),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.getComments,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
      ],
    });
  }

  public async getComments({ params }: Request, res: Response): Promise<void> {
    const comments = await this.commentService.findByOfferId(params.offerId);

    this.ok(res, fillDTO(CommentRdo, comments));
  }

  public async create({body, params, user}: Request<ParamsOffer>, res: Response): Promise<void> {
    const comment = await this.commentService.createForOffer(
      {
        ...body,
        offerId: params.offerId,
        userId: user.id
      }
    );
    const result = await this.commentService.findById(comment.id);
    this.created(res, fillDTO(CommentRdo, result));
  }
}
