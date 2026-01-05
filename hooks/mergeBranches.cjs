const shell = require('shelljs');

// First, run npx tsc to check for compilation errors
console.log('Running TypeScript compilation check...');
const tscResult = shell.exec('npx tsc', { silent: true });

if (tscResult.code !== 0) {
  console.error('TypeScript compilation failed. Aborting merge.');
  console.error(tscResult.stderr);
  process.exit(1);
}

console.log('TypeScript compilation succeeded.');

// Check if there are any uncommitted changes (e.g. generated files from npx tsc)
const gitStatus = shell.exec('git status --porcelain', { silent: true });
if (gitStatus.stdout.trim() !== '') {
  console.log('There are uncommitted changes after running npx tsc. Committing them now.');

  // Add all changes
  shell.exec('git add .');

  // Get the last commit message from develop branch
  const lastCommitMsg = shell.exec('git log -1 --pretty=%B', { silent: true }).stdout.trim();
  console.log(`Committing with message: ${lastCommitMsg}`);

  // Commit the changes
  shell.exec(`git commit -m "${lastCommitMsg}"`);
} else {
  console.log('No changes to commit after running npx tsc.');
}

// Get the last commit message from develop branch BEFORE checking out main
const lastCommitMsg = shell.exec('git log -1 --pretty=%B', { silent: true }).stdout.trim();
console.log(`Last commit message: ${lastCommitMsg}`);

// Switch to main branch and update
shell.exec('git checkout main');
shell.exec('git pull origin main');

// Merge develop branch, using --squash option to compress all commits into one
shell.exec('git merge --squash develop');

// Commit with the last commit message
shell.exec(`git commit -m "${lastCommitMsg}"`);

//git push origin main
//shell.exec('git push origin main');
