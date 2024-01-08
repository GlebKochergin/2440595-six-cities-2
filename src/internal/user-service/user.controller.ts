import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import {AppComponent} from '../types.js';
import {Controller} from '../../cli-application/controller/controller.abstract.js';
import {LoggerInterface} from '../../cli-application/logger/logger.interface.js';
import {HttpMethod} from '../types.js';
import {createJWT, JWT_ALGORITHM, fillDTO} from '../helpers.js';
import {UserServiceInterface} from './user-service.interface.js';
import CreateUserDto from './user.dto.js';
import {HttpError} from '../../cli-application/http/http.error.js';
import {StatusCodes} from 'http-status-codes';
import {ConfigInterface} from '../../cli-application/config/config.interface.js';
import {ConfigSchema} from '../../cli-application/config/config.schema.js';
import UserRdo from './user.rdo.js';
import LoginUserDto from './login-user.dto.js';
import {ValidateObjectIdMiddleware} from '../../cli-application/middleware/object-id.validate.middleware.js';
import {UploadMiddleware} from '../../cli-application/middleware/upload.middleware.js';
import EnteredUserRdo from './entered.user.rdo.js';
import {BLACK_LIST_TOKENS} from '../../cli-application/middleware/authenticate.middleware.js';
import {PrivateRouteMiddleware} from '../../cli-application/middleware/private.route.middleware.js';
import {DtoValidateMiddleware} from '../../cli-application/middleware/dto.validate.middleware';
import {LoginUserRequest} from './login-user-request.js';


@injectable()
export default class UserController extends Controller {
  constructor(@inject(AppComponent.LoggerInterface) logger: LoggerInterface,
              @inject(AppComponent.UserServiceInterface) private readonly userService: UserServiceInterface,
              @inject(AppComponent.ConfigInterface) private readonly configService: ConfigInterface<ConfigSchema>
  ) {
    super(logger);

    this.logger.info('Register routes for CategoryController…');

    this.addRoute({
      path: '/register',
      method: HttpMethod.Post,
      handler: this.register,
      middlewares: [
        new DtoValidateMiddleware(CreateUserDto)
      ]
    });
    this.addRoute({
      path: '/login',
      method: HttpMethod.Post,
      handler: this.login,
      middlewares: [
        new DtoValidateMiddleware(LoginUserDto)
      ]
    });
    this.addRoute({
      path: '/login',
      method: HttpMethod.Get,
      handler: this.checkAuthenticate,
    });
    this.addRoute({
      path: '/logout',
      method: HttpMethod.Post,
      handler: this.logout,
      middlewares: [
        new PrivateRouteMiddleware()
      ]
    });
    this.addRoute({
      path: '/:userId/avatar',
      method: HttpMethod.Post,
      handler: this.uploadAvatar,
      middlewares: [
        new ValidateObjectIdMiddleware('userId'),
        new UploadMiddleware(this.configService.get('UPLOAD_DIRECTORY'), 'avatar'),
      ]
    });
  }

  public async register(
    {body}: Request<Record<string, unknown>, Record<string, unknown>, CreateUserDto>,
    res: Response): Promise<void> {
    const user = await this.userService.findByEmail(body.email);

    if (user) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        `User with email ${body.email} already exists.`,
        'UserController'
      );
    }

    const result = await this.userService.create(body, this.configService.get('SALT'));
    this.created(res, fillDTO(UserRdo, result));
  }

  public async login({body}: LoginUserRequest, res: Response): Promise<void> {
    const user = await this
      .userService
      .verifyUser(body, this.configService.get('SALT'));

    if (!user) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized',
        'UserController',
      );
    }

    const token = await createJWT(
      JWT_ALGORITHM,
      this.configService.get('JWT_SECRET'),
      {
        email: user.email,
        id: user.id
      }
    );
    this.ok(res, fillDTO(EnteredUserRdo, {
      email: user.email,
      token
    }));
  }

  public async checkAuthenticate({user: {email}}: Request, res: Response) {
    const foundedUser = await this.userService.findByEmail(email);

    if (!foundedUser) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized',
        'UserController'
      );
    }

    this.ok(res, fillDTO(EnteredUserRdo, foundedUser));
  }

  public async logout(req: Request, res: Response): Promise<void> {
    const [, token] = String(req.headers.authorization?.split(' '));

    if (!req.user) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized',
        'UserController'
      );
    }

    BLACK_LIST_TOKENS.add(token);

    this.noContent(res, {token});
  }

  public async uploadAvatar(req: Request, res: Response) {
    this.created(res, {filepath: req.file?.path});
  }
}
