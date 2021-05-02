import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as github from '@actions/github'
import { promises as fs } from 'fs'
import * as path from 'path'

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

  const baseGitObject: {
    repository: {
      ref: {
        prefix: string
        name: string
        target: { oid: string; tree: { oid: string } }
      }
    }
  } = await octokit.graphql(
    `
    query baseGitObject($owner: String!, $repo: String!, $ref: String!) {
      repository(owner: $owner, name: $repo) {
        ref(qualifiedName: $ref) {
          prefix
          name
          target {
            ... on Commit {
              oid
              tree {
                oid
              }
            }
          }
        }
      }
    }
    `,
    { owner, repo, ref: inputs.ref }
  )
  core.info(`found base ${JSON.stringify(baseGitObject, undefined, 2)}`)

  const treeFiles = await globTreeFiles(inputs.baseDirectory, inputs.path)
  const treeEntries = await Promise.all(
    treeFiles.map(async (f) => {
      const { data: blob } = await octokit.git.createBlob({
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

  const { data: tree } = await octokit.git.createTree({
    owner,
    repo,
    tree: treeEntries,
    base_tree: baseGitObject.repository.ref.target.tree.oid,
  })
  core.info(`created tree ${tree.sha}`)

  const { data: commit } = await octokit.git.createCommit({
    owner,
    repo,
    tree: tree.sha,
    parents: [baseGitObject.repository.ref.target.oid],
    message: inputs.message,
  })
  core.info(`created commit ${commit.sha}`)

  const { data: commitDetail } = await octokit.repos.getCommit({
    owner,
    repo,
    ref: commit.sha,
  })
  if (commitDetail.files === undefined) {
    throw new Error(`unexpected error: octokit.repos.getCommit().files === undefined`)
  }
  if (commitDetail.files.length === 0) {
    core.info(`nothing to commit`)
    return
  }
  for (const f of commitDetail.files) {
    core.info(`commit: ${f.status} ${f.filename} (+${f.additions} -${f.deletions})`)
  }

  const { data: updatedRef } = await octokit.git.updateRef({
    owner,
    repo,
    ref: `heads/${baseGitObject.repository.ref.name}`,
    sha: commit.sha,
  })
  core.info(`updated ref ${updatedRef.ref} to ${updatedRef.object.sha}`)
  return
}

interface TreeFile {
  absolutePath: string
  path: string
  mode: '100644' | '100755'
  type: 'blob'
}

const globTreeFiles = async (basedir: string, patterns: string): Promise<TreeFile[]> => {
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
