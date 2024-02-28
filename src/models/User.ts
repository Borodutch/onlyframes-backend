import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose'

@modelOptions({
  schemaOptions: { timestamps: true },
})
export class User {
  @prop({ index: true, required: true })
  fid!: number
  @prop({ index: true, required: true, default: false })
  banned!: boolean
}

export const UserModel = getModelForClass(User)
