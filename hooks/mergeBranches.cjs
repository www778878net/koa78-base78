const shell = require('shelljs');

// Switch to main branch and update
shell.exec('git checkout main');
shell.exec('git pull origin main');

// Get the last commit message from develop branch
const lastCommitMsg = shell.exec('git log develop3 -1 --pretty=%B', { silent: true }).stdout.trim();

// Merge develop branch, using --squash option to compress all commits into one
shell.exec('git merge --squash develop');

// Commit with the last commit message
shell.exec(`git commit -m "${lastCommitMsg}"`);

//git push origin main
//shell.exec('git push origin main');
