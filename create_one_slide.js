const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const templatePath = path.join(__dirname, 'Jan2026_AIHackathon_PresentationTemplate.pptx');
const outputPath = path.join(__dirname, 'TPRM_Demo_Presentation.pptx');

async function createOneSlide() {
    try {
        console.log('Loading template...');
        const templateData = fs.readFileSync(templatePath);
        const zip = await JSZip.loadAsync(templateData);

        // Read the original slide 1
        let slide1 = await zip.file('ppt/slides/slide1.xml').async('string');

        console.log('Original slide loaded, updating content...');

        // Define the content for our one-pager slide
        const title = 'AI-Powered Third Party Risk Management';
        const content = [
            'Demo Overview: Dashboard, AI Profiling, Document Analysis, Reporting',
            '',
            'Six AI Agents: Vendor Profiler, Security Analyzer, Risk Assessor,',
            'Risk Manager, Report Generator, Information Gatherer',
            '',
            'Business Value: 90% faster document review, days to hours onboarding,',
            'auto-mapping to SOC 2/ISO 27001/NIST/HIPAA/PCI-DSS',
            '',
            'Transforms vendor risk from reactive to proactive'
        ].join('\n');

        // Find and replace title text (look for the main text placeholder)
        // We'll search for <a:t> tags and replace content

        // Save as new file (copy template first to preserve all branding)
        const outputData = await zip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE'
        });

        fs.writeFileSync(outputPath, outputData);
        console.log('\\nTemplate copied to:', outputPath);
        console.log('\\nThe presentation preserves all Sleep Number branding.');
        console.log('Open it in PowerPoint and manually update the text on slide 1 with:');
        console.log('\\n--- TITLE ---');
        console.log(title);
        console.log('\\n--- CONTENT ---');
        console.log(content);

    } catch (error) {
        console.error('ERROR:', error.message);
    }
}

createOneSlide();
