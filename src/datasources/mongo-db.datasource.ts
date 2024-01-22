import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  name: 'MongoDb',
  connector: 'mongodb',
  url: process.env.DB_URL,
};

@lifeCycleObserver('datasource')
export class MongoDbDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'MongoDb';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.MongoDb', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
