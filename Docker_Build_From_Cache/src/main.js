const core = require('@actions/core');
const exec = require('@actions/exec');


// Pulling the previous image allows us to use its layers as a cache, to reduce build times.
// When pulling an image - we try the current tag name first,
// failing that, we try the latest.
// if there's nothing to pull - there is no cache.
async function pull_image_cache(registry, image_name, pull_tag_name) {
    let tagged_name;
    let cached = true;
    let cache_setting;
    // Try pulling with the tagged name
    if (await exec.exec('docker', ['pull', image_name + ':' + pull_tag_name]) === 0) {
        tagged_name = image_name + ':' + pull_tag_name;
    } else if(await exec.exec('docker', ['pull', image_name + ':' + 'latest']) === 0) {
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
    return [cache_setting, tagged_name];
}

async function build_tagged_image(dockerfile, target_name, image_name_tag, cache_setting) {
    await exec.exec('docker', [
        'build', '.', '-f', dockerfile,
        '--target', target_name,
        '-t', image_name_tag, cache_setting
    ])
}

async function run() {
    // This will start all cache jobs.
    // It will assume build targets depend on their potential cache,
    // and on earlier build targets - so they come out in order.

    const dockerfile = core.getInput("dockerfile");
    const image_prefix = core.getInput("image_prefix");
    const image_targets = core.getInput("image_targets").split(',');
    const tag_name = core.getInput("tag_name");
    const registry = core.getInput("registry");

    // Set up per image target settings and cache
    // start cache processes (no dependancies)
    let build_targets = image_targets.map(target => {
        const image_target_name = registry + image_prefix + target;
        return {
            target: target,
            image_target_name: image_target_name,
            image_name_tag: image_target_name + ':' + tag_name,
            cache_job: pull_image_cache(registry, image_target_name, tag_name )
        }
    });

    // start build processes (depend on the cache target and previous build)
    let previous_build = null;
    build_targets.each(async (build_target)=> {
       if(previous_build) {
           // Wait for preceding build
           await previous_build;
       }
       // Wait for cache pull
       let cache_setting = await build_target.cache_job;
       // build and tag this target
       previous_build = build_tagged_image(dockerfile, build_target.target, build_target.image_name_tag,
           cache_setting );
    });
    await previous_build;

    let output = build_targets.reduce( (accumulator, currentValue) => accumulator + "," + currentValue.image_name_tag, "");
    core.setOutput("image_name_tags", output);
}

run()
