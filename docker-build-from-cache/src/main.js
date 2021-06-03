'use strict';

const core = require('@actions/core');
const exec = require('@actions/exec');


// Pulling the previous image allows us to use its layers as a cache, to reduce build times.
// When pulling an image - we try the current tag name first,
// failing that, we try the latest.
// if there's nothing to pull - there is no cache.
// Returns a cache setting (when the promise is fulfilled)
async function pull_image_cache(registry, image_name, pull_tag_name) {
    let tagged_name;
    let cached = true;
    let cache_setting;
    let exec_options = {
        ignoreReturnCode: true,
    }
    // Try pulling with the tagged name
    if (await exec.exec('docker', ['pull', image_name + ':' + pull_tag_name], exec_options) === 0) {
        tagged_name = image_name + ':' + pull_tag_name;
    } else if(pull_tag_name !== 'latest' && await exec.exec('docker', ['pull', image_name + ':' + 'latest'], exec_options) === 0) {
        tagged_name =  image_name + ':' + 'latest';
    } else {
        cached = false;
    }
    if (cached) {
        cache_setting = "--cache-from=" + tagged_name;
    }
    else {
        cache_setting = "--no-cache";
    }
    console.log("Cache setting will be " + cache_setting);
    return cache_setting;
}

/* Runs the build and tags it. Returns a promise */
function build_tagged_image(dockerfile, target_name, image_name_tag, cache_setting, additional_args) {
    console.log("Starting build of " + target_name);
    let cmd = "docker build . -f " + dockerfile + " --target " + target_name +
            " -t " + image_name_tag + " " + cache_setting + " " + additional_args;
    console.log("Whole command is '" + cmd + "'");
    return exec.exec(cmd);
}

function process_arguments() {
    let image_targets= core.getInput("image_targets").split(',');
    image_targets = image_targets.map(item=>item.trim());
    console.log(image_targets);
    return {
        dockerfile: core.getInput("dockerfile"),
        image_prefix: core.getInput("image_prefix"),
        image_targets: image_targets,
        tag_name: core.getInput("tag_name"),
        additional_args: core.getInput("additional_args"),
        registry: core.getInput("registry")
    }
}

async function start_build_when_ready_job(build_target, previous_build_job, dockerfile, additional_args) {
    if(previous_build_job) {
        // Wait for preceding build
        await previous_build_job;
        console.log("Previous target built.")
    }
    // Wait for cache pull
    let cache_setting = await build_target.cache_job;
    console.log("Cache pull complete. Starting build of " + build_target.target);

    // Start the build and tag job
    return build_tagged_image(dockerfile, build_target.target, build_target.image_name_tag,
        cache_setting, additional_args);
}


async function run() {
    try {
        // This will start all cache jobs.
        // It will assume build targets depend on their potential cache,
        // and on earlier build targets - so they come out in order.
        const args = process_arguments();
        console.log("Additional args are " + args.additional_args);
        // Set up per image target settings and cache
        // start cache processes (no dependencies)
        let build_targets = args.image_targets.map(target => {
            const image_target_name = args.registry + args.image_prefix + target;
            return {
                target: target,
                image_target_name: image_target_name,
                image_name_tag: image_target_name + ':' + args.tag_name,
                cache_job: pull_image_cache(args.registry, image_target_name, args.tag_name )
            }
        });

        console.log("Caches prepared");

        // start build processes (depend on the cache target and previous build)
        let previous_build = null;

        await build_targets.forEach((build_target)=> {
            previous_build = start_build_when_ready_job(build_target, previous_build, args.dockerfile, args.additional_args);
        });

        await previous_build;
        let output = build_targets.map(item=>item.image_name_tag).join(' ');
        core.setOutput("image_name_tags", output);
    }
    catch (error) {
        core.setFailed(error.message);
    }
}

if (require.main === module) {
    run().then();
}

module.exports = {
    pull_image_cache: pull_image_cache,
    build_tagged_image: build_tagged_image,
};