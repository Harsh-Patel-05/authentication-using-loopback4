import {Entity, model, property} from '@loopback/repository';
import {DateTime} from 'luxon';

@model()
export class TempResetToken extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    mongodb: {dataType: 'ObjectId'},
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  token: string;

  @property({
    type: 'date',
    required: true,
  })
  expireAt: Date;

  @property({
    type: 'date',
    default: () => DateTime.utc().toJSDate(),
  })
  createdAt?: DateTime;

  @property({
    type: 'date',
    default: () => DateTime.utc().toJSDate(),
  })
  updatedAt?: DateTime;


  constructor(data?: Partial<TempResetToken>) {
    super(data);
  }
}

export interface TempResetTokenRelations {
  // describe navigational properties here
}

export type TempResetTokenWithRelations = TempResetToken & TempResetTokenRelations;
