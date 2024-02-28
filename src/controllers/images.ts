import getImage from '@/helpers/getImage'
import { FileModel } from '@/models/File'
import FileId from '@/validators/FileId'
import { Controller, Get, Params } from 'amala'

@Controller('/images')
export default class ImagesController {
  @Get('/not-found/:fileId')
  async notFound(@Params() { fileId }: FileId) {
    return getImage(`OnlyFrames
    
File ID: ${fileId}
Not found!`)
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
Token Address: ${file.tokenAddress}${file.tokenId ? `\nTokend ID: ${file.tokenId}` : ''}

Press "Reveal" to see the file if you own the token above!`)
  }
}
