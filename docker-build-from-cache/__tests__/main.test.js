'use strict';

jest.mock('@actions/exec');
jest.mock('@actions/core');

const main = require('../src/main.js');

describe("Build tagged image", () => {
    let exec;
    let main;

    beforeEach(()=> {
        exec = require('@actions/exec');
        main = require('../src/main.js');
    });

    afterEach(()=> {
        exec.exec.mockReset();
    });

    it("Should start docker build with the right parameters", async ()=> {
        // Setup
        // Test
        await main.build_tagged_image("file.Dockerfile", "target_foo", "image_tag",
           "--cache-please foo", "--some \"extra=args with space\"");
        // Assert
        expect(exec.exec).toBeCalledWith(
            "docker build . -f file.Dockerfile --target target_foo -t image_tag " +
            "--cache-please foo --some \"extra=args with space\"");
    });

    it("Should not add --target when target is empty", async ()=> {
        // Setup
        // Test
        await main.build_tagged_image("file.Dockerfile", "", "image_tag",
            "--cache-please foo", "--some \"extra=args with space\"");
        // Assert
        expect(exec.exec).toBeCalledWith(
            "docker build . -f file.Dockerfile -t image_tag " +
            "--cache-please foo --some \"extra=args with space\"");
    });
});

describe("Process arguments", () => {
    let core;
    let main;

    beforeEach(()=> {
       core = require('@actions/core');
       main = require('../src/main.js');
    });

    function test_target_fragment(targets_in, targets_out) {
       // setup
       core.getInput.mockImplementation((name) => {
           return {
               dockerfile: "test.dockerfile",
               image_prefix: "test",
               separator: "_",
               image_targets: targets_in,
               tag_name: "latest",
               additional_args: "--n-t",
               registry: "t_r:"
           }[name];
       });
       // test
       let args = main.process_arguments();
       // assert
       expect(args.dockerfile).toEqual("test.dockerfile");
       expect(args.tag_name).toEqual("latest");
       expect(args.additional_args).toEqual("--n-t");
       expect(args.image_target_details).toEqual(targets_out);
       expect(args.final_tag_name).toEqual("t_r:test:latest");
    }

    it("Should split input targets into a list with spaces", ()=> {
       test_target_fragment("base, runner", [
           {
               target: "base",
               image_name: "t_r:test_base",
               image_name_tag: "t_r:test_base:latest",
           },
           {
               target: "runner",
               image_name: "t_r:test_runner",
               image_name_tag: "t_r:test_runner:latest",
           }
       ]);
    });

    it("Should split input targets into a list without spaces", () => {
       test_target_fragment("base,runner", [
           {
               target: "base",
               image_name: "t_r:test_base",
               image_name_tag: "t_r:test_base:latest",
           },
           {
               target: "runner",
               image_name: "t_r:test_runner",
               image_name_tag: "t_r:test_runner:latest",
           }
       ]);
    });

    it("Should produce one target when target list is empty", () => {
        test_target_fragment("", [
            {
                target: "",
                image_name: "t_r:test",
                image_name_tag: "t_r:test:latest",
            }
        ]);
    });
});

describe("Pull image cache", () => {
    let exec;
    let main;

    beforeEach(()=> {
        exec = require('@actions/exec');
        main = require('../src/main.js');
    });
    afterEach(()=> {
        exec.exec.mockReset();
    });

    it("Should cache from named tag if it exists", async () => {
        // setup
        exec.exec.mockImplementation(async (cmd, args, options)=> {
            if (args[1] === "test_image_name:0.0.1") {
                return 0
            }
        });
        // test
        let cache_setting = await main.pull_image_cache("test_image_name", "0.0.1");

        // assert
        expect(exec.exec).toBeCalledWith("docker", ["pull", "test_image_name:0.0.1"], {ignoreReturnCode: true});
        expect(cache_setting).toEqual("--cache-from=test_image_name:0.0.1")
    });

    it("Should cache from latest if named tag doesnt exist", async () => {
        // setup
        exec.exec.mockImplementation(async (cmd, args, options)=> {
            if (args[1] === "test_image_name:latest") {
                return 0;
            } else {
                return 1;
            }
        });
        // test
        let cache_setting = await main.pull_image_cache("test_image_name", "0.0.1");

        // assert
        expect(exec.exec).toBeCalledWith("docker", ["pull", "test_image_name:latest"], {ignoreReturnCode: true});
        expect(cache_setting).toEqual("--cache-from=test_image_name:latest")
    });

    it("Should set no cache from latest if named tag and latest tag dont exist", async () => {
        // setup
        exec.exec.mockImplementation(async (cmd, args, options)=> {
            return 1;
        });
        // test
        let cache_setting = await main.pull_image_cache("test_image_name", "0.0.1");

        // assert
        expect(exec.exec).toBeCalledWith("docker", ["pull", "test_image_name:latest"], {ignoreReturnCode: true});
        expect(cache_setting).toEqual("--no-cache")
    });
});

describe("Run", ()=> {
    let exec;
    let main;

    beforeEach(()=> {
        exec = require('@actions/exec');
        main = require('../src/main.js');
        // setup mocks for functions used by run in main
        jest.spyOn(main, "pull_image_cache")
            .mockImplementation(async () => {}).mockClear();
        jest.spyOn(main, "start_build_when_ready_job")
            .mockImplementation(async () => {}).mockClear();
        jest.spyOn(main, "tag_build")
            .mockImplementation(async () => {}).mockClear();

    });

    afterEach(()=> {
        exec.exec.mockReset();
    });

    it("Should tag the last stage with prefix and tag version only", async () => {
        // setup
        jest.spyOn(main, "process_arguments").mockImplementation(() => {
            return {
                dockerfile: "test_dockerfile",
                image_target_details: [
                    {
                        target: "base",
                        image_name: "image_name_runner",
                        image_name_tag: "image_name_runner:1.2.3"
                    }, {
                        target: "runner",
                        image_name: "image_name_runner",
                        image_name_tag: "image_name_runner:1.2.3"
                    }
                ],
                tag_name: "1.2.3",
                final_tag_name: "image_name:1.2.3",
                additional_args: ""
            };
        }).mockClear();
        // test
        await main.run();
        // assert
        expect(main.process_arguments).toHaveBeenCalledTimes(1);
        expect(main.pull_image_cache).toHaveBeenCalledTimes(2);
        expect(main.start_build_when_ready_job).toHaveBeenCalledTimes(2);

        expect(main.tag_build).toHaveBeenCalledTimes(1);
        expect(main.tag_build).toBeCalledWith("image_name_runner:1.2.3", "image_name:1.2.3");
    });

    it("Should not retag if there was an empty target list", async () => {
        // setup
        jest.spyOn(main, "process_arguments").mockImplementation(() => {
            return {
                dockerfile: "test_dockerfile",
                image_target_details: [{
                    target: "",
                    image_name: "image_name",
                    image_name_tag: "image_name:1.2.3"
                }],
                tag_name: "1.2.3",
                final_tag_name: "image_name:1.2.3",
                additional_args: ""
            };
        }).mockClear();
        // test
        await main.run();
        // assert
        expect(main.process_arguments).toHaveBeenCalledTimes(1);
        expect(main.pull_image_cache).toHaveBeenCalledTimes(1);
        expect(main.start_build_when_ready_job).toHaveBeenCalledTimes(1);

        expect(main.tag_build).toHaveBeenCalledTimes(0);
    });
});
