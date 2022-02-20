import * as Types from './graphql-types';

export type BaseGitObjectQueryVariables = Types.Exact<{
  owner: Types.Scalars['String'];
  repo: Types.Scalars['String'];
  ref: Types.Scalars['String'];
}>;


export type BaseGitObjectQuery = { __typename?: 'Query', repository?: { __typename?: 'Repository', ref?: { __typename?: 'Ref', target?: { __typename: 'Blob' } | { __typename: 'Commit', oid: any, tree: { __typename?: 'Tree', oid: any } } | { __typename: 'Tag' } | { __typename: 'Tree' } | null } | null, defaultBranchRef?: { __typename?: 'Ref', target?: { __typename: 'Blob' } | { __typename: 'Commit', oid: any, tree: { __typename?: 'Tree', oid: any } } | { __typename: 'Tag' } | { __typename: 'Tree' } | null } | null } | null };
