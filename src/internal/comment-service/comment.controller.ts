import {Request, Response} from 'express';
import {inject, injectable} from 'inversify';
import {Controller} from '../../cli-application/controller/controller.abstract.js';
import {AppComponent, HttpMethod, ParamsOffer} from '../types.js';
import {LoggerInterface} from '../../cli-application/logger/logger.interface.js';
import {CommentServiceInterface} from './comment-service.interface.js';
import CreateCommentDto from './create-comment.dto.js';
import {fillDTO} from '../helpers.js';
import CommentRdo from './comment.rdo.js';
import {DtoValidateMiddleware} from '../../cli-application/middleware/dto.validate.middleware.js';
import {DocumentExistsMiddleware} from '../../cli-application/middleware/doc.exists.middleware.js';
import {OfferServiceInterface} from '../offer-service/offer-service.interface.js';
import {PrivateRouteMiddleware} from '../../cli-application/middleware/private.route.middleware.js';
import {ConfigInterface} from '../../cli-application/config/config.interface.js';
import {ConfigSchema} from '../../cli-application/config/config.schema.js';


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
      handler: this.index,
      middlewares: [
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
  }

  public async index({params}: Request<ParamsOffer>, res: Response): Promise<void> {
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
