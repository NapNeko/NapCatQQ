const swc = require("@swc/core");
const glob = require('glob');
const fs = require('fs-extra');

const files = glob.sync('src/**/*.ts');

function transfrom(file) {
    return swc
    .transformFile(file, {
        // Some options cannot be specified in .swcrc
        sourceMaps: false,
        // Input files are treated as module by default.
        // isModule: false,
        module: {
            type: 'commonjs'
        },
    
        // All options below can be configured via .swcrc
        jsc: {
            parser: {
                syntax: "typescript",
                decorators: true,
            },
            transform: {
                "legacyDecorator": true,
                "decoratorMetadata": true
            },
            target: 'es2017'
        },
        // "keepClassNames": true,
        // "loose": true
    })
  .then((output) => {
    // console.log(output.code); // transformed code
    return {
        file,
        output
    }
  });
}

(async () => {
    const result = await Promise.all(files.map((file) => {
        return transfrom(file)
    }));

    await Promise.all(result.map((item) => {
        return fs.outputFile(item.file.replace('src', 'dist').replace('.ts', '.js'), item.output.code)
    }));
    //console.timeEnd('swc build');
})()
