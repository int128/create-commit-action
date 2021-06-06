import { GitHub } from '@actions/github/lib/utils'
import { BaseGitObjectQuery, BaseGitObjectQueryVariables } from './generated/graphql'

type Octokit = InstanceType<typeof GitHub>

const query = /* GraphQL */ `
  query baseGitObject($owner: String!, $repo: String!, $ref: String!) {
    repository(owner: $owner, name: $repo) {
      ref(qualifiedName: $ref) {
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
      defaultBranchRef {
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

export const queryBaseGitObject = async (o: Octokit, v: BaseGitObjectQueryVariables): Promise<BaseGitObjectQuery> => {
  try {
    return await o.graphql<BaseGitObjectQuery>(query, v)
  } catch (error) {
    if ('data' in error && error.data !== null) {
      // handle the partial response when ref does not exist
      return error.data
    } else {
      throw error
    }
  }
}
