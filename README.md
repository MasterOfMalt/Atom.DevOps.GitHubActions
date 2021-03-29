# Atom.DevOps.GitHubActions

Repository of Atom shared GitHub actions

## Actions

[Docker Image Build](Docker_Image_Build/README.md)

[Docker Image Cache](Docker_Image_Cache/README.md)

[Docker Image GetTag](Docker_Image_GetTag/README.md)

[Promote](Promote/README.md)

## Testing/Running the GitHub workflow locally

You can run, or indeed test, the workflow here. This will enable you to both
check changes to the workflow or check your code against the workflow prior to
pushing. This will help you assess if it will pass the checks.

~~First, install act. See the instruction here:~~
~~<https://github.com/nektos/act#installation>~~

First, you'll need to build and install a special version of 'act' which
supports composite actions. This can be done by checking out our fork and
branch as follows:

```bash
git clone git@github.com:MasterOfMalt/act.git
git checkout PLOPS-427_fix_act_composite_actions
cd act
make install
```

Note: you'll also need to install Go tools 1.14 - (<https://golang.org/doc/install>)

Next, ensure you have the GITHUB_TOKEN configured in your .env as described
above. Then execute the following:

```bash
source .env
cd tests
./run_act.sh
```

Here are some generic instruction for testing GitHub workflows locally.
See: <https://github.com/nektos/act>
