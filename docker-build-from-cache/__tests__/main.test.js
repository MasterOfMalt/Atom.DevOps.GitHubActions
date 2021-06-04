'use strict';

jest.mock('@actions/exec');

const main = require('../src/main.js');

describe("Build tagged image", () => {


   it("Should start docker build with the right parameters", async ()=> {
        // Setup
       const exec = require('@actions/exec');
       const main = require('../src/main.js');
        // Test
        await main.build_tagged_image("file.Dockerfile", "target_foo", "image_tag",
           "--cache-please foo", "--some \"extra=args with space\"");
        // Assert
        expect(exec.exec).toBeCalledWith(
            "docker build . -f file.Dockerfile --target target_foo -t image_tag " +
            "--cache-please foo --some \"extra=args with space\"");
   });
});
