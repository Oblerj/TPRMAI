const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const templatePath = path.join(__dirname, 'Jan2026_AIHackathon_PresentationTemplate.pptx');
const outputPath = path.join(__dirname, 'TPRM_Final_OnePager.pptx');

async function main() {
    // Read template
    const data = fs.readFileSync(templatePath);
    const zip = await JSZip.loadAsync(data);

    // Get slide 1 XML
    let xml = await zip.file('ppt/slides/slide1.xml').async('string');

    // Simple text replacements (only changing text between <a:t> tags)
    xml = xml.replace(/>AI Hackathon Idea Title</g, '>AI-Powered Third Party Risk Management<');

    xml = xml.replace(/>Summary of solution – High-level description and main features. Any implementation factors\? Estimate potential costs associated. </g,
        '>6 AI Agents: Profiler, Analyzer, Assessor, Manager, Reporter, Gatherer. Demo: Dashboard → AI Profiling → Doc Analysis → Reports<');

    xml = xml.replace(/>Show your demo!</g, '>4-Minute Demo<');

    xml = xml.replace(/>What problem are you solving\? Give background on current process\/context\/opportunity. </g,
        '>Manual assessments take days. Slow document review. Inconsistent scoring. Compliance mapping needs expertise.<');

    xml = xml.replace(/>Highlight potential benefits of this solution at scale, Time Savings​, Cost Savings​, Business Growth​, Revenue Drivers</g,
        '>90% faster reviews • Days to hours onboarding • Auto-maps SOC2/ISO/NIST/HIPAA/PCI • Scales without headcount<');

    xml = xml.replace(/>This is the template 1 pager that will be used during the presentation. Reminder – Only 6 minutes per group. </g,
        '>Transforms vendor risk from reactive to proactive. AI handles work, teams make decisions.<');

    // Save modified slide
    zip.file('ppt/slides/slide1.xml', xml);

    // Write output
    const out = await zip.generateAsync({type: 'nodebuffer'});
    fs.writeFileSync(outputPath, out);

    console.log('Created: ' + outputPath);
}

main().catch(e => console.error(e));
