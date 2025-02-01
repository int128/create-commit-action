# create-commit-action [![ts](https://github.com/int128/create-commit-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/create-commit-action/actions/workflows/ts.yaml)

This is an action to push files using GitHub API.


## Getting Started

To create a commit to a branch or tag:

```yaml
jobs:
  build:
    steps:
      - uses: int128/create-commit-action@v1
        with:
          repository: ${{ github.repository }}
          ref: refs/heads/branch-name
          path: glob-pattern
          remove: files to remove from Git
          message: your-commit-message
```

If a branch or tag does not exist, this action creates it from default branch.
Otherwise, this action updates it by fast-forward.


## How it works

This action performs the following steps:

1. Upload file(s) as blob
1. Get the current commit and tree of a ref
1. Create a tree
1. Create a commit
1. Create or update a ref

This action will retry from step 2 if the optimistic lock fails, that is,

- The ref has been updated after step 2
- The ref did not exist at step 2 but exists at step 5
