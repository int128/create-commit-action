import * as Types from './graphql-types';

export type BaseGitObjectQueryVariables = Types.Exact<{
  owner: Types.Scalars['String'];
  repo: Types.Scalars['String'];
  ref: Types.Scalars['String'];
}>;


export type BaseGitObjectQuery = { __typename?: 'Query', repository?: Types.Maybe<{ __typename?: 'Repository', ref?: Types.Maybe<{ __typename?: 'Ref', target?: Types.Maybe<{ __typename: 'Blob' } | { __typename: 'Commit', oid: any, tree: { __typename?: 'Tree', oid: any } } | { __typename: 'Tag' } | { __typename: 'Tree' }> }>, defaultBranchRef?: Types.Maybe<{ __typename?: 'Ref', target?: Types.Maybe<{ __typename: 'Blob' } | { __typename: 'Commit', oid: any, tree: { __typename?: 'Tree', oid: any } } | { __typename: 'Tag' } | { __typename: 'Tree' }> }> }> };
