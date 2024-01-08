import { LoggerInterface } from '../logger/logger.interface.js';
import { ConfigInterface } from '../config/config.interface.js';
import { ConfigSchema } from '../config/config.schema.js';
import {inject, injectable} from 'inversify';
import {AppComponent} from '../internal/types.js';
import {DatabaseClientInterface} from '../db-client/database-client.interface.js';
import {getConnectionString} from '../internal/helpers.js';
import express, { Express } from 'express';
import {ControllerInterface} from '../controller/controller.interface.js';
import {ExceptionFilter} from '../http/exception-filter.interface.js';
import {AuthenticateMiddleware} from '../middleware/authenticate.middleware.js';

@injectable()
export default class RestApplication {
  private server: Express;
  constructor(@inject(AppComponent.LoggerInterface) private readonly logger: LoggerInterface,
              @inject(AppComponent.ConfigInterface) private readonly config: ConfigInterface<ConfigSchema>,
              @inject(AppComponent.DatabaseClientInterface) private readonly databaseClient: DatabaseClientInterface,
              @inject(AppComponent.UserController) private readonly userController: ControllerInterface,
              @inject(AppComponent.OfferController) private readonly offerController: ControllerInterface,
              @inject(AppComponent.CommentController) private readonly commentController: ControllerInterface,
              @inject(AppComponent.ExceptionFilter) private readonly appExceptionFilter: ExceptionFilter,
  ) {
    this.server = express();
  }

  private async _initDb() {
    const mongoUri = getConnectionString(
      this.config.get('DB_USER'),
      this.config.get('DB_PASSWORD'),
      this.config.get('DB_HOST'),
      this.config.get('DB_PORT'),
      this.config.get('DB_NAME'),
    );

    return this.databaseClient.connect(mongoUri);
  }

  private async _initServer() {
    const port = this.config.get('PORT');
    this.server.listen(port);
  }

  private async _initRoutes() {
    this.server.use('/users', this.userController.router);
    this.server.use('/offers', this.offerController.router);
    this.server.use('/comments', this.commentController.router);
  }

  private async _initMiddleware() {
    this.server.use(express.json());
    this.server.use(
      '/upload',
      express.static(this.config.get('UPLOAD_DIRECTORY'))
    );
    this.server.use(
      '/static',
      express.static(this.config.get('STATIC_DIRECTORY_PATH'))
    );
    const authenticateMiddleware = new AuthenticateMiddleware(this.config.get('JWT_SECRET'));
    this.server.use(
      authenticateMiddleware
        .execute
        .bind(authenticateMiddleware)
    );
  }

  private async _initExceptionFilters() {
    this.server.use(this.appExceptionFilter.catch.bind(this.appExceptionFilter));
  }

  public async init() {
    this.logger.info('Application initialization');

    this.logger.info('Init database');
    await this._initDb();
    this.logger.info('Init database completed');

    this.logger.info('Init middlewares');
    await this._initMiddleware();
    this.logger.info('Middlewares initialization completed');

    this.logger.info('Init routes');
    await this._initRoutes();
    this.logger.info('Routes initialization completed');

    this.logger.info('Init exception filters');
    await this._initExceptionFilters();
    this.logger.info('Exception filters initialization completed');

    this.logger.info('Try to init server...');
    await this._initServer();
    this.logger.info(`Server started on http://localhost:${this.config.get('PORT')}`);
  }
}
