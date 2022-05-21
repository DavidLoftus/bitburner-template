import * as esbuild from 'esbuild'
import * as path from 'std/path/mod.ts'

const sourcePath = './src';

async function getBuild() {
    const entryPoints = [];
    // We only care about files matching ./src/* and not any subdirectories.
    // esbuild can take care of any dependencies imported by the entry points.
    for await (const file of Deno.readDir(sourcePath)) {
        if (file.isDirectory) continue;
        entryPoints.push(`${sourcePath}/${file.name}`);
    }

    return esbuild.build({
        entryPoints: entryPoints,
        bundle: true,
        write: true,
        outdir: "./dist",
        watch: true,
        sourcemap: 'inline',
        format: 'esm',
    });
}

let buildResult = await getBuild();

async function restartBuild() {
    console.log(`Restarting build`);
    if (buildResult.stop) {
        buildResult.stop();
    }
    buildResult = await getBuild();
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