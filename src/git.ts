import * as core from '@actions/core'
import { GitHub } from '@actions/github/lib/utils'
import { queryBaseGitObject } from './base-git-object'
import { BaseGitObjectQuery } from './generated/graphql'

type Octokit = InstanceType<typeof GitHub>

type PushRequest = {
  owner: string
  repo: string
  ref: string
  message: string
  tree: TreeEntry[]
}

type TreeEntry = {
  sha: string
  path: string
  mode: '100644' | '100755'
  type: 'blob'
}

export const push = async (octokit: Octokit, r: PushRequest): Promise<string> => {
  const baseGitObject = await queryBaseGitObject(octokit, {
    owner: r.owner,
    repo: r.repo,
    ref: r.ref,
  })
  core.info(`found base git object = ${JSON.stringify(baseGitObject, undefined, 2)}`)
  if (baseGitObject.repository == null) {
    throw new Error(`repository ${r.owner}/${r.repo} not found`)
  }

  if (baseGitObject.repository.ref === null) {
    core.info(`creating ref ${r.ref} from default branch`)
    return await createRef(octokit, r, baseGitObject)
  }
  core.info(`updating ref ${r.ref} by fast-forward`)
  return await updateRef(octokit, r, baseGitObject)
}

const createRef = async (octokit: Octokit, r: PushRequest, b: BaseGitObjectQuery): Promise<string> => {
  if (b.repository?.defaultBranchRef?.target?.__typename !== 'Commit') {
    throw new Error(`unexpected response: ${b.repository?.defaultBranchRef?.target?.__typename} !== Commit`)
  }
  const parent = {
    commit: b.repository.defaultBranchRef.target.oid,
    tree: b.repository.defaultBranchRef.target.tree.oid,
  }
  const commit = await createCommit(octokit, r, parent)
  const { data: ref } = await octokit.rest.git.createRef({
    owner: r.owner,
    repo: r.repo,
    ref: r.ref,
    sha: commit,
  })
  core.info(`created ref ${ref.ref} with ${ref.object.sha}`)
  return ref.object.sha
}

const updateRef = async (octokit: Octokit, r: PushRequest, b: BaseGitObjectQuery): Promise<string> => {
  if (b.repository?.ref?.target?.__typename !== 'Commit') {
    throw new Error(`unexpected response: ${b?.repository?.ref?.target?.__typename} !== Commit`)
  }
  const parent = {
    commit: b.repository.ref.target.oid,
    tree: b.repository.ref.target.tree.oid,
  }
  const commit = await createCommit(octokit, r, parent)
  const { data: ref } = await octokit.rest.git.updateRef({
    owner: r.owner,
    repo: r.repo,
    ref: r.ref.replace(/^refs\//, ''), // updateRef requires a trimmed ref
    sha: commit,
  })
  core.info(`updated ref ${ref.ref} to ${ref.object.sha}`)
  return ref.object.sha
}

type Parent = {
  commit: string
  tree: string
}

const createCommit = async (octokit: Octokit, r: PushRequest, parent: Parent): Promise<string> => {
  core.info(`creating tree with ${JSON.stringify(r.tree, undefined, 2)}`)
  const { data: tree } = await octokit.rest.git.createTree({
    owner: r.owner,
    repo: r.repo,
    tree: r.tree,
    base_tree: parent.tree,
  })
  core.info(`created tree ${tree.sha}`)

  const { data: commit } = await octokit.rest.git.createCommit({
    owner: r.owner,
    repo: r.repo,
    tree: tree.sha,
    parents: [parent.commit],
    message: r.message,
  })
  core.info(`created commit ${commit.sha}`)

  const { data: commitDetail } = await octokit.rest.repos.getCommit({
    owner: r.owner,
    repo: r.repo,
    ref: commit.sha,
  })
  if (commitDetail.files === undefined) {
    throw new Error(`unexpected response: commit.files === undefined`)
  }
  if (commitDetail.files.length === 0) {
    core.info(`nothing to commit`)
    return parent.commit
  }

  for (const f of commitDetail.files) {
    core.info(`commit: ${f.status} ${f.filename} (+${f.additions} -${f.deletions})`)
  }
  return commit.sha
}
