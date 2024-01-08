import {generateRandomNumber, getRandomItem, getRandomItems} from '../internal/helpers.js';
import dayjs from 'dayjs';
import {UserType, Facility, Housing, City, MockData} from '../internal/types.js';

export interface OfferGeneratorInterface {
  generate(): string;
}

const MIN_COST = 100;
const MAX_COST = 100000;
const MIN_RATING = 1;
const MAX_RATING = 5;
const MIN_COUNT = 1;
const MAX_COUNT = 10;
const MIN_COUNT_ROOM = 1;
const MAX_COUNT_ROOM = 8;
const FIRST_WEEK_DAY = 1;
const LAST_WEEK_DAY = 7;

const cities = [City.Paris, City.Cologne, City.Brussels, City.Amsterdam, City.Dusseldorf, City.Hamburg];

export default class OfferGenerator implements OfferGeneratorInterface {
  constructor(private readonly mockData: MockData) {}

  public generate(): string {
    const name = getRandomItem<string>(this.mockData.titles);
    const description = getRandomItem<string>(this.mockData.descriptions);
    const publicationDate = dayjs().subtract(generateRandomNumber(FIRST_WEEK_DAY, LAST_WEEK_DAY), 'day').toISOString();
    const city = getRandomItem(cities);
    const previewImage = getRandomItem<string>(this.mockData.previewImages);
    const images = getRandomItems<string>(this.mockData.images);
    const premium = getRandomItem<string>(['true', 'false']);
    const favorite = getRandomItem<string>(['true', 'false']);
    const rating = generateRandomNumber(MIN_RATING, MAX_RATING, 1);
    const housingType = getRandomItem([Housing.House, Housing.Hotel, Housing.Room, Housing.Apartment]);
    const roomCount = generateRandomNumber(MIN_COUNT_ROOM, MAX_COUNT_ROOM);
    const guestCount = generateRandomNumber(MIN_COUNT, MAX_COUNT);
    const cost = generateRandomNumber(MIN_COST, MAX_COST);
    const facilities = getRandomItems([Facility.AirConditioning, Facility.BabySeat, Facility.Fridge]);
    const offerAuthorName = getRandomItem<string>(this.mockData.users.usernames);
    const offerAuthorAvatar = getRandomItem<string>(this.mockData.users.avatars);
    const offerAuthorType = getRandomItem([UserType.Pro, UserType.Usual]);
    const offerAuthorNameEmail = getRandomItem<string>(this.mockData.users.emails);
    const commentsCount = generateRandomNumber(MIN_COUNT, MAX_COUNT);
    const latitude = getRandomItem<number>(this.mockData.coordinates.latitude);
    const longitude = getRandomItem<number>(this.mockData.coordinates.longitude);

    return [
      name, description, publicationDate,
      city, previewImage, images, premium,
      favorite, rating, housingType, roomCount,
      guestCount, cost, facilities, offerAuthorName,
      offerAuthorAvatar, offerAuthorType, offerAuthorNameEmail,
      commentsCount, latitude, longitude
    ].join('\t');
  }
}
