# GitHub Action for Tagging a Docker Image

GitHub Action implementation for tagging a docker image.

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
          registry: docker.pkg.github.com
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: ./Docker_Image_SetTag
        id: tag_image
        with:
          image_name: test_image_name
          new_tag_name: "<your_new_tag_name>"
          registry: docker.pkg.github.com/your_repository_in_lower_case/
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

Mandatory argument:

```yaml
image_name: "<your image name>"
new_tag_name: "<your_new_tag>"
```

Optional input values (and defaults):

```yaml
registry: "docker.pkg.github.com/your_repository_in_lower_case/"
```

## See it in practice

You can find a working and not working PR [here](https://github.com/MasterOfMalt/Atom.StatusDashboard/pulls)
