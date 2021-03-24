# GitHub Action for Caching a Docker Image

GitHub Action implementation for building a docker image.

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
  build_images:
    name: "Build Images"
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2

    - name: Login to registry
      uses: docker/login-action@v1
      with:
        registry: docker.pkg.github.com
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Build Image
      uses: MasterOfMalt/Atom.DevOps.GitHubActions/Docker_Build_Image@v1
      with:
        image_name: "dash"
        dockerfile: "Dockerfile"
        registry: docker.pkg.github.com/your_repository_in_lower_case/
        github_token: ${{ secrets.GITHUB_TOKEN }}
```

Mandatory argument:

```yaml
image_name: "<your image name>"
github_token: ${{ secrets.GITHUB_TOKEN }}
```

Option input values (and defaults):

```yaml
dockerfile: "Dockerfile"
registry: "docker.pkg.github.com/your_repository_in_lower_case/"
```

## See it in practice

You can find a working and not working PR [here](https://github.com/MasterOfMalt/Atom.StatusDashboard/pulls)

## Refs

The following external actions are referenced in this action:

[login-action](https://github.com/docker/login-action)
