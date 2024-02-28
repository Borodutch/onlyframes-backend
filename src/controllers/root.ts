import env from '@/helpers/env'
import getFrame from '@/helpers/getFrame'
import validateFrameData from '@/helpers/validateFrameData'
import authenticate from '@/middleware/authenticate'
import { FileModel } from '@/models/File'
import PersistentFile from '@/models/PersistentFile'
import FileId from '@/validators/FileId'
import FrameAction from '@/models/FrameAction'
import { badRequest } from '@hapi/boom'
import { Body, Controller, Ctx, File, Flow, Get, Params, Post } from 'amala'
import { copyFileSync, unlinkSync } from 'fs'
import { Context } from 'koa'
import { resolve } from 'path'
import { cwd } from 'process'
import neynar from '@/helpers/neynar'
import checkOwnership from '@/helpers/checkOwnership'
import { AccessTokenModel } from '@/models/AccessToken'
import { v4 as uuid } from 'uuid'

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
    // TODO: report to telegram
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
  async getTrueFrame(
    @Params() { fileId }: FileId,
    @Body({ required: true })
    { trustedData: { messageBytes } }: FrameAction,
    @Ctx() ctx: Context
  ) {
    const file = await FileModel.findById(fileId)
    if (!file) {
      return getFrame(`${env.BACKEND}/images/not-found/${fileId}`)
    }
    // Validate data
    const data = await validateFrameData(messageBytes)
    if (!data.valid) {
      return ctx.throw(badRequest('Invalid data'))
    }
    const fid = data.message.data.fid
    // Get user for this fid
    const {
      result: { user },
    } = await neynar.lookupUserByFid(fid)
    if (!user) {
      return ctx.throw(badRequest('No user found'))
    }
    const address = user.verifications[0]
    if (!address) {
      return getFrame(`${env.BACKEND}/images/connect-account`)
    }
    try {
      const isOwner = await checkOwnership(file, address)
      if (!isOwner) {
        // TODO: add blockchain explorer link
        return getFrame(`${env.BACKEND}/images/not-owner/${fileId}/${address}`)
      }
      // Create access token
      const accessToken = await AccessTokenModel.create({
        file,
        uuid: uuid(),
      })
      // Return the file
      // TODO: add report button
      // TODO: fix aspect ratio
      return getFrame(`${env.BACKEND}/images/token/${accessToken.uuid}`)
    } catch (error) {
      const errorText = error instanceof Error ? error.message : `${error}`
      console.error(errorText)
      return getFrame(
        `${env.BACKEND}/images/error/${fileId}/${address}/${errorText}`
      )
    }
  }

  // TODO: add report endpoint
}
