# GitHub Action for Promoting a branch

GitHub Action implementation for normalising the latest GitHub Tab to
be of semantic-version form (eg. v1.2.1).

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
    name: "Normalise"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: MasterOfMalt/Atom.DevOps.GitHubActions/Git_Normalise_Tag@v1
        if: env.ACT != 'true'
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

Mandatory argument:

```yaml
github_token: ${{ secrets.GITHUB_TOKEN }}
```

Optional input values (and defaults):

```yaml
tag_prefix: ""
```

## See it in practice

You can find a working and not working PR [here](https://github.com/MasterOfMalt/Atom.StatusDashboard/pulls)

## Refs

The following external action are referenced in this action:

[github-tag-action](https://github.com/mathieudutour/github-tag-action)
[merge-branch](https://github.com/devmasx/merge-branch)
