import { IsString } from 'amala'

export default class File {
  @IsString()
  filename!: string
}
