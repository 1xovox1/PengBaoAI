import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const distHtml = readFileSync(resolve(dist, 'index.html'), 'utf8')

const jsMatch = distHtml.match(/src="([^"]+\.js)"/)
const cssMatch = distHtml.match(/href="([^"]+\.css)"/)

if (!jsMatch) {
  throw new Error('Could not find JS asset in dist/index.html')
}

const jsPath = jsMatch[1]
const cssPath = cssMatch?.[1]

const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>鹏宝AI - 智能对话平台</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module">
      if (location.hostname.endsWith('github.io')) {
        ${cssPath ? `const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = '${cssPath}'
        document.head.appendChild(link)` : ''}
        await import('${jsPath}')
      } else {
        await import('/src/main.js')
      }
    </script>
  </body>
</html>
`

function copyDir(from, to) {
  if (existsSync(to)) {
    rmSync(to, { recursive: true, force: true })
  }
  cpSync(from, to, { recursive: true })
}

copyDir(resolve(dist, 'assets'), resolve(root, 'assets'))
mkdirSync(resolve(root, 'docs'), { recursive: true })
copyDir(dist, resolve(root, 'docs'))

writeFileSync(resolve(root, 'index.html'), indexHtml, 'utf8')
writeFileSync(resolve(root, '404.html'), readFileSync(resolve(dist, '404.html'), 'utf8'), 'utf8')
writeFileSync(resolve(root, '.nojekyll'), '', 'utf8')
writeFileSync(resolve(root, 'docs/.nojekyll'), '', 'utf8')

console.log('Synced GitHub Pages assets to /assets and /docs')
console.log('Updated index.html with production entry:', jsPath)
