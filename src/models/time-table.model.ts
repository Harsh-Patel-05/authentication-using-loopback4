import {Entity, belongsTo, model, property} from '@loopback/repository';
import {Teacher} from './teacher.model';
import {DateTime} from 'luxon';
import {SchoolClass} from './school-class.model';

@model()
export class TimeTable extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @belongsTo(
    () => Teacher,
    {
      //relation metadata
      name: 'teacher',
    },
    {
      // property definition
      type: 'string',
      required: true,
      mongodb: {dataType: 'ObjectId'},
    },
  )
  teacherId: string;

  @belongsTo(
    () => SchoolClass,
    {
      //relation metadata
      name: 'school_class',
    },
    {
      // property definition
      type: 'string',
      required: true,
      mongodb: {dataType: 'ObjectId'},
    },
  )
  classId: string;

  @property({
    type: 'string',
    required: true,
  })
  day: string;

  @property({
    type: 'boolean',
    default: false,
  })
  isDeleted?: boolean;

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


  constructor(data?: Partial<TimeTable>) {
    super(data);
  }
}

export interface TimeTableRelations {
  // describe navigational properties here
}

export type TimeTableWithRelations = TimeTable & TimeTableRelations;
