const shell = require('shelljs');
const path = require('path');

console.log('Pre-commit hook starts executing');

// Get current branch name
const currentBranch = shell.exec('git rev-parse --abbrev-ref HEAD', { silent: true }).stdout.trim();

if (currentBranch === 'develop') {
    console.log('Current branch is develop. Running pre-commit checks...');

    // Switch to repository root directory
    const rootDir = shell.exec('git rev-parse --show-toplevel', { silent: true }).stdout.trim();
    shell.cd(rootDir);
    console.log(`Switched to repository root: ${shell.pwd()}`);

    // Run TypeScript compilation
    console.log('Running TypeScript compilation...');
    const tscResult = shell.exec('tsc');

    if (tscResult.code !== 0) {
        console.error('TypeScript compilation failed, commit aborted');
        shell.exit(1);
    }

    console.log('TypeScript compilation succeeded');

    // Add generated files to Git staging area
    console.log('Adding generated files to Git staging area...');
    shell.exec('git add .');
    console.log('Files added to staging area');

    console.log('Pre-commit hook execution completed');
} else {
    console.log(`Current branch is ${currentBranch}. Skipping pre-commit checks.`);
}