import { mkdir, readdir, copyFile } from 'node:fs/promises'
import path from 'node:path'

const distEmailsDir = path.join(process.cwd(), 'dist', 'src', 'emails')
const srcEmailsDir = path.join(process.cwd(), 'src', 'emails')

await mkdir(srcEmailsDir, { recursive: true })

const files = await readdir(distEmailsDir)

const jsFiles = files.filter((file) => file.endsWith('.js'))

await Promise.all(
  jsFiles.map(async (file) => {
    await copyFile(
      path.join(distEmailsDir, file),
      path.join(srcEmailsDir, file)
    )
  })
)