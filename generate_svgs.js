/**
 * TPRM Diagram SVG Generator
 *
 * Generates SVG files from Mermaid diagram definitions.
 *
 * Usage:
 *   node generate_svgs.js
 *
 * Requirements:
 *   npm install @mermaid-js/mermaid-cli
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, 'diagrams', 'mermaid');
const OUTPUT_DIR = path.join(__dirname, 'diagrams', 'svg');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Get all .mmd files
const mmdFiles = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.mmd'));

console.log('TPRM Process Flow SVG Generator');
console.log('================================\n');
console.log(`Found ${mmdFiles.length} diagram files\n`);

let success = 0;
let failed = 0;

mmdFiles.forEach(file => {
    const inputPath = path.join(INPUT_DIR, file);
    const outputFile = file.replace('.mmd', '.svg');
    const outputPath = path.join(OUTPUT_DIR, outputFile);

    console.log(`Processing: ${file}`);

    try {
        execSync(`npx mmdc -i "${inputPath}" -o "${outputPath}" -b white -w 1200`, {
            stdio: 'pipe',
            timeout: 30000
        });
        console.log(`  ✓ Created: ${outputFile}`);
        success++;
    } catch (error) {
        console.log(`  ✗ Failed: ${error.message}`);
        failed++;
    }
});

console.log('\n================================');
console.log(`Complete: ${success} succeeded, ${failed} failed`);
console.log(`\nSVG files saved to: ${OUTPUT_DIR}`);
console.log('\nTo import into Lucidchart:');
console.log('  1. Open Lucidchart');
console.log('  2. File > Import');
console.log('  3. Select SVG files from diagrams/svg folder');
