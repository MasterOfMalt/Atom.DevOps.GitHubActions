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
    
      - name: Build Image
        uses: MasterOfMalt/Atom.DevOps.GitHubActions/Docker_Build_Image@v1
        with:
          image_name: "<your_image_name>"
          dockerfile: "Dockerfile"
          registry: docker.pkg.github.com/your_repository_in_lower_case/

      - name: push
        if: |
          github.ref == 'refs/heads/master' &&
          github.event_name == 'push' &&
          env.ACT != 'true'
        run: |
          docker push "docker.pkg.github.com/your_repository_in_lower_case/
                       <your_image_name>:${{ steps.get_tag.outputs.tag_name }}"

      - name: Tag Image
        id: cache
        uses: MasterOfMalt/Atom.DevOps.GitHubActions/Docker_Image_Cache@v1
        with:
          image_name: "<your_image_name>"
          tag_name: ${{ steps.get_tag.outputs.tag_name }}
          registry: docker.pkg.github.com/your_repository_in_lower_case/
```

Mandatory argument:

```yaml
image_name: "<your image name>"
new_tag_name: "<your_new_tag>"
```

Option input values (and defaults):

```yaml
registry: "docker.pkg.github.com/your_repository_in_lower_case/"
```

## See it in practice

You can find a working and not working PR [here](https://github.com/MasterOfMalt/Atom.StatusDashboard/pulls)
