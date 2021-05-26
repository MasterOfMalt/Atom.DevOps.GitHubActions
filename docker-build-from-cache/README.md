# Github Action For building From Cache

This will pull cached builds and then build a docker image for multiple targets
from a Dockerfile.

* You specify the registry, image name and dockerfile.
* Specify the stages and tags for them.
* Output is the build stages in the current context.

## Usage

Use with [GitHub Actions](https://github.com/features/actions)

Example: _.github/workflows/CI.yml_

Mandatory Arguments:

```yaml
dockerfile: "<dockerfile path with respect to project root>"
image_prefix: "<prefix of the image tags when built>"
```

Optional arguments:

```yaml
image_targets: "<comma separated list of targets to build. Defaults to none>"
tag_name: "<Tag name to pulll and build. Defaults to latest>"
registry: "<registry path. Defaults to local. must be all lower case and end in '/'>"
```

Outputs:

```yaml
image_name_tags: "Comma separated list of full image name and tags"
```
