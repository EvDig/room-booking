import Fastify, { type FastifyError } from 'fastify'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import { STATUS_CODES } from 'node:http'
import prismaPlugin from './plugins/prisma.js'
import { Type as T } from '@sinclair/typebox'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { ValidationProblem, ProblemDetails, User, Health } from './types.js'

// --- НОВЫЕ СХЕМЫ (ROOMS) ---

// Enum статусов (для документации и валидации)
const RoomStatus = T.Union([
  T.Literal('available'),
  T.Literal('reserved'),
  T.Literal('maintenance')
])

// Модель Аудитории (DTO), которую отдаем на фронт
const Room = T.Object({
  id: T.String(),
  code: T.String(),
  name: T.String(),
  capacity: T.Integer(),
  equipment: T.Array(T.String()),
  status: RoomStatus,
  note: T.Optional(T.String())
})

// Ответ c пагинацией (как в нашем roomsApi.ts на фронте)
const RoomsResponse = T.Object({
  items: T.Array(Room),
  total: T.Integer(),
  page: T.Integer()
})


export async function buildApp() {
  const app = Fastify({
    logger: true,
    trustProxy: true,
    schemaErrorFormatter(errors, dataVar) {
      const msg = errors.map((e) => e.message).filter(Boolean).join('; ') || 'Validation failed'
      return new ValidationProblem(msg, errors, dataVar)
    }
  }).withTypeProvider<TypeBoxTypeProvider>()

  await app.register(helmet)
  // Включаем CORS, чтобы фронтенд мог стучаться к нам (даже через Nginx полезно, плюс для локальной отладки)
  await app.register(cors, { origin: true })

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    enableDraftSpec: true,
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true
    },
    errorResponseBuilder(request, ctx) {
      const seconds = Math.ceil(ctx.ttl / 1000)
      return {
        type: 'about:blank',
        title: 'Too Many Requests',
        status: 429,
        detail: `Rate limit exceeded. Retry in ${seconds} seconds.`,
        instance: request.url
      } satisfies ProblemDetails
    }
  })

  await app.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'Rooms API',
        version: '1.0.0',
        description: 'HTTP-API'
      },
      servers: [{ url: 'http://localhost' }],
      tags: [
        { name: 'Rooms', description: 'Room catalog operations' }, // <-- Добавили тег
        { name: 'Users', description: 'User management' },
        { name: 'System', description: 'System endpoints' }
      ]
    }
  })

  await app.register(prismaPlugin)

  // Error Handler
  app.setErrorHandler<FastifyError | ValidationProblem>((err, req, reply) => {
    const status = typeof err.statusCode === 'number' ? err.statusCode : 500
    const isValidation = err instanceof ValidationProblem

    // Логируем ошибку, если это не обычная валидация
    if (status >= 500) {
      req.log.error(err)
    }

    const problem = {
      type: 'about:blank',
      title: STATUS_CODES[status] ?? 'Error',
      status,
      detail: err.message || 'Unexpected error',
      instance: req.url,
      ...(isValidation ? { errorsText: err.message } : {})
    }

    reply.code(status).type('application/problem+json').send(problem)
  })

  app.setNotFoundHandler((request, reply) => {
    reply.code(404).type('application/problem+json').send({
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
      detail: `Route ${request.method} ${request.url} not found`,
      instance: request.url
    } satisfies ProblemDetails)
  })

  // --- МАРШРУТЫ (ROUTES) ---

  // 1. GET /api/rooms - Получить список аудиторий
  app.get('/api/rooms', {
    schema: {
      operationId: 'listRooms',
      tags: ['Rooms'],
      summary: 'Get list of rooms',
      // Описываем query-параметры (например, страница)
      querystring: T.Object({
        page: T.Optional(T.Integer({ minimum: 1, default: 1 })),
        limit: T.Optional(T.Integer({ minimum: 1, maximum: 100, default: 20 }))
      }),
      response: {
        200: {
          description: 'Paginated list of rooms',
          content: { 'application/json': { schema: RoomsResponse } }
        },
        500: {
          description: 'Server Error',
          content: { 'application/problem+json': { schema: ProblemDetails } }
        }
      }
    }
  }, async (req, reply) => {
    const { page = 1, limit = 20 } = req.query;

    // Считаем пропуск для пагинации
    const skip = (page - 1) * limit;

    // Параллельный запрос: получить items и общее кол-во (total)
    const [items, total] = await app.prisma.$transaction([
      app.prisma.room.findMany({
        skip,
        take: limit,
        orderBy: { code: 'asc' } // Сортируем по номеру (101, 102...)
      }),
      app.prisma.room.count()
    ]);

    // Возвращаем результат по нашей схеме
    return {
      items,
      total,
      page
    };
  })


  // GET /api/users
  app.get('/api/users', {
    schema: {
      operationId: 'listUsers',
      tags: ['Users'],
      summary: 'Get users',
      response: {
        200: {
          description: 'List of users',
          content: { 'application/json': { schema: T.Array(User) } }
        },
        500: {
          description: 'Server Error',
          content: { 'application/problem+json': { schema: ProblemDetails } }
        }
      }
    }
  }, async (_req, _reply) => {
    return app.prisma.user.findMany({ select: { id: true, email: true, name: true } })
  })

  // GET /api/health
  app.get('/api/health', {
    schema: {
      operationId: 'health',
      tags: ['System'],
      summary: 'Health check',
      response: {
        200: {
          description: 'Ready',
          content: { 'application/json': { schema: Health } }
        },
        503: {
          description: 'Unavailable',
          content: { 'application/problem+json': { schema: ProblemDetails } }
        }
      }
    }
  }, async (_req, reply) => {
    try {
      await app.prisma.$queryRaw`SELECT 1`
      return { ok: true } as Health
    } catch {
      reply.code(503).type('application/problem+json').send({
        type: 'about:blank',
        title: 'Service Unavailable',
        status: 503,
        detail: 'Database ping failed',
        instance: '/api/health'
      } satisfies ProblemDetails)
    }
  })

  app.get('/openapi.json', {
    schema: { hide: true, tags: ['Internal'] }
  }, async (_req, reply) => {
    reply.type('application/json').send(app.swagger())
  })

  return app
}
