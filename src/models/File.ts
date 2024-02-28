import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose'

@modelOptions({
  schemaOptions: { timestamps: true },
})
export class File {
  @prop({ index: true, required: true })
  uploaderFID!: number
  @prop({ index: true, required: true })
  tokenAddress!: string
  @prop({ index: true })
  tokenId?: string
}

export const FileModel = getModelForClass(File)
