import {
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  patch,
  del,
  requestBody,
} from '@loopback/rest';
import {SubjectRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';

export class SubjectController {
  constructor(
    @repository(SubjectRepository)
    public subjectRepository: SubjectRepository,
  ) { }

  @authenticate('jwt')
  @post('/subjects', {
    summary: 'Create subject API Endpoint',
    responses: {
      '200': {},
    },
  })
  async create(
    @requestBody({
      description: 'Create subject API Endpoint',
      content: {
        'application/json': {
          schema: {
            required: ['name'],
            properties: {
              name: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    payload: {
      name: 'string'
    }
  ) {
    const data = await this.subjectRepository.create(payload);

    if (!data) {
      return {
        statusCode: 400,
        message: 'can not create subjet',
      }
    }

    return {
      statusCode: 200,
      message: 'created successfully',
      data
    }
  }

  @authenticate('jwt')
  @get('/subject/count', {
    summary: 'Count subject API Endpoint',
    responses: {
      '200': {},
    },
  })
  async count() {
    const data = await this.subjectRepository.find({
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
  @get('/subjects', {
    summary: 'List of subject API Endpoint',
    responses: {
      '200': {}
    }
  })
  async find() {
    const data = await this.subjectRepository.find({
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

  @authenticate('jwt')
  @get('/subjects/{id}', {
    summary: 'Get subject by id API Endpoint',
    responses: {
      '200': {}
    }
  })
  async findById(
    @param.path.string('id') id: string,
  ) {
    const data = await this.subjectRepository.findOne({
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

  @authenticate('jwt')
  @patch('/subjects/{id}', {
    summary: 'Update student API Endpoint',
    responses: {
      '200': {}
    }
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      description: 'Update subject API Endpoint',
      content: {
        'application/json': {
          schema: {
            required: ['name'],
            properties: {
              name: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    payload: {
      name: 'string'
    }
  ) {
    const data = await this.subjectRepository.findOne({
      where: {
        id,
        isDeleted: false
      }
    });

    if (data) {
      const result = await this.subjectRepository.updateById(data.id, payload);
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
  @del('/subjects/{id}', {
    summary: 'Delete subject by id API Endpoint',
    responses: {
      '200': {},
    },
  })
  async deleteById(@param.path.string('id') id: string) {
    return await this.subjectRepository.updateById(id, {isDeleted: true})
      .then(result => {
        return {
          statusCode: 200,
          message: 'Deleted Successfully',
          result,
        };
      }).catch(err => {
        return {
          statusCode: 400,
          message: 'Subject Not Found',
        }
      });
  }
}
