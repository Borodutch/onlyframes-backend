import getImage from '@/helpers/getImage'
import { AccessTokenModel } from '@/models/AccessToken'
import { FileModel } from '@/models/File'
import AccessToken from '@/validators/AccessToken'
import Address from '@/validators/Address'
import ErrorText from '@/validators/ErrorText'
import FileId from '@/validators/FileId'
import { Controller, Get, Params } from 'amala'
import { createReadStream } from 'fs'
import { resolve } from 'path'
import { cwd } from 'process'

@Controller('/images')
export default class ImagesController {
  @Get('/connect-account')
  connectAccount() {
    return getImage(`OnlyFrames

Connect a wallet that owns this token to your Farcaster account to see the file!`)
  }

  @Get('/not-found/:fileId')
  notFound(@Params() { fileId }: FileId) {
    return getImage(`OnlyFrames
    
File ID: ${fileId}
Not found!`)
  }

  @Get('/token/:token')
  async token(@Params() { token }: AccessToken) {
    const dbToken = await AccessTokenModel.findOne({ uuid: token })
    if (!dbToken) {
      return getImage(`OnlyFrames

Token not found!`)
    }
    const file = await FileModel.findById(dbToken.file)
    if (!file) {
      return getImage(`OnlyFrames

File not found!`)
    }
    return createReadStream(
      resolve(cwd(), 'uploads', `${file.id}.${file.extension}`)
    )
  }

  @Get('/not-owner/:fileId/:address')
  async nowOwner(@Params() { fileId, address }: FileId & Address) {
    const file = await FileModel.findById(fileId)
    if (!file) {
      return getImage(`File ID: ${fileId}
      Not found!`)
    }
    return getImage(`OnlyFrames
    
File ID: ${fileId}
Network: ${file.network}
Token address: ${file.tokenAddress}${file.tokenId ? `\nTokend ID: ${file.tokenId}` : ''}
Your address: ${address}

Seems like you don't own this token! Make sure to acquire it.`)
  }

  @Get('/error/:fileId/:address/:errorText')
  async error(
    @Params() { fileId, address, errorText }: FileId & Address & ErrorText
  ) {
    return getImage(`OnlyFrames
    
File ID: ${fileId}
Your address: ${address}

Error: ${errorText}`)
  }

  @Get('/:fileId')
  async getInitialFrame(@Params() { fileId }: FileId) {
    const file = await FileModel.findById(fileId)
    if (!file) {
      return getImage(`File ID: ${fileId}
      Not found!`)
    }
    return getImage(`OnlyFrames

File ID: ${fileId}
Network: ${file.network}
Token address: ${file.tokenAddress}${file.tokenId ? `\nTokend ID: ${file.tokenId}` : ''}

Press "Reveal" to see the file if you own the token above!`)
  }
}
