const fs = require('fs');
const path = require('path');

const hookNames = ['pre-commit', 'pre-push'];

hookNames.forEach(hookName => {
    const hookPath = path.join('.git', 'hooks', hookName);
    const hookContent = `#!/bin/sh
npm run dev:${hookName.replace('-', '')}
`;

    fs.writeFileSync(hookPath, hookContent);
    fs.chmodSync(hookPath, '755');
    console.log(`${hookName} hook installed`);
});