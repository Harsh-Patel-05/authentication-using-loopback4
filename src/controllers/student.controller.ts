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
import {SchoolClassRepository, StudentRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';

export class StudentController {
  constructor(
    @repository(StudentRepository)
    public studentRepository: StudentRepository,
    @repository(SchoolClassRepository)
    public schoolClassRepository: SchoolClassRepository,
  ) { }

  @authenticate('jwt')
  @post('/students', {
    summary: 'Create student API Endpoint',
    responses: {
      '200': {},
    },
  })
  async create(
    @requestBody({
      description: 'Create student API Endpoint',
      content: {
        'application/json': {
          schema: {
            required: ['name', 'email', 'classId'],
            properties: {
              name: {
                type: 'string',
              },
              email: {
                type: 'string',
                format: 'email',
                maxLength: 254,
                minLength: 5,
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
      name: 'string'
      email: 'string'
      classId: 'string'
    }
  ) {
    const schoolclass = await this.schoolClassRepository.findOne({
      where: {
        id: payload.classId,
        isDeleted: false
      }
    })

    if (!schoolclass) {
      return {
        statusCode: 400,
        message: 'can not found class',
      }
    }

    const data = await this.studentRepository.create(payload).catch(err => {
      return {
        statusCode: 400,
        message: 'Could not create student'
      }
    });

    return {
      statusCode: 200,
      message: 'created successfully',
      data
    }
  }

  @authenticate('jwt')
  @get('/students/count', {
    summary: 'Count student API Endpoint',
    responses: {
      '200': {},
    },
  })
  async count() {
    const data = await this.studentRepository.find({
      where: {
        isDeleted: false,
      }
    })

    if (!data) {
      return {
        statusCode: 400,
        message: 'Data not found'
      }
    }

    const count = data.length;

    return {
      statusCode: 200,
      message: 'success',
      count
    }
  }

  @authenticate('jwt')
  @get('/students', {
    summary: 'List of students API Endpoint',
    responses: {
      '200': {}
    }
  })
  async find() {
    const data = await this.studentRepository.find({
      where: {
        isDeleted: false
      }
    });

    if (!data[0]) {
      return {
        statusCode: 400,
        message: 'Data not found'
      }
    }

    return {
      statusCode: 200,
      message: 'success',
      data
    }
  }

  @get('/students/{id}', {
    summary: 'Get student by id API Endpoint',
    responses: {
      '200': {}
    }
  })
  async findById(
    @param.path.string('id') id: string,
  ) {
    const data = await this.studentRepository.findOne({
      where: {
        id,
        isDeleted: false
      }
    });

    if (!data) {
      return {
        statusCode: 400,
        message: 'Data not found'
      }
    }

    return {
      statusCode: 200,
      message: 'success',
      data
    }
  }

  @patch('/students/{id}', {
    summary: 'Update student API Endpoint',
    responses: {
      '200': {}
    }
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      description: 'Update student API Endpoint',
      content: {
        'application/json': {
          schema: {
            // required: ['name', 'email','classId'],
            properties: {
              name: {
                type: 'string',
              },
              email: {
                type: 'string',
                format: 'email',
                maxLength: 254,
                minLength: 5,
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
      name: 'string'
      email: 'string'
      classId: 'string'
    }
  ) {
    const data = await this.studentRepository.findOne({
      where: {
        id,
        isDeleted: false
      }
    });

    if (data) {
      const result = await this.studentRepository.updateById(data.id, payload);
      // console.log(result);
      return {
        statusCode: 200,
        message: 'Data updated successfully',
        result
      }
    } else {
      return {
        statusCode: 400,
        message: 'Data not found',
      }
    }
  }

  @authenticate('jwt')
  @del('/student/{id}', {
    summary: 'Delete student by id API Endpoint',
    responses: {
      '200': {},
    },
  })
  async deleteById(@param.path.string('id') id: string) {
    return await this.studentRepository.updateById(id, {isDeleted: true})
      .then(result => {
        return {
          statusCode: 200,
          message: 'Deleted Successfully',
          result,
        };
      }).catch(err => {
        return {
          statusCode: 400,
          message: 'Student Not Found',
        }
      });
  }
}
