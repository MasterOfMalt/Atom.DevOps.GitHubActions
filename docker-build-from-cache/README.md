# Github Action For building From Cache

This will pull cached builds and then build a docker image for multiple targets
from a Dockerfile.

* You specify the registry, image name and dockerfile.
* Specify the stages and tags for them.
* Output is the build stages in the current context.

## Usage

Use with [GitHub Actions](https://github.com/features/actions)

Example: _.github/workflows/CI.yml_

```yaml
      - uses: ./docker-build-from-cache
        id: build_from_cache
        with:
          dockerfile: ./.github/Dockerfile
          image_prefix: test_image_name
          tag_name: ${{ steps.get_tag.outputs.tag_name }}
          registry: ${{ env.IMAGE_REPO }}
          image_targets: "base,runner"
          additional_args: '--build-arg GREETING="Greetings" --build-arg ADDRESSEE="Github Actions"'
```

This will build and tag the base and runner targets from the dockerfile.
It will pull them from cache if it exists, to speed up the build process.
Note that a further step will be needed to upload these images
(and form the next cache stage):

```yaml
      - name: push_tagged_targets
        run: |
          for target in base runner; do
            docker push "${IMAGE_REPO}test_image_name_${target}:${{ steps.get_tag.outputs.tag_name }}"
          done
```

Mandatory Arguments:

```yaml
dockerfile: "<dockerfile path with respect to project root>"
image_prefix: "<prefix of the image tags when built>"
```

Optional arguments:

```yaml
image_targets: "<comma separated list of targets to build. Defaults to none - a single stage build>"
tag_name: "<Tag name to pull and build. Defaults to latest>"
registry: "<registry path. Defaults to local. must be all lower case and end in '/'>"
additional_args: '<additional docker command line arguments. Passed exactly to each docker build operation>'
separator: '<override the default dash beteen prefix and targets>'
```

Outputs:

```yaml
image_name_tags: "Comma separated list of full image name and tags"
```

## Developing this

The source needs to be built into the dist for this to run. You will not be able
to see your changes without it.
You need to have npm installed, and to run:

```shell
    npm install
    npm run prepare
```

For testing in act the following can be helpful (from the project root/tests folder):

```shell
    (cd ../docker-build-from-cache; npm run prepare) && ./run_act.sh test
```
