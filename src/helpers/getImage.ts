import { resolve } from 'path'
import { cwd } from 'process'
import { UltimateTextToImage, registerFont } from 'ultimate-text-to-image'

registerFont(resolve(cwd(), 'fonts', 'KodeMono-Regular.ttf'))

export default async function (text: string) {
  const root = new UltimateTextToImage(text, {
    fontFamily: 'KodeMono',
    fontSize: 30,
    margin: 20,
    width: 955,
    height: 500,
    backgroundColor: '#603cba',
    fontColor: '#ffffff',
  })
  return root.render().toStream()
}
