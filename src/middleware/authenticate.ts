import neynar from '@/helpers/neynar'
import { UserModel } from '@/models/User'
import { Next, ParameterizedContext } from 'koa'
import { recoverMessageAddress } from 'viem'

export default async function (ctx: ParameterizedContext, next: Next) {
  const signature = ctx.request.headers['signature']
  const message = ctx.request.headers['message']
  // Check if signature or message is missing or invalid
  if (
    !signature ||
    Array.isArray(signature) ||
    !/^0x[a-fA-F0-9]+$/.test(signature) ||
    !message ||
    Array.isArray(message)
  ) {
    return ctx.throw(401, 'Unauthorized')
  }
  // Check if signature is valid and recover the address
  const address = await recoverMessageAddress({
    message,
    signature: signature as `0x${string}`,
  })
  // Get fid
  let fid = 0
  try {
    fid = (await neynar.lookupUserByVerification(address)).result.user.fid
  } catch (error) {
    return ctx.throw(
      401,
      'Make sure you have connected the address to Farcaster! '
    )
  }
  // Get user
  let user = await UserModel.findOne({ fid })
  if (!user) {
    // User doesn't exist, create a new one
    user = await UserModel.create({ fid })
  }
  // Check if banned
  if (user.banned) {
    return ctx.throw(403, 'You are banned')
  }
  // Add to ctx
  ctx.state['address'] = address
  ctx.state['fid'] = fid
  // Finish
  return next()
}
