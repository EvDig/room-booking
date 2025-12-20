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

// --- DTO: ROOMS ---
const RoomStatus = T.Union([
  T.Literal('available'),
  T.Literal('reserved'),
  T.Literal('maintenance')
])

const Room = T.Object({
  id: T.String(),
  code: T.String(),
  name: T.String(),
  capacity: T.Integer(),
  equipment: T.Array(T.String()),
  status: RoomStatus,
  note: T.Optional(T.String())
})

const RoomsResponse = T.Object({
  items: T.Array(Room),
  total: T.Integer(),
  page: T.Integer()
})

// --- DTO: BOOKINGS ---
const Booking = T.Object({
  id: T.String(),
  title: T.String(),
  start: T.String({ format: 'date-time' }),
  end: T.String({ format: 'date-time' }),
  roomId: T.String(),
  room: T.Optional(T.Object({
    code: T.String(),
    name: T.String()
  }))
})

const CreateBookingRequest = T.Object({
  title: T.String(),
  start: T.String({ format: 'date-time' }),
  end: T.String({ format: 'date-time' }),
  roomId: T.String()
})

// --- DTO: STATISTICS ---
const StatisticsResponse = T.Object({
  totalRooms: T.Integer(),
  activeBookings: T.Integer(),
  availableRooms: T.Integer(),
  totalEquipment: T.Integer()
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
  await app.register(cors, { origin: true })

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    enableDraftSpec: true,
    errorResponseBuilder(request, ctx) {
      const seconds = Math.ceil(ctx.ttl / 1000)
      return {
        type: 'about:blank',
        title: 'Too Many Requests',
        status: 429,
        detail: `Retry in ${seconds} s.`,
        instance: request.url
      } satisfies ProblemDetails
    }
  })

  await app.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: { title: 'Rooms API', version: '1.0.0' },
      servers: [{ url: 'http://localhost' }],
      tags: [
        { name: 'Rooms', description: 'Catalog' },
        { name: 'Bookings', description: 'Reservations' },
        { name: 'Stats', description: 'Dashboard stats' }
      ]
    }
  })

  await app.register(prismaPlugin)

  app.setErrorHandler<FastifyError | ValidationProblem>((err, req, reply) => {
    const status = typeof err.statusCode === 'number' ? err.statusCode : 500
    if (status >= 500) req.log.error(err)

    reply.code(status).type('application/problem+json').send({
      type: 'about:blank',
      title: STATUS_CODES[status] ?? 'Error',
      status,
      detail: err.message || 'Error',
      instance: req.url
    })
  })

  app.setNotFoundHandler((req, reply) => {
    reply.code(404).send({ status: 404, title: 'Not Found', type: 'about:blank' })
  })

  app.get('/api/rooms', {
    schema: {
      tags: ['Rooms'],
      querystring: T.Object({
        page: T.Optional(T.Integer({ minimum: 1, default: 1 })),
        limit: T.Optional(T.Integer({ minimum: 1, maximum: 100, default: 20 })),
        q: T.Optional(T.String()),
        status: T.Optional(T.String())
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
  }, async (req) => {
    const { page = 1, limit = 20, q, status } = req.query;
    const now = new Date();

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { code: { contains: q, mode: 'insensitive' } }
      ];
    }
    const rawItems = await app.prisma.room.findMany({
      where,
      orderBy: { code: 'asc' },
      include: {
        bookings: {
          where: {
            start: { lte: now },
            end: { gte: now }
          }
        }
      }
    });

    let items = rawItems.map(room => {
      let computedStatus = room.status;
      if (room.bookings.length > 0 && room.status !== 'maintenance') {
        computedStatus = 'reserved';
      }
      const { bookings, ...cleanRoom } = room;
      return { ...cleanRoom, status: computedStatus };
    });

    if (status) {
      items = items.filter(room => room.status === status);
    }

    const total = items.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = items.slice(startIndex, endIndex);

    return { items: paginatedItems, total, page };
  })

  // GET /api/health
  app.get('/api/health', async () => {
    await app.prisma.$queryRaw`SELECT 1`
    return { ok: true }
  })

  // GET /openapi.json
  app.get('/openapi.json', { schema: { hide: true } }, async (req, reply) => {
    reply.send(app.swagger())
  })

  app.get('/api/statistics', {
    schema: {
      tags: ['Stats'],
      summary: 'Dashboard statistics',
      response: { 200: StatisticsResponse }
    }
  }, async (req) => {
    const now = new Date();

    const totalRooms = await app.prisma.room.count();

    const activeBookings = await app.prisma.booking.count({
      where: {
        AND: [
          { start: { lte: now } },
          { end: { gte: now } }
        ]
      }
    });

    const allEquipment = await app.prisma.room.findMany({
      select: { equipment: true }
    });
    const totalEquipment = allEquipment.reduce((acc, r) => acc + r.equipment.length, 0);

    return {
      totalRooms,
      activeBookings,
      availableRooms: totalRooms - activeBookings,
      totalEquipment
    };
  })

  app.get('/api/bookings', {
    schema: {
      tags: ['Bookings'],
      response: { 200: T.Array(Booking) }
    }
  }, async () => {
    const bookings = await app.prisma.booking.findMany({
      orderBy: { start: 'desc' },
      include: {
        room: { select: { code: true, name: true } }
      }
    });

    return bookings.map(b => ({
      ...b,
      start: b.start.toISOString(),
      end: b.end.toISOString()
    }))
  })


  app.post('/api/bookings', {
    schema: {
      tags: ['Bookings'],
      body: CreateBookingRequest,
      response: {
        201: Booking,
        409: ProblemDetails
      }
    }
  }, async (req, reply) => {
    const { title, start, end, roomId } = req.body;
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate >= endDate) {
      throw new ValidationProblem('Начало должно быть раньше конца', [], 'body');
    }

    const conflicts = await app.prisma.booking.count({
      where: {
        roomId: roomId,
        AND: [
          { start: { lt: endDate } },
          { end: { gt: startDate } }
        ]
      }
    });

    if (conflicts > 0) {
      return reply.code(409).send({
        type: 'about:blank',
        title: 'Conflict',
        status: 409,
        detail: 'Выбранное время пересекается с существующим бронированием',
        instance: req.url
      });
    }

    const newBooking = await app.prisma.booking.create({
      data: {
        title,
        start: startDate,
        end: endDate,
        roomId
      },
      include: {
        room: { select: { code: true, name: true } }
      }
    });

    return reply.code(201).send({
      ...newBooking,
      start: newBooking.start.toISOString(),
      end: newBooking.end.toISOString()
    });
  })

  app.delete('/api/bookings/:id', {
    schema: {
      tags: ['Bookings'],
      params: T.Object({ id: T.String() }),
      response: { 204: T.Null() }
    }
  }, async (req, reply) => {
    const { id } = req.params;

    try {
      await app.prisma.booking.delete({ where: { id } });
    } catch (e) {
    }

    return reply.code(204).send();
  })

  return app
}
