import {Container} from 'inversify';
import {LoggerInterface} from '../logger/logger.interface';
import {ConfigInterface} from '../config/config.interface.js';
import {DatabaseClientInterface} from '../db-client/database-client.interface';
import {ConfigSchema} from '../config/config.schema.js';
import {AppComponent} from '../internal/types.js';
import RestApplication from './rest.js';
import LoggerService from '../logger/logger.service.js';
import ConfigService from '../config/config.service.js';
import MongoClientService from '../db-client/mongo-client.service.js';
import {ExceptionFilter} from '../http/exception-filter.interface.js';
import AppExceptionFilter from '../http/app-exception-filter.js';

export function createApplicationContainer() {
  const applicationContainer = new Container();
  applicationContainer.bind<RestApplication>(AppComponent.Application).to(RestApplication).inSingletonScope();
  applicationContainer.bind<LoggerInterface>(AppComponent.LoggerInterface).to(LoggerService).inSingletonScope();
  applicationContainer.bind<ConfigInterface<ConfigSchema>>(AppComponent.ConfigInterface).to(ConfigService).inSingletonScope();
  applicationContainer.bind<DatabaseClientInterface>(AppComponent.DatabaseClientInterface).to(MongoClientService).inSingletonScope();
  applicationContainer.bind<ExceptionFilter>(AppComponent.ExceptionFilter).to(AppExceptionFilter).inSingletonScope();

  return applicationContainer;
}
