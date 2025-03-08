import * as core from '@actions/core'
import { Octokit } from '@octokit/action'
import { retry } from '@octokit/plugin-retry'
import { run } from './run.js'

const main = async (): Promise<void> => {
  await run(
    {
      repository: core.getInput('repository', { required: true }),
      ref: core.getInput('ref', { required: true }),
      path: core.getInput('path', { required: true }),
      baseDirectory: core.getInput('base-directory', { required: true }),
      message: core.getInput('message', { required: true }),
    },
    getOctokit(),
  )
}

const getOctokit = () => new (Octokit.plugin(retry))()

main().catch((e: Error) => {
  core.setFailed(e)
  console.error(e)
})
