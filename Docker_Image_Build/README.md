# GitHub Action for Caching a Docker Image

GitHub Action implementation for building a docker image. 

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

    - name: Build Image
      uses: MasterOfMalt/Atom.DevOps.GitHubActions/Docker_Build_Image@v1
      with:
        image_name: "dash"
        dockerfile: "Dockerfile"
        registry: "docker.pkg.github.com/$GITHUB_REPOSITORY"
        github_token: ${{ secrets.GITHUB_TOKEN }}
```

Mandatory argument:

```
image_name: "<your image name>"
github_token: ${{ secrets.GITHUB_TOKEN }}
```

Option input values (and defaults):

```
dockerfile: "Dockerfile"
registry: "docker.pkg.github.com/$GITHUB_REPOSITORY"
```

## See it in practice

You can find a working and not working PR here:
https://github.com/MasterOfMalt/Atom.StatusDashboard/pulls

## Refs
The following external action are referenced in this action:

https://github.com/docker/login-action