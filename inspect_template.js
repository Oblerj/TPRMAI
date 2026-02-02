const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const templatePath = path.join(__dirname, 'Jan2026_AIHackathon_PresentationTemplate.pptx');

async function inspectTemplate() {
    const data = fs.readFileSync(templatePath);
    const zip = await JSZip.loadAsync(data);

    // List all files in the pptx
    console.log('=== Files in template ===');
    const files = Object.keys(zip.files);
    files.forEach(f => console.log(f));

    // Check for images
    console.log('\n=== Images ===');
    files.filter(f => f.includes('media')).forEach(f => console.log(f));

    // Read presentation.xml to understand structure
    const presXml = await zip.file('ppt/presentation.xml').async('string');
    console.log('\n=== Slide count ===');
    const slideMatches = presXml.match(/r:id="rId\d+"/g);
    console.log('Slides found:', slideMatches ? slideMatches.length : 0);

    // Check slide layouts
    console.log('\n=== Slide Layouts ===');
    files.filter(f => f.includes('slideLayouts')).forEach(f => console.log(f));
}

inspectTemplate().catch(console.error);
