import type { Octokit } from '@octokit/action'
import { GraphqlResponseError } from '@octokit/graphql'
import type { BaseGitObjectQuery, BaseGitObjectQueryVariables } from './generated/graphql.js'

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
    // handle the partial response when ref does not exist
    if (error instanceof GraphqlResponseError) {
      const e = error as GraphqlResponseError<BaseGitObjectQuery>
      return e.data
    } else {
      throw error
    }
  }
}
