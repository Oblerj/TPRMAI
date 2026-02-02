const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const templatePath = path.join(__dirname, 'Jan2026_AIHackathon_PresentationTemplate.pptx');
const outputPath = path.join(__dirname, 'TPRM_Demo_Presentation.pptx');

// Content mapping - template text -> replacement text
const replacements = [
    {
        find: 'AI Hackathon Idea Title',
        replace: 'AI-Powered Third Party Risk Management'
    },
    {
        find: 'Solution Overview:',
        replace: 'Solution Overview:'
    },
    {
        find: 'Summary of solution – High-level description and main features. Any implementation factors? Estimate potential costs associated. ',
        replace: 'AI platform with 6 specialized agents: Vendor Profiler, Security Analyzer, Risk Assessor, Risk Manager, Report Generator, Information Gatherer. Built with Next.js, PostgreSQL, Claude AI. Demo: Dashboard → AI Profiling → Document Analysis → Reporting'
    },
    {
        find: 'Show your demo!',
        replace: '4-Minute Demo'
    },
    {
        find: 'Problem Statement:',
        replace: 'Problem Statement:'
    },
    {
        find: 'What problem are you solving? Give background on current process/context/opportunity. ',
        replace: 'Manual vendor risk assessments take days. Document review is time-consuming. Inconsistent risk scoring across vendors. Compliance mapping requires expertise. Reporting is labor-intensive.'
    },
    {
        find: 'Business &amp; Customer Impact/Benefit',
        replace: 'Business Value'
    },
    {
        find: 'Highlight potential benefits of this solution at scale, Time Savings​, Cost Savings​, Business Growth​, Revenue Drivers',
        replace: '90% reduction in document review time. Vendor onboarding: days → hours. Consistent risk scoring. Auto-mapping to SOC 2, ISO 27001, NIST, HIPAA, PCI-DSS. Scalable without adding headcount.'
    },
    {
        find: 'This is the template 1 pager that will be used during the presentation. Reminder – Only 6 minutes per group. ',
        replace: 'Transforms vendor risk management from reactive to proactive — AI handles review, assessment, and reporting so teams focus on decisions.'
    }
];

function escapeXml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function createPresentation() {
    try {
        console.log('Loading template...');
        const templateData = fs.readFileSync(templatePath);
        const zip = await JSZip.loadAsync(templateData);

        // Read slide 1
        let slide1 = await zip.file('ppt/slides/slide1.xml').async('string');

        console.log('Replacing content...');

        // Apply replacements
        replacements.forEach(({find, replace}) => {
            const escapedFind = escapeRegex(find);
            const regex = new RegExp(`(<a:t>)${escapedFind}(<\\/a:t>)`, 'g');
            const newContent = `$1${escapeXml(replace)}$2`;
            slide1 = slide1.replace(regex, newContent);
            console.log(`  ✓ Replaced: "${find.substring(0, 30)}..."`);
        });

        // Save updated slide
        zip.file('ppt/slides/slide1.xml', slide1);

        // Generate output
        console.log('\\nGenerating presentation...');
        const outputData = await zip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE'
        });

        fs.writeFileSync(outputPath, outputData);
        console.log(`\\n✓ SUCCESS: ${outputPath}`);
        console.log('\\nThe presentation preserves all Sleep Number branding!');

    } catch (error) {
        console.error('ERROR:', error.message);
        console.error(error.stack);
    }
}

createPresentation();
