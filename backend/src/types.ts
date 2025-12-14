import type { FastifyError, FastifySchemaValidationError } from 'fastify'
import type { SchemaErrorDataVar } from 'fastify/types/schema.js'
import { Type as T, type Static } from '@sinclair/typebox'

export class ValidationProblem extends Error implements FastifyError {
  public readonly name = 'ValidationError'
  public readonly code = 'FST_ERR_VALIDATION'
  public readonly statusCode = 400
  public readonly validation: FastifySchemaValidationError[]
  public readonly validationContext: SchemaErrorDataVar

  constructor(
    message: string,
    errs: FastifySchemaValidationError[],
    ctx: SchemaErrorDataVar,
    options?: ErrorOptions
  ) {
    super(message, options)
    this.validation = errs
    this.validationContext = ctx
  }
}

export const ProblemDetails = T.Object(
  {
    type: T.String({ default: 'about:blank' }),
    title: T.String(),
    status: T.Integer({ minimum: 100, maximum: 599 }),
    detail: T.Optional(T.String()),
    instance: T.Optional(T.String()),
    errorsText: T.Optional(T.String())
  },
  { additionalProperties: true }
)
export type ProblemDetails = Static<typeof ProblemDetails>

export const User = T.Object({
  id: T.String(),
  email: T.String({ format: 'email' }),
  name: T.Optional(T.String())
})
export type User = Static<typeof User>

export const Health = T.Object({
  ok: T.Boolean()
})
export type Health = Static<typeof Health>
