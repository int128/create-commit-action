# create-commit-action

This is an cction to push files using GitHub API.


## Getting Started

To create a commit into a branch:

```yaml
jobs:
  build:
    steps:
      - uses: int128/create-commit-action@v1
        with:
          repository: ${{ github.repository }}
          ref: refs/heads/branch-name
          path: glob-pattern
          message: your-commit-message
```

If a branch does not exist, this action creates it from default branch.
Otherwise, this action updates it.
