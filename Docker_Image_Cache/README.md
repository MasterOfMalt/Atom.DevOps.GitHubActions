# GitHub Action for Caching a Docker Image

GitHub Action implementation for pulling/updating a docker image cache to speed up
builds.

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

      - name: Determine tag
        id: get_tag
        uses: MasterOfMalt/Atom.DevOps.GitHubActions/Docker_Image_Tag@v1

      - name: Login to registry
        uses: docker/login-action@v1
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Pull cache layers (if any)
        id: cache
        uses: MasterOfMalt/Atom.DevOps.GitHubActions/Docker_Image_Cache@v1
        with:
          image_name: "dash"
          tag_name: ${{ steps.get_tag.outputs.tag_name }}
          registry: ghcr.io/your_repository_in_lower_case/
```

Mandatory argument:

```yaml
image_name: "<your image name>"
```

Optional input values (and defaults):

```yaml
tag: "latest"
registry: "ghcr.io/your_repository_in_lower_case/"
```

Outputs:

```yaml
setting: "Docker Cache setting for use in docker build."
```

## See it in practice

You can find a working and not working PR [here](https://github.com/MasterOfMalt/Atom.StatusDashboard/pulls)
