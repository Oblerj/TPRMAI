const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const templatePath = path.join(__dirname, 'Jan2026_AIHackathon_PresentationTemplate.pptx');
const outputPath = path.join(__dirname, 'TPRM_Demo_Presentation.pptx');

// Slide content to add
const slideContents = [
    {
        title: 'AI-Powered Third Party Risk Management',
        subtitle: '4-Minute Demo'
    },
    {
        title: 'Demo: What You\'ll See',
        bullets: [
            'Dashboard – Real-time risk posture at a glance',
            'AI Vendor Profiling – Instant risk classification',
            'Document Analysis – Automated finding extraction',
            'Reporting – Executive-ready insights in seconds'
        ]
    },
    {
        title: 'How AI Helps: Six Specialized Agents',
        bullets: [
            'Vendor Profiler – Auto-classifies risk level instantly',
            'Security Analyzer – Extracts findings from documents',
            'Risk Assessor – Evaluates 9 security domains',
            'Risk Manager – Generates remediation plans',
            'Report Generator – Creates executive summaries',
            'Information Gatherer – Identifies documentation gaps'
        ]
    },
    {
        title: 'Business Value',
        bullets: [
            '90% reduction in manual document review time',
            'Vendor onboarding reduced from days to hours',
            'Consistent risk scoring across all vendors',
            'Auto-mapping to SOC 2, ISO 27001, NIST, HIPAA, PCI-DSS',
            'Scalable – more vendors without adding headcount'
        ]
    },
    {
        title: 'Summary',
        bullets: [
            'Transforms vendor risk from reactive to proactive',
            'AI handles review, assessment, and reporting',
            'Team focuses on decisions, not document review',
            'Reduces risk | Ensures compliance | Improves efficiency'
        ]
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

async function createPresentation() {
    try {
        console.log('Loading template...');
        const templateData = fs.readFileSync(templatePath);
        const zip = await JSZip.loadAsync(templateData);

        // Read the original slide to use as template
        const origSlide = await zip.file('ppt/slides/slide1.xml').async('string');
        const origSlideRels = await zip.file('ppt/slides/_rels/slide1.xml.rels').async('string');

        console.log('Original slide loaded');

        // Keep slide 1 as title slide with updated content
        let slide1 = origSlide;

        // Update title in slide 1
        slide1 = slide1.replace(
            /(<a:p[^>]*>[\s\S]*?<a:t>)[^<]*(<\/a:t>[\s\S]*?<\/a:p>)/,
            `$1${escapeXml(slideContents[0].title)}$2`
        );

        zip.file('ppt/slides/slide1.xml', slide1);

        // For additional slides, we need to read a content layout
        // Read slideLayout2 (typically Title and Content)
        const layout2Rels = await zip.file('ppt/slideLayouts/_rels/slideLayout2.xml.rels').async('string');

        // Get existing presentation.xml
        let presentationXml = await zip.file('ppt/presentation.xml').async('string');
        let presRels = await zip.file('ppt/_rels/presentation.xml.rels').async('string');
        let contentTypes = await zip.file('[Content_Types].xml').async('string');

        // Find the highest rId in presentation.xml.rels
        const rIdMatches = presRels.match(/rId(\d+)/g) || [];
        let maxRId = 0;
        rIdMatches.forEach(m => {
            const num = parseInt(m.replace('rId', ''));
            if (num > maxRId) maxRId = num;
        });

        console.log(`Highest existing rId: ${maxRId}`);

        // Create slides 2-5
        for (let i = 1; i < slideContents.length; i++) {
            const slideNum = i + 1;
            const content = slideContents[i];
            const newRId = maxRId + i;

            // Create bullet points XML
            let bulletsXml = '';
            if (content.bullets) {
                content.bullets.forEach((bullet, idx) => {
                    bulletsXml += `
                    <a:p>
                        <a:pPr lvl="0">
                            <a:buFont typeface="Arial" panose="020B0604020202020204" pitchFamily="34" charset="0"/>
                            <a:buChar char="•"/>
                        </a:pPr>
                        <a:r>
                            <a:rPr lang="en-US" sz="2000" dirty="0"/>
                            <a:t>${escapeXml(bullet)}</a:t>
                        </a:r>
                    </a:p>`;
                });
            }

            // Create slide XML
            const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
    <p:cSld>
        <p:spTree>
            <p:nvGrpSpPr>
                <p:cNvPr id="1" name=""/>
                <p:cNvGrpSpPr/>
                <p:nvPr/>
            </p:nvGrpSpPr>
            <p:grpSpPr>
                <a:xfrm>
                    <a:off x="0" y="0"/>
                    <a:ext cx="0" cy="0"/>
                    <a:chOff x="0" y="0"/>
                    <a:chExt cx="0" cy="0"/>
                </a:xfrm>
            </p:grpSpPr>
            <p:sp>
                <p:nvSpPr>
                    <p:cNvPr id="2" name="Title 1"/>
                    <p:cNvSpPr>
                        <a:spLocks noGrp="1"/>
                    </p:cNvSpPr>
                    <p:nvPr>
                        <p:ph type="title"/>
                    </p:nvPr>
                </p:nvSpPr>
                <p:spPr/>
                <p:txBody>
                    <a:bodyPr/>
                    <a:lstStyle/>
                    <a:p>
                        <a:r>
                            <a:rPr lang="en-US" sz="3600" b="1" dirty="0"/>
                            <a:t>${escapeXml(content.title)}</a:t>
                        </a:r>
                    </a:p>
                </p:txBody>
            </p:sp>
            <p:sp>
                <p:nvSpPr>
                    <p:cNvPr id="3" name="Content Placeholder 2"/>
                    <p:cNvSpPr>
                        <a:spLocks noGrp="1"/>
                    </p:cNvSpPr>
                    <p:nvPr>
                        <p:ph idx="1"/>
                    </p:nvPr>
                </p:nvSpPr>
                <p:spPr/>
                <p:txBody>
                    <a:bodyPr/>
                    <a:lstStyle/>
                    ${bulletsXml}
                </p:txBody>
            </p:sp>
        </p:spTree>
    </p:cSld>
    <p:clrMapOvr>
        <a:masterClrMapping/>
    </p:clrMapOvr>
</p:sld>`;

            // Create slide rels (pointing to layout 2)
            const slideRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout2.xml"/>
</Relationships>`;

            // Add slide files
            zip.file(`ppt/slides/slide${slideNum}.xml`, slideXml);
            zip.file(`ppt/slides/_rels/slide${slideNum}.xml.rels`, slideRelsXml);

            // Add to presentation.xml sldIdLst
            const sldIdEntry = `<p:sldId id="${255 + slideNum}" r:id="rId${newRId}"/>`;
            presentationXml = presentationXml.replace('</p:sldIdLst>', sldIdEntry + '</p:sldIdLst>');

            // Add to presentation.xml.rels
            const relEntry = `<Relationship Id="rId${newRId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${slideNum}.xml"/>`;
            presRels = presRels.replace('</Relationships>', relEntry + '</Relationships>');

            // Add to [Content_Types].xml
            const typeEntry = `<Override PartName="/ppt/slides/slide${slideNum}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
            contentTypes = contentTypes.replace('</Types>', typeEntry + '</Types>');

            console.log(`Created slide ${slideNum}: ${content.title}`);
        }

        // Save updated files
        zip.file('ppt/presentation.xml', presentationXml);
        zip.file('ppt/_rels/presentation.xml.rels', presRels);
        zip.file('[Content_Types].xml', contentTypes);

        // Generate output file
        console.log('Generating output file...');
        const outputData = await zip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
            compressionOptions: { level: 9 }
        });

        fs.writeFileSync(outputPath, outputData);
        console.log(`\nSUCCESS! Created: ${outputPath}`);
        console.log(`Total slides: ${slideContents.length}`);

    } catch (error) {
        console.error('ERROR:', error.message);
        console.error(error.stack);
    }
}

createPresentation();
