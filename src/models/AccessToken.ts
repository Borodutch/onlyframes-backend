import {
  Ref,
  getModelForClass,
  index,
  modelOptions,
  prop,
} from '@typegoose/typegoose'
import { File } from '@/models/File'

@modelOptions({
  schemaOptions: { timestamps: true },
})
@index({ createdAt: 1 }, { expireAfterSeconds: 600 })
export class AccessToken {
  @prop({ index: true, required: true })
  uuid!: string
  @prop({ required: true, ref: File })
  file!: Ref<File>
}

export const AccessTokenModel = getModelForClass(AccessToken)
