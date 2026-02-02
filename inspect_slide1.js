const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const templatePath = path.join(__dirname, 'Jan2026_AIHackathon_PresentationTemplate.pptx');

async function inspectSlide() {
    const templateData = fs.readFileSync(templatePath);
    const zip = await JSZip.loadAsync(templateData);

    // Read slide 1
    const slide1 = await zip.file('ppt/slides/slide1.xml').async('string');

    // Extract all text content
    const textMatches = slide1.match(/<a:t>([^<]*)<\/a:t>/g) || [];
    console.log('=== Text content in slide 1 ===');
    textMatches.forEach((match, i) => {
        const text = match.replace(/<a:t>/, '').replace(/<\/a:t>/, '');
        if (text.trim()) {
            console.log(`[${i}]: "${text}"`);
        }
    });

    // Save full XML for inspection
    fs.writeFileSync(path.join(__dirname, 'slide1_structure.xml'), slide1);
    console.log('\\nFull XML saved to slide1_structure.xml');
}

inspectSlide().catch(console.error);
