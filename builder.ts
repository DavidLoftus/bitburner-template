import * as esbuild from 'esbuild'
import * as path from 'std/path/mod.ts'
import { bgGreen, green, white } from 'std/fmt/colors.ts'

const sourcePath = './src';

function logResult(result: esbuild.BuildResult) {
    if (buildResult.errors.length === 0) {
        const inFiles = buildResult.metafile ? Object.keys(buildResult.metafile.inputs).length : NaN;
        const outFiles = buildResult.metafile ? Object.keys(buildResult.metafile.outputs).length : NaN;
        console.log(`${green('✓ ')}${bgGreen(white(' SUCCESS '))} ${inFiles} files compiled, ${outFiles} files produced`);
    }
}

async function getBuild(): Promise<esbuild.BuildResult> {
    const entryPoints = [];
    // We only care about files matching ./src/* and not any subdirectories.
    // esbuild can take care of any dependencies imported by the entry points.
    for await (const file of Deno.readDir(sourcePath)) {
        if (file.isDirectory) continue;
        entryPoints.push(`${sourcePath}/${file.name}`);
    }

    try {
        return await esbuild.build({
            entryPoints: entryPoints,
            bundle: true,
            write: true,
            outdir: "./dist",
            watch: {
                onRebuild: (error, result) => {
                    if (result) {
                        logResult(result);
                    }
                }
            },
            metafile: true,
            sourcemap: 'inline',
            format: 'esm',
        });
    } catch (err) {
        if (err instanceof Error) {
            return {
                errors: [
                    {
                        detail: undefined,
                        location: null,
                        notes: [],
                        pluginName: 'thrown Error',
                        text: err.message,
                    }
                ],
                warnings: []
            }
        }

        throw err;
    }
}

let buildResult = await getBuild();
logResult(buildResult);

async function restartBuild() {
    console.log(`Restarting build`);
    if (buildResult.stop) {
        buildResult.stop();
    }
    buildResult = await getBuild();
    logResult(buildResult);
}

// Start watcher
for await (const update of Deno.watchFs(sourcePath, { recursive: false })) {
    const paths = update.paths.map(pth => path.relative(sourcePath, pth));
    if (update.kind === "create") {
        console.log(`New file: ${paths.join(', ')}`);
        await restartBuild();
    } else if (update.kind === "remove") {
        console.log(`Deleted file: ${paths.join(', ')}`);
        await restartBuild();
    }
}