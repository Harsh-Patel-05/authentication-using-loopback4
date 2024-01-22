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
import {StudentRepository, SubjectRepository, TeacherRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';

export class TeacherController {
  constructor(
    @repository(TeacherRepository)
    public teacherRepository: TeacherRepository,
    @repository(StudentRepository)
    public studentRepository: StudentRepository,
    @repository(SubjectRepository)
    public subjectRepository: SubjectRepository
  ) { }

  @authenticate('jwt')
  @post('/teachers', {
    summary: 'Create teacher API Endpoint',
    responses: {
      '200': {},
    },
  })
  async create(
    @requestBody({
      description: 'Create teacher API Endpoint',
      content: {
        'application/json': {
          schema: {
            required: ['teacherName', 'teacherEmail', 'favoriteStudent', 'subjectId'],
            properties: {
              teacherName: {
                type: 'string',
              },
              teacherEmail: {
                type: 'string',
                format: 'email',
                maxLength: 254,
                minLength: 5,
              },
              favoriteStudent: {
                type: 'string',
              },
              subjectId: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    payload: {
      teacherName: 'string'
      teacherEmail: 'string'
      favoriteStudent: 'string'
      subjectId: 'string'
    }
  ) {
    const student = await this.studentRepository.findOne({
      where: {
        id: payload.favoriteStudent,
        isDeleted: false
      }
    })

    if (!student) {
      return {
        statusCode: 400,
        message: 'can not found student',
      }
    }

    const subject = await this.subjectRepository.findOne({
      where: {
        id: payload.subjectId,
        isDeleted: false,
      }
    })

    if (!subject) {
      return {
        statusCode: 400,
        message: 'can not found subject',
      }
    }

    const data = await this.teacherRepository.create(payload);

    if (!data) {
      return {
        statusCode: 400,
        message: 'can not create teacher',
      }
    }

    return {
      statusCode: 200,
      message: 'created successfully',
      data
    }
  }

  @authenticate('jwt')
  @get('/teachers/count', {
    summary: 'Count teacher API Endpoint',
    responses: {
      '200': {},
    },
  })
  async count() {
    const data = await this.teacherRepository.find({
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
  @get('/teachers', {
    summary: 'Get all teacher API Endpoint',
    responses: {
      '200': {},
    },
  })
  async find() {
    const data = await this.teacherRepository.find({
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
  @get('/teachers/{id}', {
    summary: 'Get teacher by id API Endpoint',
    responses: {
      '200': {},
    },
  })
  async findById(
    @param.path.string('id') id: string,
  ) {
    const data = await this.teacherRepository.findOne({
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
  @patch('/teachers/{id}', {
    summary: 'Update teacher by id API Endpoint',
    responses: {
      '200': {},
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      description: 'Update teacher by id API Endpoint',
      content: {
        'application/json': {
          schema: {
            // required: ['teacherName', 'teacherEmail', 'favoriteStudent','subjectId'],
            properties: {
              teacherName: {
                type: 'string',
              },
              teacherEmail: {
                type: 'string',
                format: 'email',
                maxLength: 254,
                minLength: 5,
              },
              favoriteStudent: {
                type: 'string',
              },
              subjectId: {
                type: 'string',
              }
            },
          },
        },
      },
    })
    payload: {
      teacherName: 'string'
      teacherEmail: 'string'
      favoriteStudent: 'string'
      subjectId: 'string'
    }
  ) {
    if (payload.favoriteStudent) {
      const student = await this.studentRepository.findOne({
        where: {
          id: payload.favoriteStudent,
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

    if (payload.subjectId) {
      const subject = await this.subjectRepository.findOne({
        where: {
          id: payload.subjectId,
          isDeleted: false,
        }
      });

      if (!subject) {
        return {
          statusCode: 404,
          message: 'Subject not found',
        }
      }
    }
    const data = await this.teacherRepository.findOne({
      where: {
        id,
        isDeleted: false
      }
    });

    if (data) {
      const result = await this.teacherRepository.updateById(data.id, payload);

      return {
        statusCode: 200,
        message: 'Teacher updated successfully',
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
  @del('/teachers/{id}', {
    summary: 'Delete teacher by id API Endpoint',
    responses: {
      '200': {},
    },
  })
  async deleteById(@param.path.string('id') id: string) {
    return await this.teacherRepository.updateById(id, {isDeleted: true})
      .then(result => {
        return {
          statusCode: 200,
          message: 'Teacher Deleted Successfully...!!',
          result,
        };
      }).catch(err => {
        return {
          statusCode: 400,
          message: 'Teacher Not Found',
        }
      });
  }
}
