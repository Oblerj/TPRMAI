const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const projectDir = __dirname;
const nodeDir = path.join(projectDir, 'node-v22.12.0-win-x64');
const npmCli = path.join(nodeDir, 'node_modules', 'npm', 'bin', 'npm-cli.js');
const nodeExe = path.join(nodeDir, 'node.exe');
const logFile = path.join(projectDir, 'server.log');

const newPath = nodeDir + ';' + process.env.PATH;

fs.writeFileSync(logFile, `Starting server at ${new Date().toISOString()}\n`);

const child = spawn(nodeExe, [npmCli, 'run', 'dev'], {
    cwd: projectDir,
    env: { ...process.env, PATH: newPath },
    stdio: 'inherit'
});

child.on('error', (err) => {
    fs.appendFileSync(logFile, `ERROR: ${err.message}\n`);
});
