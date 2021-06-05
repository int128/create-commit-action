import * as core from '@actions/core'
import { GitHub } from '@actions/github/lib/utils'
import { queryBaseGitObject } from './base-git-object'

type Octokit = InstanceType<typeof GitHub>

type PushRequest = {
  owner: string
  repo: string
  ref: string
  message: string
  tree: {
    sha: string
    path: string
    mode: '100644' | '100755'
    type: 'blob'
  }[]
}

export const push = async (octokit: Octokit, r: PushRequest): Promise<string> => {
  const baseGitObject = await queryBaseGitObject(octokit, {
    owner: r.owner,
    repo: r.repo,
    ref: r.ref,
  })
  core.info(`found base git object = ${JSON.stringify(baseGitObject, undefined, 2)}`)
  if (baseGitObject?.repository?.ref?.target?.__typename !== 'Commit') {
    throw new Error(`unexpected query response: typename == ${baseGitObject?.repository?.ref?.target?.__typename}`)
  }

  const { data: tree } = await octokit.rest.git.createTree({
    owner: r.owner,
    repo: r.repo,
    tree: r.tree,
    base_tree: baseGitObject.repository.ref.target.tree.oid,
  })
  core.info(`created tree ${tree.sha}`)

  const { data: commit } = await octokit.rest.git.createCommit({
    owner: r.owner,
    repo: r.repo,
    tree: tree.sha,
    parents: [baseGitObject.repository.ref.target.oid],
    message: r.message,
  })
  core.info(`created commit ${commit.sha}`)

  const { data: commitDetail } = await octokit.rest.repos.getCommit({
    owner: r.owner,
    repo: r.repo,
    ref: commit.sha,
  })
  if (commitDetail.files === undefined) {
    throw new Error(`unexpected error: octokit.repos.getCommit().files === undefined`)
  }
  if (commitDetail.files.length === 0) {
    core.info(`nothing to commit`)
    return baseGitObject.repository.ref.target.oid
  }
  for (const f of commitDetail.files) {
    core.info(`commit: ${f.status} ${f.filename} (+${f.additions} -${f.deletions})`)
  }

  const { data: updatedRef } = await octokit.rest.git.updateRef({
    owner: r.owner,
    repo: r.repo,
    ref: `heads/${baseGitObject.repository.ref.name}`,
    sha: commit.sha,
  })
  core.info(`updated ref ${updatedRef.ref} to ${updatedRef.object.sha}`)
  return updatedRef.object.sha
}
