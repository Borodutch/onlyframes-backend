import authenticate from '@/middleware/authenticate'
import PersistentFile from '@/models/PersistentFile'
import { badRequest } from '@hapi/boom'
import { Controller, Ctx, File, Flow, Get, Post } from 'amala'
import { copyFileSync, unlinkSync } from 'fs'
import { Context } from 'koa'
import { resolve } from 'path'
import { cwd } from 'process'

@Controller('/')
export default class LoginController {
  @Get('/')
  async root(@Ctx() ctx: Context) {
    ctx.redirect('https://app.onlyframes.xyz')
    return 'Redirecting to https://app.onlyframes.xyz...'
  }

  @Post('/upload')
  @Flow(authenticate)
  async upload(
    @Ctx() ctx: Context,
    @File() files: Record<string, PersistentFile>
  ) {
    const file = files['file']
    if (!file) {
      return ctx.throw(badRequest('No file uploaded'))
    }
    if (Array.isArray(file)) {
      return ctx.throw(badRequest('Only one file is allowed'))
    }
    // The size of the image must be < 10 MB.
    // The type of image must be jpg, png or gif.
    if (file.size > 10 * 1024 * 1024) {
      return ctx.throw(badRequest('The size of the image must be < 10 MB'))
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!file.mimetype || !allowedTypes.includes(file.mimetype)) {
      return ctx.throw(badRequest('The type of image must be jpg, png or gif'))
    }
    // Save file to uploads folder
    const fileName = `${new Date().getTime()}-${file.originalFilename}`
    copyFileSync(file.filepath, resolve(cwd(), 'uploads', fileName))
    unlinkSync(file.filepath)
  }
}
