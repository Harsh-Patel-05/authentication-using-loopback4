import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {TimeTable, TimeTableRelations} from '../models';

export class TimeTableRepository extends DefaultCrudRepository<
  TimeTable,
  typeof TimeTable.prototype.id,
  TimeTableRelations
> {
  constructor(
    @inject('datasources.MongoDb') dataSource: MongoDbDataSource,
  ) {
    super(TimeTable, dataSource);
  }
}
