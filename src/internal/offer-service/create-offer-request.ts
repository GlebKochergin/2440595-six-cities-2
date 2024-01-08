import { Request } from 'express';
import CreateOfferDto from './offer.dto.js';
import {RequestBody, RequestParams} from '../../http/http.requests.js';

export type CreateOfferRequest = Request<RequestParams, RequestBody, CreateOfferDto>;
