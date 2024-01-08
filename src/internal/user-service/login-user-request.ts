import { Request } from 'express';
import { RequestBody, RequestParams } from '../../http/http.requests.js';
import LoginUserDto from '../user-service/login-user.dto.js';

export type LoginUserRequest = Request<RequestParams, RequestBody, LoginUserDto>;
