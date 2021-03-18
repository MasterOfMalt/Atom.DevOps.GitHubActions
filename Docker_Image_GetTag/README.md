# GitHub Action for Determining a docker image tag

GitHub Action implementation for determining the docker image tag from github repo properties.

## Usage

Use with [GitHub Actions](https://github.com/features/actions)

_.github/workflows/CI.yml_

```
name: "CI"
on:
  push:
    branches:
      - devel
  pull_request:
jobs:
  build_images:
    name: "Build Images"
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2

    - name: Determine tag
      id: get_tag
      uses: MasterOfMalt/Atom.DevOps.GitHubActions/Docker_Image_GetTag@v1

    - name: echo tag_name
      run: echo "tag=${{ steps.get_tag.outputs.tag_name }}"
```

## See it in practice

You can find a working and not working PR here:
https://github.com/MasterOfMalt/Atom.StatusDashboard/pulls