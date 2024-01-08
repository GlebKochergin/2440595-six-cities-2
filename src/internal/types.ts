import {NextFunction, Request, Response} from 'express';
import {ParamsDictionary} from 'express-serve-static-core';
import {MiddlewareInterface} from '../middleware/middleware.interface.js';

export enum City {
  Paris = 'Paris',
  Cologne = 'Cologne',
  Brussels = 'Brussels',
  Amsterdam = 'Amsterdam',
  Hamburg = 'Hamburg',
  Dusseldorf = 'Dusseldorf',
}

export enum UserType {
  Usual = 'Usual',
  Pro = 'Pro',
}

export type User = {
  name: string,
  email: string,
  avatarPath?: string,
  type: UserType,
};

export type Comment = {
  text: string;
  publicationDate: Date;
  rating: number;
  author: User;
}

export type Coordinates = {
  latitude: number,
  longitude: number,
}

export type CityWithCoordinates = {
  [name: string]: Coordinates
}

export enum Facility {
  Breakfast = 'Breakfast',
  AirConditioning = 'AirConditioning',
  LaptopFriendlyWorkspace = 'LaptopFriendlyWorkspace',
  BabySeat = 'BabySeat',
  Washer = 'Washer',
  Towels = 'Towels',
  Fridge = 'Fridge'
}

export enum Housing {
  Apartment = 'Apartment',
  House = 'House',
  Room = 'Room',
  Hotel = 'Hotel'
}

export type Offer = {
  name: string;
  description: string;
  publicationDate: Date;
  city: City;
  previewImage: string;
  images: string[];
  premium: boolean;
  favorite: boolean;
  rating: number;
  housingType: Housing;
  roomCount: number;
  guestCount: number;
  cost: number;
  facilities: Facility[];
  offerAuthor: User;
  commentsCount: number;
  coordinates: Coordinates
}

export type MockData = {
  titles: string[],
  descriptions: string[],
  previewImages: string[],
  images: string[],
  coordinates: {
    latitude: number[],
    longitude: number[]
  },
  users: {
    usernames: string[],
    avatars: string[],
    emails: string[],
    passwords: string[]
  }
}

export const CityCoordinates: CityWithCoordinates = {
  [City.Paris]: {latitude: 48.85661, longitude: 2.351499},
  [City.Cologne]: {latitude: 50.938361, longitude: 6.959974},
  [City.Brussels]: {latitude: 50.846557, longitude: 4.351697},
  [City.Amsterdam]: {latitude: 52.370216, longitude: 4.895168},
  [City.Hamburg]: {latitude: 53.550341, longitude: 10.000654},
  [City.Dusseldorf]: {latitude: 51.225402, longitude: 6.776314}
};

export const AppComponent = {
  Application: Symbol.for('Application'),
  LoggerInterface: Symbol.for('LoggerInterface'),
  ConfigInterface: Symbol.for('ConfigInterface'),
  DatabaseClientInterface: Symbol.for('DatabaseClientInterface'),
  UserServiceInterface: Symbol.for('UserServiceInterface'),
  UserModel: Symbol.for('UserModel'),
  OfferServiceInterface: Symbol.for('OfferServiceInterface'),
  OfferModel: Symbol.for('OfferModel'),
  CommentServiceInterface: Symbol.for('CommentServiceInterface'),
  CommentModel: Symbol.for('CommentModel'),
  OfferController: Symbol.for('OfferController'),
  UserController: Symbol.for('UserController'),
  ExceptionFilter: Symbol.for('ExceptionFilter'),
  CommentController: Symbol.for('CommentController'),
} as const;

export enum SortType {
  Down = -1,
  Up = 1,
}

export enum HttpMethod {
  Get = 'get',
  Post = 'post',
  Delete = 'delete',
  Patch = 'patch',
  Put = 'put',
}


export interface RouteInterface {
  path: string;
  method: HttpMethod;
  handler: (req: Request, res: Response, next: NextFunction) => void;
  middlewares?: MiddlewareInterface[];
}

export interface DocumentExistsInterface {
  exists(documentId: string): Promise<boolean>;
}


export type ParamsOffer = {
  offerId: string;
} | ParamsDictionary

export type ParamsCity = {
  city: string;
}| ParamsDictionary

export type ParamsOffersCount = {
  count: string;
}| ParamsDictionary

