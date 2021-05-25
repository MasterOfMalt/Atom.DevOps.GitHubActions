# Atom.DevOps.GitHubActions

Repository of Atom shared GitHub actions

## Actions

[Docker Image Build](Docker_Image_Build/README.md)

[Docker Image Cache](Docker_Image_Cache/README.md)

[Docker Image GetTag](Docker_Image_GetTag/README.md)

[Git Normalise Tag](Git_Normalise_Tag/README.md)

## Configuration

Copy 'tests/.env_example' to '.env' and edit GITHUB_TOKEN to your github
personal access token.

```bash
##################################################################
# GitHub personal access token token (For testing the workflow locally)
export GITHUB_TOKEN='<your github personal access token>'
```

## Testing/Running the GitHub workflow locally

You can run, or indeed test, the workflow here. This will enable you to both
check changes to the workflow or check your code against the workflow prior to
pushing. This will help you assess if it will pass the checks.

First, install act. See the instruction here:
<https://github.com/nektos/act#installation>

Next, ensure you have the GITHUB_TOKEN configured in your .env as described
above. Then execute the following:

```bash
source .env
cd tests
./run_act.sh
```

Here are some generic instruction for testing GitHub workflows locally.
See: <https://github.com/nektos/act>

## If you need to use a development version of act

Sometimes we may need a newer or modified version of act.

* Install Go tools 1.14 - (<https://golang.org/doc/install>)
* Checkout the act branch/fork

```bash
git clone git@github.com:MasterOfMalt/act.git
git checkout PLOPS-427_fix_act_composite_actions
```

* Install it with `make install`
