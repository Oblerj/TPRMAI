const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const projectDir = __dirname;
const npmCli = path.join(projectDir, 'node-v22.12.0-win-x64', 'node_modules', 'npm', 'bin', 'npm-cli.js');
const nodeExe = path.join(projectDir, 'node-v22.12.0-win-x64', 'node.exe');
const logFile = path.join(projectDir, 'npm-install.log');

fs.writeFileSync(logFile, `Starting install at ${new Date().toISOString()}\n`);
fs.appendFileSync(logFile, `Project dir: ${projectDir}\n`);
fs.appendFileSync(logFile, `Node: ${nodeExe}\n`);
fs.appendFileSync(logFile, `npm CLI: ${npmCli}\n\n`);

const child = spawn(nodeExe, [npmCli, 'install'], {
    cwd: projectDir,
    env: { ...process.env }
});

child.stdout.on('data', (data) => {
    fs.appendFileSync(logFile, `STDOUT: ${data}`);
});

child.stderr.on('data', (data) => {
    fs.appendFileSync(logFile, `STDERR: ${data}`);
});

child.on('close', (code) => {
    fs.appendFileSync(logFile, `\nProcess exited with code ${code}\n`);
    fs.appendFileSync(logFile, `Finished at ${new Date().toISOString()}\n`);
});

child.on('error', (err) => {
    fs.appendFileSync(logFile, `ERROR: ${err.message}\n`);
});
