import path from 'path';
import { execSync as doExecSync, ExecSyncOptions } from 'child_process';

const pkgDir = path.normalize(`${__dirname}/../..`);

export function execSync(command: string, options: ExecSyncOptions = {}): void {
    // Output the command to keep track of what's going on
    console.log(`> ${command}`);

    doExecSync(command, {
        cwd: pkgDir, // root dir of the package is the current working directory
        stdio: 'inherit',
        ...options,
    });
}
