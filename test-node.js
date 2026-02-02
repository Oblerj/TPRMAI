const fs = require('fs');
fs.writeFileSync('node-test-output.txt', 'Node.js is working! Version: ' + process.version);
console.log('Test completed');
