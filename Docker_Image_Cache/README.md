# GitHub Action for Caching a Docker Image

GitHub Action implementation for pulling/updting a docker image cache to speed up builds. 

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
      uses: MasterOfMalt/Atom.DevOps.GitHubActions/Docker_Image_Tag@v1
    
    - name: Pull cache layers (if any)
      id: cache
      uses: MasterOfMalt/Atom.DevOps.GitHubActions/Docker_Image_Cache@v1
      with:
        image_name: "dash"
        tag_name: ${{ steps.get_tag.outputs.tag_name }}
        registry: "docker.pkg.github.com/$GITHUB_REPOSITORY"
```

Mandatory argument:

```
image_name: "<your image name>"
```

Option input values (and defaults):

```
tag_name: "latest"
registry: "docker.pkg.github.com/$GITHUB_REPOSITORY"
```

## See it in practice

You can find a working and not working PR here:
https://github.com/MasterOfMalt/Atom.StatusDashboard/pulls