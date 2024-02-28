import env from '@/helpers/env'
import getFrame from '@/helpers/getFrame'
import authenticate from '@/middleware/authenticate'
import { FileModel } from '@/models/File'
import PersistentFile from '@/models/PersistentFile'
import FileId from '@/validators/FileId'
import { badRequest } from '@hapi/boom'
import { Controller, Ctx, File, Flow, Get, Params, Post } from 'amala'
import { copyFileSync, unlinkSync } from 'fs'
import { Context } from 'koa'
import { resolve } from 'path'
import { cwd } from 'process'

@Controller('/')
export default class RootController {
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
    const { network, tokenaddress: tokenAddress, id } = ctx.req.headers
    if (!network || !tokenAddress) {
      return ctx.throw(badRequest('Network and token address are required'))
    }
    if (Array.isArray(network) || Array.isArray(tokenAddress)) {
      return ctx.throw(badRequest('Network and token address must be strings'))
    }
    if (id && Array.isArray(id)) {
      return ctx.throw(badRequest('ID must be a string'))
    }
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
    // Get extension
    const extension = file.mimetype.split('/')[1]
    // Create a new file in the database
    const dbFile = await FileModel.create({
      uploaderFID: ctx.state['fid'],
      network,
      tokenAddress,
      tokenId: id,
      extension,
    })
    // Save file to uploads folder
    const fileName = `${dbFile.id}.${extension}`
    copyFileSync(file.filepath, resolve(cwd(), 'uploads', fileName))
    unlinkSync(file.filepath)
    // Return the file id
    return {
      id: dbFile.id,
    }
  }

  @Get('/:fileId')
  async getInitialFrame(@Params() { fileId }: FileId) {
    const file = await FileModel.findById(fileId)
    if (!file) {
      return getFrame(`${env.BACKEND}/images/not-found/${fileId}`)
    }
    return getFrame(`${env.BACKEND}/images/${fileId}`, fileId)
  }

  @Post('/:fileId')
  async getTrueFrame(@Params() { fileId }: FileId) {
    const file = await FileModel.findById(fileId)
    if (!file) {
      return getFrame(`https://${env.BACKEND}/images/not-found/${fileId}`)
    }
    // TODO: check ownership
    // TODO: return real file (+ report button)
    // TODO: return placeholder if not owned (+ link to chain explorer)
  }
}
