import { GitHub } from '@actions/github/lib/utils'
import { BaseGitObjectQuery, BaseGitObjectQueryVariables } from './generated/graphql'

type Octokit = InstanceType<typeof GitHub>

const query = /* GraphQL */ `
  query baseGitObject($owner: String!, $repo: String!, $ref: String!) {
    repository(owner: $owner, name: $repo) {
      ref(qualifiedName: $ref) {
        prefix
        name
        target {
          __typename
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
`

export const queryBaseGitObject = async (
  octokit: Octokit,
  v: BaseGitObjectQueryVariables
): Promise<BaseGitObjectQuery> => {
  return await octokit.graphql<BaseGitObjectQuery>(query, v)
}
