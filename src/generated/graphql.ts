import * as Types from './types';

export type BaseGitObjectQueryVariables = Types.Exact<{
  owner: Types.Scalars['String'];
  repo: Types.Scalars['String'];
  ref: Types.Scalars['String'];
}>;


export type BaseGitObjectQuery = (
  { __typename?: 'Query' }
  & { repository?: Types.Maybe<(
    { __typename?: 'Repository' }
    & { ref?: Types.Maybe<(
      { __typename?: 'Ref' }
      & Pick<Types.Ref, 'prefix' | 'name'>
      & { target?: Types.Maybe<{ __typename: 'Blob' } | (
        { __typename: 'Commit' }
        & Pick<Types.Commit, 'oid'>
        & { tree: (
          { __typename?: 'Tree' }
          & Pick<Types.Tree, 'oid'>
        ) }
      ) | { __typename: 'Tag' } | { __typename: 'Tree' }> }
    )> }
  )> }
);
