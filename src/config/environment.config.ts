
import { developmentConfig } from './environments/development.js';
import { testConfig } from './environments/test.js';
import { productionConfig } from './environments/production.js';

const configurations = {
  development: developmentConfig,
  test: testConfig,
  production: productionConfig
};

export const environmentConfig =
  configurations[
    (process.env.NODE_ENV || 'development') as keyof typeof configurations
  ] || developmentConfig;
