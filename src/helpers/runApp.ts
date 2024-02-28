import Koa from 'koa'
import Router from 'koa-router'
import cors from '@koa/cors'
import { Server } from 'http'
import { bootstrapControllers } from 'amala'
import { resolve } from 'path'
import env from '@/helpers/env'
import KoaLogger from 'koa-logger'

const app = new Koa()

export default async function () {
  app.use(KoaLogger())
  const router = new Router()
  await bootstrapControllers({
    app,
    basePath: '/',
    controllers: [resolve(__dirname, '../controllers/*')],
    disableVersioning: true,
    router,
  })
  app.use(cors({ origin: '*' }))
  app.use(router.routes())
  app.use(router.allowedMethods())
  return new Promise<Server>((resolve, reject) => {
    const connection = app
      .listen(env.PORT)
      .on('listening', () => {
        console.log(`HTTP is listening on ${env.PORT}`)
        resolve(connection)
      })
      .on('error', reject)
  })
}
