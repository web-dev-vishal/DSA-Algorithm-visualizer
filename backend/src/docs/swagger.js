export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'AlgoViz API Documentation',
    version: '1.0.0',
    description: 'Production-ready REST API endpoints for the DSA Algorithm Visualizer platform.'
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API version 1 root'
    }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description: 'PASETO access token stored in secure signed cookies'
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'PASETO',
        description: 'Provide access token as Bearer authorization header'
      }
    },
    schemas: {
      StandardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Request Successful' },
          data: { type: 'object' },
          meta: { type: 'object' },
          errors: { type: 'array', items: { type: 'object' } }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'user_123' },
          name: { type: 'string', example: 'Alex Johnson' },
          email: { type: 'string', example: 'alex@algoviz.pro' },
          role: { type: 'string', example: 'member' },
          plan: { type: 'string', example: 'free' },
          avatar: { type: 'string', example: 'https://api.dicebear.com/avatar.svg' },
          emailVerified: { type: 'boolean', example: true }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Alex Johnson' },
                  email: { type: 'string', example: 'alex@algoviz.pro' },
                  password: { type: 'string', example: 'securePassword123' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StandardResponse' }
              }
            }
          }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate credentials',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'alex@algoviz.pro' },
                  password: { type: 'string', example: 'securePassword123' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful, returns cookies and access token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StandardResponse' }
              }
            }
          }
        }
      }
    },
    '/analyze': {
      post: {
        summary: 'Analyze DSA source code',
        tags: ['DSA Analysis'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'language'],
                properties: {
                  code: { type: 'string', example: 'void bubbleSort(...) {...}' },
                  language: { type: 'string', example: 'C++' },
                  array: { type: 'array', items: { type: 'integer' }, example: [5, 3, 8, 1, 2] }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Analysis mapping and step states returned',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StandardResponse' }
              }
            }
          }
        }
      }
    }
  }
};

export default swaggerSpec;
