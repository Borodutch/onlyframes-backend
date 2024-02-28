import { NeynarAPIClient } from '@neynar/nodejs-sdk'
import env from '@/helpers/env'

export default new NeynarAPIClient(env.NEYNAR_API_KEY)
