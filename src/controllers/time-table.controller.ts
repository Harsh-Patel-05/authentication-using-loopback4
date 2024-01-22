import {
  repository
} from '@loopback/repository';
import {
  del,
  get,
  param,
  patch,
  post,
  requestBody
} from '@loopback/rest';
import {TeacherRepository, TimeTableRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';

export class TimeTableController {
  constructor(
    @repository(TimeTableRepository)
    public timeTableRepository: TimeTableRepository,
    @repository(TeacherRepository)
    public teacherRepository: TeacherRepository,
  ) { }

  @authenticate('jwt')
  @post('/time-tables', {
    summary: 'Create timeTable API Endpoint',
    responses: {
      '200': {},
    },
  })
  async create(
    @requestBody({
      description: 'Create timeTable API Endpoint',
      content: {
        'application/json': {
          schema: {
            required: ['day', 'teacherId', 'classId'],
            properties: {
              day: {
                type: 'string',
              },
              teacherId: {
                type: 'string',
              },
              classId: {
                type: 'string',
              }
            }
          }
        },
      },
    })
    payload: {
      day: 'string'
      teacherId: 'string'
      classId: 'string'
    }
  ) {
    const teacher = await this.teacherRepository.findOne({
      where: {
        id: payload.teacherId
      }
    });

    if (!teacher) {
      return {
        statusCode: 404,
        message: 'Teacher not found'
      }
    }

    const data = await this.timeTableRepository.create(payload);
    if (!data) {
      return {
        statusCode: 400,
        message: 'can not create timeTable',
      }
    }

    return {
      statusCode: 200,
      message: 'created successfully',
      data
    }
  }

  @authenticate('jwt')
  @get('/time-tables/count', {
    summary: 'Count API Endpoint',
    responses: {
      '200': {},
    },
  })
  async count() {
    const data = await this.timeTableRepository.find({
      where: {
        isDeleted: false,
      }
    })

    if (!data) {
      return {
        statusCode: 404,
        message: 'Data not found'
      }
    }

    const count = data.length;

    return {
      statusCode: 200,
      message: 'Success',
      count
    }
  }

  @authenticate('jwt')
  @get('/time-tables', {
    summary: 'Get all API Endpoint',
    responses: {
      '200': {},
    },
  })
  async find() {
    const data = await this.timeTableRepository.find({
      where: {
        isDeleted: false,
      }
    })

    if (!data[0]) {
      return {
        statusCode: 400,
        message: 'Data not found',
      }
    }

    return {
      statusCode: 200,
      message: 'success',
      data
    }
  }

  @authenticate('jwt')
  @get('/time-tables/{id}', {
    summary: 'Get timeTable by id API Endpoint',
    responses: {
      '200': {},
    },
  })
  async findById(
    @param.path.string('id') id: string) {
    const data = await this.timeTableRepository.findOne({
      where: {
        id,
        isDeleted: false
      }
    });

    if (!data) {
      return {
        statusCode: 404,
        message: 'Data not found',
      }
    }

    return {
      statusCode: 200,
      message: 'Success',
      data
    }
  }

  @authenticate('jwt')
  @patch('/time-tables/{id}', {
    summary: 'Update timeTable by id API Endpoint',
    responses: {
      '200': {},
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      description: 'Update timeTable by id API Endpoint',
      content: {
        'application/json': {
          schema: {
            // required: ['day','treacherId','classId'],
            properties: {
              day: {
                type: 'string',
              },
              teacherId: {
                type: 'string',
              },
              classId: {
                type: 'string',
              }
            }
          }
        },
      },
    })
    payload: {
      day: 'string'
      teacherId: 'string'
      classId: 'string'
    }
  ) {
    const teacher = await this.teacherRepository.findOne({
      where: {
        id: payload.teacherId,
        isDeleted: false
      }
    });
    if (!teacher) {
      return {
        statusCode: 404,
        message: 'Teacher not found',
      }
    }
    const data = await this.timeTableRepository.findOne({
      where: {
        id,
        isDeleted: false
      }
    });
    if (data) {
      const result = await this.timeTableRepository.updateById(data.id, payload);

      return {
        statusCode: 200,
        message: 'timeTable updated successfully',
        result
      }
    } else {
      return {
        statusCode: 200,
        message: 'Data not found',
      }
    }
  }

  @authenticate('jwt')
  @del('/time-tables/{id}', {
    summary: 'Delete timeTable by id API Endpoint',
    responses: {
      '200': {},
    },
  })
  async deleteById(@param.path.string('id') id: string) {
    return await this.timeTableRepository.updateById(id, {isDeleted: true}).then(result => {
      return {
        statusCode: 200,
        message: 'timeTable Deleted Successfully...!!',
        result,
      };
    }).catch(err => {
      return {
        statusCode: 400,
        message: 'timeTable Not Found',
      }
    });
  }
}
