import { IsEthereumAddress } from 'amala'

export default class Address {
  @IsEthereumAddress()
  address!: string
}
