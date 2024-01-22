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
import {SchoolClassRepository} from '../repositories';
import {authenticate} from '@loopback/authentication';

export class SchoolClassController {
  constructor(
    @repository(SchoolClassRepository)
    public schoolClassRepository: SchoolClassRepository,
  ) { }

  @authenticate('jwt')
  @post('/school-classes', {
    summary: 'Create SchoolClass API Endpoint',
    responses: {
      '200': {},
    },
  })
  async create(
    @requestBody({
      description: 'Create SchoolClass API Endpoint',
      content: {
        'application/json': {
          schema: {
            required: ['name'],
            properties: {
              name: {
                type: 'string',
              },
            }
          }
        },
      },
    })
    payload: {
      name: 'string'
    }
  ) {
    const data = await this.schoolClassRepository.create(payload);
    if (!data) {
      return {
        statusCode: 404,
        message: 'can not create'
      }
    }
    return {
      statusCode: 200,
      message: 'created successfully',
      data
    }
  }

  @authenticate('jwt')
  @get('/school-classes/count', {
    summary: 'Count SchoolClass API Endpoint',
    responses: {
      '200': {},
    },
  })
  async count() {
    const data = await this.schoolClassRepository.find({
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
  @get('/school-classes', {
    summary: 'List Of SchoolClass API Endpoint',
    responses: {
      '200': {}
    }
  })
  async find() {
    const data = await this.schoolClassRepository.find({
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
  @get('/school-classes/{id}', {
    summary: 'Get SchoolClass by id API Endpoint',
    responses: {
      '200': {}
    }
  })
  async findById(
    @param.path.string('id') id: string,
  ) {
    const data = await this.schoolClassRepository.findOne({
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
  @patch('/school-classes/{id}', {
    summary: 'Update class API Endpoint',
    responses: {
      '200': {}
    }
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            // required: ['name'],
            properties: {
              name: {
                type: 'string',
              },
            }
          }
        },
      },
    })
    payload: {
      name: 'string',
    }
  ) {
    const data = await this.schoolClassRepository.findOne({
      where: {
        id,
        isDeleted: false
      }
    });

    if (data) {
      const result = await this.schoolClassRepository.updateById(data.id, payload);
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
  @del('/school-classes/{id}', {
    summary: 'Delete class by id API Endpoint',
    responses: {
      '200': {},
    },
  })
  async deleteById(@param.path.string('id') id: string) {
    return await this.schoolClassRepository.updateById(id, {isDeleted: true})
      .then(result => {
        return {
          statusCode: 200,
          message: 'Deleted Successfully',
          result,
        };
      }).catch(err => {
        return {
          statusCode: 400,
          message: 'Class Not Found',
        }
      });
  }
}
