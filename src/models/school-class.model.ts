import {Entity, hasOne, model, property} from '@loopback/repository';
import {DateTime} from 'luxon';
import {TimeTable} from './time-table.model';
import {Attendance} from './attendance.model';
import {Student} from './student.model';

@model()
export class SchoolClass extends Entity {
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
  name: string;

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

  @hasOne(() => TimeTable)
  timeTable: TimeTable;

  @hasOne(() => Attendance)
  attendance: Attendance;

  @hasOne(() => Student)
  student: Student;


  constructor(data?: Partial<SchoolClass>) {
    super(data);
  }
}

export interface SchoolClassRelations {
  // describe navigational properties here
}

export type SchoolClassWithRelations = SchoolClass & SchoolClassRelations;
