const PptxGenJS = require('pptxgenjs');
const path = require('path');

// Create presentation
const pptx = new PptxGenJS();

// Set presentation properties
pptx.author = 'Sleep Number';
pptx.title = 'AI-Powered Third Party Risk Management';
pptx.subject = '4-Minute Demo';

// Define colors
const BLUE = '0066CC';
const DARK = '333333';
const GRAY = '666666';

// Slide 1: Title
let slide1 = pptx.addSlide();
slide1.addText('AI-Powered Third Party Risk Management', {
    x: 0.5, y: 2.5, w: '90%', h: 1,
    fontSize: 36, bold: true, color: DARK, align: 'center'
});
slide1.addText('4-Minute Demo', {
    x: 0.5, y: 3.5, w: '90%', h: 0.5,
    fontSize: 24, color: GRAY, align: 'center'
});

// Slide 2: Demo Flow
let slide2 = pptx.addSlide();
slide2.addText('Demo: What You\'ll See', {
    x: 0.5, y: 0.5, w: '90%', h: 0.8,
    fontSize: 28, bold: true, color: DARK
});
slide2.addText([
    { text: 'Dashboard', options: { bullet: true, bold: true } },
    { text: ' - Real-time risk posture at a glance\n', options: { bold: false } },
    { text: 'AI Vendor Profiling', options: { bullet: true, bold: true } },
    { text: ' - Instant risk classification\n', options: { bold: false } },
    { text: 'Document Analysis', options: { bullet: true, bold: true } },
    { text: ' - Automated finding extraction\n', options: { bold: false } },
    { text: 'Reporting', options: { bullet: true, bold: true } },
    { text: ' - Executive-ready insights in seconds', options: { bold: false } }
], {
    x: 0.5, y: 1.5, w: '90%', h: 4,
    fontSize: 20, color: DARK, valign: 'top'
});

// Slide 3: Six AI Agents
let slide3 = pptx.addSlide();
slide3.addText('How AI Helps: Six Specialized Agents', {
    x: 0.5, y: 0.5, w: '90%', h: 0.8,
    fontSize: 28, bold: true, color: DARK
});

const agents = [
    ['Vendor Profiler', 'Auto-classifies risk level instantly'],
    ['Security Analyzer', 'Extracts findings from documents'],
    ['Risk Assessor', 'Evaluates 9 security domains'],
    ['Risk Manager', 'Generates remediation plans'],
    ['Report Generator', 'Creates executive summaries'],
    ['Information Gatherer', 'Identifies documentation gaps']
];

let yPos = 1.5;
agents.forEach(([name, desc]) => {
    slide3.addText([
        { text: name, options: { bold: true } },
        { text: ` - ${desc}` }
    ], {
        x: 0.5, y: yPos, w: '90%', h: 0.5,
        fontSize: 18, color: DARK, bullet: true
    });
    yPos += 0.6;
});

// Slide 4: Business Value
let slide4 = pptx.addSlide();
slide4.addText('Business Value', {
    x: 0.5, y: 0.5, w: '90%', h: 0.8,
    fontSize: 28, bold: true, color: DARK
});
slide4.addText([
    { text: '90% reduction', options: { bold: true } },
    { text: ' in manual document review time\n', options: {} },
    { text: 'Vendor onboarding', options: { bold: true } },
    { text: ' reduced from days to hours\n', options: {} },
    { text: 'Consistent risk scoring', options: { bold: true } },
    { text: ' across all vendors\n', options: {} },
    { text: 'Auto-mapping', options: { bold: true } },
    { text: ' to SOC 2, ISO 27001, NIST, HIPAA, PCI-DSS\n', options: {} },
    { text: 'Scalable', options: { bold: true } },
    { text: ' - more vendors without adding headcount', options: {} }
], {
    x: 0.5, y: 1.5, w: '90%', h: 4,
    fontSize: 20, color: DARK, valign: 'top', bullet: { type: 'bullet' }
});

// Slide 5: Summary
let slide5 = pptx.addSlide();
slide5.addText('Summary', {
    x: 0.5, y: 0.5, w: '90%', h: 0.8,
    fontSize: 28, bold: true, color: DARK
});
slide5.addText([
    { text: 'Transforms vendor risk from reactive to proactive\n', options: { bullet: true } },
    { text: 'AI handles review, assessment, and reporting\n', options: { bullet: true } },
    { text: 'Team focuses on decisions, not document review\n', options: { bullet: true } },
    { text: 'Reduces risk | Ensures compliance | Improves efficiency', options: { bullet: true } }
], {
    x: 0.5, y: 1.5, w: '90%', h: 3,
    fontSize: 20, color: DARK, valign: 'top'
});

// Summary statement
slide5.addText('"Our AI-powered TPRM platform transforms vendor risk management into a proactive, intelligent system."', {
    x: 0.5, y: 4, w: '90%', h: 1,
    fontSize: 16, italic: true, color: BLUE, align: 'center'
});

// Save
const outputPath = path.join(__dirname, 'TPRM_Demo_Presentation.pptx');
pptx.writeFile({ fileName: outputPath })
    .then(() => console.log(`Created: ${outputPath}`))
    .catch(err => console.error('Error:', err));
