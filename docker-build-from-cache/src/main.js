'use strict';

const core = require('@actions/core');
const exec = require('@actions/exec');


// Pulling the previous image allows us to use its layers as a cache, to reduce build times.
// When pulling an image - we try the current tag name first,
// failing that, we try the latest.
// if there's nothing to pull - there is no cache.
// Returns a cache setting (when the promise is fulfilled)
async function pull_image_cache(image_name, pull_tag_name) {
    let tagged_name;
    let cached = true;
    let cache_setting;
    let exec_options = {
        ignoreReturnCode: true,
    }
    // Try pulling with the tagged name
    if (await exec.exec('docker', ['pull', image_name + ':' + pull_tag_name], exec_options) === 0) {
        tagged_name = image_name + ':' + pull_tag_name;
    } else if(pull_tag_name !== 'latest' &&
            await exec.exec('docker', ['pull', image_name + ':' + 'latest'], exec_options) === 0) {
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
    let target_param = "";
    if (target_name) {
        target_param = " --target " + target_name;
    }

    let cmd = "docker build . -f " + dockerfile + target_param +
            " -t " + image_name_tag + " " + cache_setting + " " + additional_args;
    console.log("Whole command is '" + cmd + "'");
    return exec.exec(cmd);
}

async function start_build_when_ready_job(build_target, previous_build_job, dockerfile, additional_args) {
    if(previous_build_job) {
        // Wait for preceding build
        await previous_build_job;
        console.log("Previous target built.")
    }
    // Wait for cache pull
    let cache_setting = await build_target.cache_job;
    console.log("Cache pull complete. Starting build of " + build_target.image_name);

    // Start the build and tag job
    return main.build_tagged_image(dockerfile, build_target.target, build_target.image_name_tag,
        cache_setting, additional_args);
}

function process_arguments() {
    let image_targets= core.getInput("image_targets").split(',');
    image_targets = image_targets.map(item=>item.trim());
    let registry = core.getInput("registry");
    let image_prefix = core.getInput("image_prefix");
    let tag_name = core.getInput("tag_name");
    let separator = core.getInput("separator");

    let image_target_details = image_targets.map(target=> {
        let image_target_name = registry + image_prefix + (target ? separator + target: "");
        return {
            target: target,
            image_name: image_target_name,
            image_name_tag: image_target_name + ':' + tag_name,
        }
    });

    return {
        dockerfile: core.getInput("dockerfile"),
        image_target_details: image_target_details,
        tag_name: tag_name,
        additional_args: core.getInput("additional_args"),
        final_tag_name: registry + image_prefix + ":" + tag_name
    }
}

async function tag_build(source_tag, dest_tag) {
    await exec.exec("docker", ["tag", source_tag, dest_tag]);
}

async function run() {
    try {
        // This will start all cache jobs.
        // It will assume build targets depend on their potential cache,
        // and on earlier build targets - so they come out in order.
        const args = main.process_arguments();
        console.log("Additional args are " + args.additional_args);
        // Set up per image target settings and cache
        // start cache processes (no dependencies)
        let build_targets = args.image_target_details.map(target => {
            target.cache_job = main.pull_image_cache(target.image_name, args.tag_name );
            return target;
        });

        console.log("Caches prepared");

        // start build processes (depend on the cache target and previous build)
        let previous_build = null;

        await build_targets.forEach((build_target)=> {
            previous_build = main.start_build_when_ready_job(build_target, previous_build, args.dockerfile, args.additional_args);
        });

        await previous_build;

        if(build_targets.length > 1) {
            console.log("Tagging the final stage image with " + args.final_tag_name);
            await main.tag_build(build_targets.slice(-1)[0].image_name_tag, args.final_tag_name);
        }

        let output = build_targets.map(item=>item.image_name_tag).join(' ');
        core.setOutput("image_name_tags", output);
    }
    catch (error) {
        core.setFailed(error.message);
    }
}

const main = {
    pull_image_cache,
    start_build_when_ready_job,
    build_tagged_image,
    process_arguments,
    tag_build,
    run,
};

module.exports = main;

if (require.main === module) {
    main.run().then();
}