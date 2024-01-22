import {
  repository,
} from '@loopback/repository';
import {
  del,
  get,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {AttendanceRepository, SchoolClassRepository, StudentRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';

export class AttendanceController {
  constructor(
    @repository(AttendanceRepository)
    public attendanceRepository: AttendanceRepository,
    @repository(StudentRepository)
    public studentRepository: StudentRepository,
    @repository(SchoolClassRepository)
    public schoolClassRepository: SchoolClassRepository,
  ) { }

  @authenticate('jwt')
  @post('/attendances', {
    summary: 'Create attendance API Endpoint',
    responses: {
      '200': {},
    },
  })
  async create(
    @requestBody({
      description: 'Create attendance API Endpoint',
      content: {
        'application/json': {
          schema: {
            required: ['isPresent', 'date', 'classId', 'studentId'],
            properties: {
              isPresent: {
                type: 'boolean',
              },
              date: {
                type: 'string',
              },
              classId: {
                type: 'string',
              },
              studentId: {
                type: 'string',
              }
            },
          },
        },
      },
    })
    payload: {
      isPresent: boolean
      date: 'string'
      classId: 'string'
      studentId: 'string'
    }
  ) {
    const student = await this.studentRepository.findOne({
      where: {
        id: payload.studentId,
        isDeleted: false
      }
    })

    if (!student) {
      return {
        statusCode: 400,
        message: 'can not found student',
      }
    }

    const schoolclass = await this.schoolClassRepository.findOne({
      where: {
        id: payload.classId,
        isDeleted: false,
      }
    })

    if (!schoolclass) {
      return {
        statusCode: 400,
        message: 'can not found class',
      }
    }

    const data = await this.attendanceRepository.create(payload);

    if (!data) {
      return {
        statusCode: 400,
        message: 'can not create attendance',
      }
    }

    return {
      statusCode: 200,
      message: 'created successfully',
      data
    }
  }

  @authenticate('jwt')
  @get('/attendances/count', {
    summary: 'Count attendance API Endpoint',
    responses: {
      '200': {},
    },
  })
  async count() {
    const data = await this.attendanceRepository.find({
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
  @get('/attendances', {
    summary: 'Get all attendance API Endpoint',
    responses: {
      '200': {},
    },
  })
  async find() {
    const data = await this.attendanceRepository.find({
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
  @get('/attendances/{id}', {
    summary: 'Get attendance by id API Endpoint',
    responses: {
      '200': {},
    },
  })
  async findById(
    @param.path.string('id') id: string,
  ) {
    const data = await this.attendanceRepository.findOne({
      where: {
        id,
        isDeleted: false
      }
    })
    if (!data) {
      return {
        statusCode: 400,
        message: 'Data not found'
      }
    }

    return {
      statusCode: 200,
      message: 'Success',
      data
    }
  }

  @authenticate('jwt')
  @patch('/attendances/{id}', {
    summary: 'Update attendance by id API Endpoint',
    responses: {
      '200': {},
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      description: 'Update attendance API Endpoint',
      content: {
        'application/json': {
          schema: {
            // required: ['ispresent', 'Date', 'classId', 'studentId'],
            properties: {
              isPresent: {
                type: 'boolean',
              },
              date: {
                type: 'string',
              },
              classId: {
                type: 'string',
              },
              studentId: {
                type: 'string',
              }
            },
          },
        },
      },
    })
    payload: {
      isPresent: boolean
      date: 'string'
      classId: 'string'
      studentId: 'string'
    }
  ) {
    if (payload.studentId) {
      const student = await this.studentRepository.findOne({
        where: {
          id: payload.studentId,
          isDeleted: false,
        }
      });

      if (!student) {
        return {
          statusCode: 404,
          message: 'Student not found',
        }
      }
    }

    if (payload.classId) {
      const schoolclass = await this.schoolClassRepository.findOne({
        where: {
          id: payload.classId,
          isDeleted: false,
        }
      });

      if (!schoolclass) {
        return {
          statusCode: 404,
          message: 'Class not found',
        }
      }
    }
    const data = await this.attendanceRepository.findOne({
      where: {
        id,
        isDeleted: false
      }
    });

    if (data) {
      const result = await this.attendanceRepository.updateById(data.id, payload);

      return {
        statusCode: 200,
        message: 'Attendance updated successfully',
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
  @del('/attendances/{id}', {
    summary: 'Delete attendance by id API Endpoint',
    responses: {
      '200': {},
    },
  })
  async deleteById(@param.path.string('id') id: string) {
    return await this.attendanceRepository.updateById(id, {isDeleted: true})
      .then(result => {
        return {
          statusCode: 200,
          message: 'Attendance Deleted Successfully...!!',
          result,
        };
      }).catch(err => {
        return {
          statusCode: 400,
          message: 'Attendance Not Found',
        }
      });
  }
}
