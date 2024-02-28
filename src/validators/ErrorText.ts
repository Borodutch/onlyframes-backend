import { IsString } from 'amala'

export default class ErrorText {
  @IsString()
  errorText!: string
}
