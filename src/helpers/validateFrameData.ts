import farcaster from '@/helpers/farcaster'

export default async function (messageBytes: string) {
  const response = await farcaster.validateMessage(messageBytes)
  if (!response.valid) {
    throw new Error('Invalid signature')
  }
  return response
}
