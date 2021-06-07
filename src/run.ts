import * as core from '@actions/core'
import * as github from '@actions/github'
import { promises as fs } from 'fs'
import { pushWithRetry } from './git'
import { globTreeFiles } from './glob'

interface Inputs {
  repository: string
  ref: string
  path: string
  baseDirectory: string
  message: string
  token: string
}

export const run = async (inputs: Inputs): Promise<void> => {
  const [owner, repo] = inputs.repository.split('/')
  const octokit = github.getOctokit(inputs.token)

  const treeFiles = await globTreeFiles(inputs.baseDirectory, inputs.path)
  const treeEntries = await Promise.all(
    treeFiles.map(async (f) => {
      const { data: blob } = await octokit.rest.git.createBlob({
        owner,
        repo,
        encoding: 'base64',
        content: (await fs.readFile(f.absolutePath)).toString('base64'),
      })
      core.info(`created blob ${blob.sha} from ${f.absolutePath}`)
      return {
        sha: blob.sha,
        path: f.path,
        type: f.type,
        mode: f.mode,
      }
    })
  )

  await pushWithRetry(octokit, {
    owner,
    repo,
    ref: inputs.ref,
    message: inputs.message,
    tree: treeEntries,
  })
}
