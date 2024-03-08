import { File } from '@/models/File'
import { createPublicClient, http, parseAbi } from 'viem'
import { base, gnosis, mainnet, polygon, zora } from 'viem/chains'
import env from '@/helpers/env'

const sdk = require('api')('@poap/v1.0#1gzkyq36ltik2tvj')
sdk.auth(env.POAP_API_KEY)

const mainnetPublicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})
const basePublicClient = createPublicClient({
  chain: base,
  transport: http(),
})
const polygonPublicClient = createPublicClient({
  chain: polygon,
  transport: http(),
})
const zoraPublicClient = createPublicClient({
  chain: zora,
  transport: http(),
})
const gnosisPublicClient = createPublicClient({
  chain: gnosis,
  transport: http(),
})

export default async function (file: File, address: string) {
  const parameters = file.tokenId
    ? {
        address: file.tokenAddress as `0x${string}`,
        functionName: 'balanceOf',
        args: [address, file.tokenId],
        abi: parseAbi([
          'function balanceOf(address owner, uint256 tokenId) view returns (uint256)',
        ]),
      }
    : {
        address: file.tokenAddress as `0x${string}`,
        functionName: 'balanceOf',
        args: [address],
        abi: parseAbi([
          'function balanceOf(address owner) view returns (uint256)',
        ]),
      }
  let balance = 0
  if (file.network === 'mainnet') {
    balance = (await mainnetPublicClient.readContract({
      ...parameters,
    } as any)) as number
  } else if (file.network === 'base') {
    balance = (await basePublicClient.readContract({
      ...parameters,
    } as any)) as number
  } else if (file.network === 'polygon') {
    balance = (await polygonPublicClient.readContract({
      ...parameters,
    } as any)) as number
  } else if (file.network === 'zora') {
    balance = (await zoraPublicClient.readContract({
      ...parameters,
    } as any)) as number
  } else if (file.network === 'gnosis') {
    balance = (await gnosisPublicClient.readContract({
      ...parameters,
    } as any)) as number
  } else if (file.network === 'poap') {
    try {
      const result = await sdk.gETActionsScan({
        address,
        eventId: file.tokenId,
      })
      console.log(result)
    } catch (error) {
      console.log(
        'POAP balance check error',
        error instanceof Error ? error.message : error
      )
    }
  }
  return balance > 0
}
