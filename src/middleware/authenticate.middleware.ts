import { jwtVerify } from 'jose';
import { createSecretKey } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HttpError } from '../http/http.error.js';
import { MiddlewareInterface } from './middleware.interface.js';


export const BLACK_LIST_TOKENS: Set<string> = new Set();
export class AuthenticateMiddleware implements MiddlewareInterface {
  constructor(private readonly jwtSecret: string) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const authorizationHeader = req.headers?.authorization?.split(' ');
    if (!authorizationHeader) {
      return next();
    }

    const [, token] = authorizationHeader;

    try {
      const { payload } = await jwtVerify(
        token,
        createSecretKey(this.jwtSecret, 'utf-8')
      );

      if (BLACK_LIST_TOKENS.has(token)) {
        return next(new HttpError(
          StatusCodes.UNAUTHORIZED,
          'Token in black list',
          'AuthenticateMiddleware'
        ));
      }
      req.user = { email: payload.email as string, id: payload.id as string };
      return next();
    } catch {

      return next(new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Invalid token',
        'AuthenticateMiddleware')
      );
    }
  }
}
