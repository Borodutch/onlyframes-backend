import env from '@/helpers/env'

function buttons(fileId?: string) {
  if (fileId) {
    return `
<meta property="fc:frame:button:1" content="Reveal 🙏" />
<meta property="fc:frame:state" content="${JSON.stringify({ fileId })}" />
<meta property="fc:frame:button:2" content="Create OnlyFrame" />
<meta property="fc:frame:button:2:action" content="link" />
<meta property="fc:frame:button:2:target" content="https://app.onlyframes.xyz" />
<meta property="fc:frame:post_url" content=${env.BACKEND}/${fileId}" />
`
  } else {
    return `
<meta property="fc:frame:button:1" content="Create OnlyFrame" />
<meta property="fc:frame:button:1:action" content="link" />
<meta property="fc:frame:button:1:target" content="https://app.onlyframes.xyz" />
`
  }
}

export default function (imageUrl: string, fileId?: string) {
  return `<!DOCTYPE html>
<html lang="en">

<head>
  <!-- Required meta tags -->
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Token-gated frames">
  <title>OnlyFrames</title>

  <!-- Frame -->
  <meta property="fc:frame" content="vNext" />
  <meta property="og:image" content="https://app.onlyframes.xyz/images/og.jpg" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  ${buttons(fileId)}

  <!-- Redirect -->
  <script>
    window
      .location
      .replace('https://app.onlyframes.xyz');
  </script>
</head>

<body>
  <h1>OnlyFrames</h1>
  <h2>Token-gated frames</h2>
</body>

</html>`
}
