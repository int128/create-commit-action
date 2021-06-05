import * as glob from '@actions/glob'
import { promises as fs } from 'fs'
import * as path from 'path'

interface TreeFile {
  absolutePath: string
  path: string
  mode: '100644' | '100755'
  type: 'blob'
}

export const globTreeFiles = async (basedir: string, patterns: string): Promise<TreeFile[]> => {
  const globber = await glob.create(patterns)
  const paths = await globber.glob()

  const treeFiles: TreeFile[] = []
  for (const p of paths) {
    const stat = await fs.stat(p)
    if (!stat.isFile()) {
      continue
    }

    const executable = (stat.mode & 0o7) === 0o5
    treeFiles.push({
      absolutePath: p,
      path: path.relative(basedir, p),
      mode: executable ? '100755' : '100644',
      type: 'blob',
    })
  }
  return treeFiles
}
