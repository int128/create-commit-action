import * as core from '@actions/core'
import { run } from './run'

async function main(): Promise<void> {
  await run({
    repository: core.getInput('repository', { required: true }),
    ref: core.getInput('ref', { required: true }),
    path: core.getInput('path', { required: true }),
    baseDirectory: core.getInput('base-directory', { required: true }),
    message: core.getInput('message', { required: true }),
    token: core.getInput('token', { required: true }),
  })
}

main().catch((error) => core.setFailed(error))
