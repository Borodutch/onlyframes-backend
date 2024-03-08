import { File } from '@/models/File'
import { createPublicClient, http, parseAbi } from 'viem'
import { base, mainnet, polygon, zora } from 'viem/chains'

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
  }
  return balance > 0
}
