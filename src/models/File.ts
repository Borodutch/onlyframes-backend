import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose'
import Network from '@/models/Network'

@modelOptions({
  schemaOptions: { timestamps: true },
})
export class File {
  @prop({ index: true, required: true })
  uploaderFID!: number
  @prop({ index: true, required: true, enum: Network })
  network!: Network
  @prop({ index: true, required: true })
  extension!: string
  @prop({ index: true, required: true })
  tokenAddress!: string
  @prop({ index: true })
  tokenId?: string
}

export const FileModel = getModelForClass(File)
