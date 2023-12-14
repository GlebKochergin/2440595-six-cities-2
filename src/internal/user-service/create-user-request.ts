import { Request } from 'express';
import { RequestBody, RequestParams } from '../../cli-application/http/http.requests.js';
import CreateUserDto from '../user-service/user.dto.js';

export type CreateUserRequest = Request<RequestParams, RequestBody, CreateUserDto>;
