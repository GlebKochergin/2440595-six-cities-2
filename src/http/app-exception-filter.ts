import {NextFunction, Request, Response} from 'express';
import {inject, injectable} from 'inversify';
import {StatusCodes} from 'http-status-codes';
import {AppComponent} from '../internal/types.js';
import {LoggerInterface} from '../logger/logger.interface.js';
import {HttpError} from './http.error.js';
import {createErrorObject} from '../internal/helpers.js';
import {ExceptionFilter} from './exception-filter.interface.js';


@injectable()
export default class AppExceptionFilter implements ExceptionFilter {
  constructor(
    @inject(AppComponent.LoggerInterface) private logger: LoggerInterface
  ) {
    this.logger.info('Register ExceptionFilter');
  }

  private handleHttpError(error: HttpError, _req: Request, res: Response, _next: NextFunction) {
    this.logger.error(`[${error.detail}]: ${error.httpStatusCode} — ${error.message}`);
    res
      .status(error.httpStatusCode)
      .json(createErrorObject(error.message));
  }

  private handleOtherError(error: Error, _req: Request, res: Response, _next: NextFunction) {
    this.logger.error(error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(createErrorObject(error.message));
  }

  public catch(error: Error | HttpError, req: Request, res: Response, next: NextFunction): void {
    if (error instanceof HttpError) {
      return this.handleHttpError(error, req, res, next);
    }

    this.handleOtherError(error, req, res, next);
  }
}
