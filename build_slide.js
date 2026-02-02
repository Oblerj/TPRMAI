const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const templatePath = path.join(__dirname, 'Jan2026_AIHackathon_PresentationTemplate.pptx');
const outputPath = path.join(__dirname, 'TPRM_OnePager_Final.pptx');

// Condensed content for ONE SLIDE
const content = {
    title: 'AI-Powered Third Party Risk Management',

    solutionOverview: 'Six AI agents automate vendor risk: Profiler, Analyzer, Assessor, Manager, Reporter, Gatherer. Demo: Dashboard → AI Profiling → Doc Analysis → Reports.',

    demoLabel: '4-Minute Demo',

    problemStatement: 'Manual assessments take days. Document review is slow. Inconsistent scoring. Compliance mapping requires expertise.',

    businessValue: '90% faster reviews • Days→Hours onboarding • Auto-map to SOC2/ISO/NIST/HIPAA/PCI • Scale without headcount',

    summary: 'Transforms vendor risk from reactive to proactive—AI handles the work, teams make decisions.'
};

async function createSlide() {
    console.log('Loading template:', templatePath);
    const templateData = fs.readFileSync(templatePath);
    const zip = await JSZip.loadAsync(templateData);

    let slide1 = await zip.file('ppt/slides/slide1.xml').async('string');

    // Replacements based on template structure
    const replacements = [
        ['AI Hackathon Idea Title', content.title],
        ['Summary of solution – High-level description and main features. Any implementation factors? Estimate potential costs associated. ', content.solutionOverview],
        ['Show your demo!', content.demoLabel],
        ['What problem are you solving? Give background on current process/context/opportunity. ', content.problemStatement],
        ['Highlight potential benefits of this solution at scale, Time Savings​, Cost Savings​, Business Growth​, Revenue Drivers', content.businessValue],
        ['This is the template 1 pager that will be used during the presentation. Reminder – Only 6 minutes per group. ', content.summary]
    ];

    replacements.forEach(([find, replace]) => {
        // Escape special XML characters in replacement
        const safeReplace = replace
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        if (slide1.includes(find)) {
            slide1 = slide1.split(find).join(safeReplace);
            console.log('✓ Replaced:', find.substring(0, 40) + '...');
        } else {
            console.log('✗ Not found:', find.substring(0, 40) + '...');
        }
    });

    zip.file('ppt/slides/slide1.xml', slide1);

    const output = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    fs.writeFileSync(outputPath, output);

    console.log('\n========================================');
    console.log('SUCCESS! Created:', outputPath);
    console.log('File size:', output.length, 'bytes');
    console.log('========================================');
}

createSlide().catch(err => {
    console.error('ERROR:', err.message);
    console.error(err.stack);
});
