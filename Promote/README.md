# GitHub Action for Promoting a branch

GitHub Action implementation for promoting a branch to a release branch by
merging and bumping the tag.

## Usage

Use with [GitHub Actions](https://github.com/features/actions)

Example: _.github/workflows/CI.yml_

```yaml
name: "CI"
on:
  push:
    branches:
      - devel
  pull_request:
jobs:
  promote:
    if: github.ref == 'refs/heads/devel'
    name: "Promote"
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: MasterOfMalt/Atom.DevOps.GitHubActions/Promote@1.0
      if: env.ACT != 'true'
      with:
        from_branch: "devel"
        release_branch: "main"
```

Option input values (and defaults):

```yaml
from_branch: "devel"
release_branch: "main"
tag_prefix: ""
github_token: ${{ secrets.GITHUB_TOKEN }}
```

## See it in practice

You can find a working and not working PR [here](https://github.com/MasterOfMalt/Atom.StatusDashboard/pulls)

## Refs

The following external action are referenced in this action:

[github-tag-action](https://github.com/mathieudutour/github-tag-action)
[merge-branch](https://github.com/devmasx/merge-branch)
