import {Entity, hasOne, model, property} from '@loopback/repository';
import {DateTime} from 'luxon';
import {Loopback4BoilerplatePublicConstants} from '../keys';
import {UserCredentials} from './user-credentials.model';

@model({
  settings: {
    strictObjectIDCoercion: true,
    scope: {
      where: {isDeleted: {neq: true}},
    },
  },
})
export class User extends Entity {
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
    jsonSchema: {
      format: 'email',
      transform: ['trim'],
      maxLength: 254,
      minLength: 5,
      pattern: '^(?! ).*[^ ]$',
      errorMessage: {
        pattern: `Invalid input.`,
      },
    },
  })
  email: string;

  // @property({
  //   type: 'string',
  //   required: true,
  // })
  // password: string;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(Loopback4BoilerplatePublicConstants.UserStatus),
    },
    default: Loopback4BoilerplatePublicConstants.UserStatus.ACTIVE,
  })
  status?: string;

  @property({
    type: 'date',
    default: null,
    jsonSchema: {
      nullable: true,
    },
  })
  tokenExpireAt?: DateTime | null;

  @property({
    type: 'date',
    default: null,
    jsonSchema: {
      nullable: true,
    },
  })
  lastLoginAt?: DateTime | null;

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

  @hasOne(() => UserCredentials)
  userCredentials: UserCredentials;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
