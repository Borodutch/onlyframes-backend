import { IsMongoId } from 'amala'

export default class FileId {
  @IsMongoId()
  fileId!: string
}
