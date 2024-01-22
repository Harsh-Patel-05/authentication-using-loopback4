import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {SchoolClass, SchoolClassRelations} from '../models';

export class SchoolClassRepository extends DefaultCrudRepository<
  SchoolClass,
  typeof SchoolClass.prototype.id,
  SchoolClassRelations
> {
  constructor(
    @inject('datasources.MongoDb') dataSource: MongoDbDataSource,
  ) {
    super(SchoolClass, dataSource);
  }
}
