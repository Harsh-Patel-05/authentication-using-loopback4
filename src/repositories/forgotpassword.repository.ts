import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDbDataSource} from '../datasources';
import {TempResetToken, TempResetTokenRelations} from '../models';

export class ForgotpasswordRepository extends DefaultCrudRepository<
  TempResetToken,
  typeof TempResetToken.prototype.id,
  TempResetTokenRelations
> {
  constructor(
    @inject('datasources.MongoDb') dataSource: MongoDbDataSource,
  ) {
    super(TempResetToken, dataSource);
  }
}
