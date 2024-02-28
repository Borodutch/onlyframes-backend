import { IsUUID } from 'amala'

export default class AccessToken {
  @IsUUID()
  token!: string
}
