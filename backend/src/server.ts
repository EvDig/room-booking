import { buildApp } from './app.js'

async function main() {
  let app: Awaited<ReturnType<typeof buildApp>> | undefined

  try {
    app = await buildApp()

    const port = Number(process.env.PORT ?? 3000)
    const host = '0.0.0.0'

    let closing = false
    const shutdown = async (reason: string, err?: unknown) => {
      if (closing) return
      closing = true

      if (app) {
        if (err) app.log.fatal({ err }, `fatal: ${reason}`)
        else app.log.info({ reason }, 'Shutting down...')

        try {
          await app.close()
        } finally {
          process.exit(err ? 1 : 0)
        }
      } else {
        process.exit(1)
      }
    }

    process.once('SIGINT', () => void shutdown('SIGINT'))
    process.once('SIGTERM', () => void shutdown('SIGTERM'))
    process.once('unhandledRejection', (reason) => void shutdown('unhandledRejection', reason))
    process.once('uncaughtException', (error) => void shutdown('uncaughtException', error))

    await app.listen({ port, host })

  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Failed to start application:', error.message)
    process.exit(1)
  }
}

void main()
