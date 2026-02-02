const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const projectDir = __dirname;
const nodeDir = path.join(projectDir, 'node-v22.12.0-win-x64');
const npmCli = path.join(nodeDir, 'node_modules', 'npm', 'bin', 'npm-cli.js');
const nodeExe = path.join(nodeDir, 'node.exe');
const logFile = path.join(projectDir, 'npm-install.log');

// Add node directory to PATH so scripts can find 'node'
const newPath = nodeDir + ';' + process.env.PATH;

fs.writeFileSync(logFile, `Starting install at ${new Date().toISOString()}\n`);
fs.appendFileSync(logFile, `Node dir added to PATH: ${nodeDir}\n\n`);

const child = spawn(nodeExe, [npmCli, 'install', '--no-optional'], {
    cwd: projectDir,
    env: { ...process.env, PATH: newPath }
});

child.stdout.on('data', (data) => {
    fs.appendFileSync(logFile, `${data}`);
    process.stdout.write(data);
});

child.stderr.on('data', (data) => {
    fs.appendFileSync(logFile, `${data}`);
    process.stderr.write(data);
});

child.on('close', (code) => {
    const msg = `\nProcess exited with code ${code} at ${new Date().toISOString()}\n`;
    fs.appendFileSync(logFile, msg);
    console.log(msg);
});

child.on('error', (err) => {
    fs.appendFileSync(logFile, `ERROR: ${err.message}\n`);
    console.error('ERROR:', err.message);
});
