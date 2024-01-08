import { LoggerInterface } from '../logger/logger.interface.js';
import { configSchema, ConfigSchema } from './config.schema.js';
import { AppComponent } from '../internal/types.js';
import { ConfigInterface } from './config.interface.js';
import { config } from 'dotenv';
import { inject, injectable } from 'inversify';

@injectable()
export default class ConfigService implements ConfigInterface<ConfigSchema> {
  private readonly config: ConfigSchema;

  constructor(@inject(AppComponent.LoggerInterface) private readonly logger: LoggerInterface) {
    const parsedOutput = config();
    if (parsedOutput.error) {
      throw new Error('Can\'t read .env file');
    }
    configSchema.load({});
    configSchema.validate({allowed: 'strict', output: this.logger.info});
    this.config = configSchema.getProperties();
    this.logger.info('.env file found and successfully parsed');
  }

  public get<T extends keyof ConfigSchema>(key: T): ConfigSchema[T] {
    return this.config[key];
  }
}
