const { execSync } = require('child_process');
const path = require('path');

const projectDir = __dirname;
const npmCli = path.join(projectDir, 'node-v22.12.0-win-x64', 'node_modules', 'npm', 'bin', 'npm-cli.js');
const nodeExe = path.join(projectDir, 'node-v22.12.0-win-x64', 'node.exe');

console.log('Installing dependencies...');
console.log('Project dir:', projectDir);
console.log('npm CLI:', npmCli);

try {
    const result = execSync(`"${nodeExe}" "${npmCli}" install`, {
        cwd: projectDir,
        stdio: 'inherit',
        env: { ...process.env, npm_config_prefix: projectDir }
    });
    console.log('Installation complete!');
} catch (error) {
    console.error('Error:', error.message);
}
