const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const templatePath = path.join(__dirname, 'Jan2026_AIHackathon_PresentationTemplate.pptx');
const outputPath = path.join(__dirname, 'TPRM_Demo_Presentation.pptx');

// Slide content
const slides = [
    {
        layout: 1,  // Title slide
        title: 'AI-Powered Third Party Risk Management',
        subtitle: '4-Minute Demo'
    },
    {
        layout: 2,  // Title and Content
        title: 'Demo: What You\'ll See',
        bullets: [
            'Dashboard – Real-time risk posture at a glance',
            'AI Vendor Profiling – Instant risk classification',
            'Document Analysis – Automated finding extraction',
            'Reporting – Executive-ready insights in seconds'
        ]
    },
    {
        layout: 2,
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
        layout: 2,
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
        layout: 2,
        title: 'Summary',
        bullets: [
            'Transforms vendor risk from reactive to proactive',
            'AI handles review, assessment, and reporting',
            'Team focuses on decisions, not document review',
            'Reduces risk | Ensures compliance | Improves efficiency'
        ]
    }
];

// Create XML for a text run
function createTextRun(text, bold = false, fontSize = 1800) {
    return `<a:r>
        <a:rPr lang="en-US" ${bold ? 'b="1"' : ''} sz="${fontSize}" dirty="0"/>
        <a:t>${escapeXml(text)}</a:t>
    </a:r>`;
}

// Escape XML special characters
function escapeXml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Create bullet paragraph
function createBulletParagraph(text, level = 0) {
    return `<a:p>
        <a:pPr lvl="${level}">
            <a:buFont typeface="Arial" panose="020B0604020202020204" pitchFamily="34" charset="0"/>
            <a:buChar char="•"/>
        </a:pPr>
        ${createTextRun(text, false, 2000)}
    </a:p>`;
}

// Create title slide XML
function createTitleSlideXml(slideData, slideNum) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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
                        <p:ph type="ctrTitle"/>
                    </p:nvPr>
                </p:nvSpPr>
                <p:spPr/>
                <p:txBody>
                    <a:bodyPr/>
                    <a:lstStyle/>
                    <a:p>
                        ${createTextRun(slideData.title, true, 4400)}
                    </a:p>
                </p:txBody>
            </p:sp>
            <p:sp>
                <p:nvSpPr>
                    <p:cNvPr id="3" name="Subtitle 2"/>
                    <p:cNvSpPr>
                        <a:spLocks noGrp="1"/>
                    </p:cNvSpPr>
                    <p:nvPr>
                        <p:ph type="subTitle" idx="1"/>
                    </p:nvPr>
                </p:nvSpPr>
                <p:spPr/>
                <p:txBody>
                    <a:bodyPr/>
                    <a:lstStyle/>
                    <a:p>
                        ${createTextRun(slideData.subtitle, false, 2400)}
                    </a:p>
                </p:txBody>
            </p:sp>
        </p:spTree>
    </p:cSld>
    <p:clrMapOvr>
        <a:masterClrMapping/>
    </p:clrMapOvr>
</p:sld>`;
}

// Create content slide XML
function createContentSlideXml(slideData, slideNum) {
    const bulletsParagraphs = slideData.bullets.map(b => createBulletParagraph(b)).join('\n');

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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
                        ${createTextRun(slideData.title, true, 3600)}
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
                    ${bulletsParagraphs}
                </p:txBody>
            </p:sp>
        </p:spTree>
    </p:cSld>
    <p:clrMapOvr>
        <a:masterClrMapping/>
    </p:clrMapOvr>
</p:sld>`;
}

// Create slide relationship file
function createSlideRels(layoutNum) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout${layoutNum}.xml"/>
</Relationships>`;
}

async function createPresentation() {
    try {
        // Load template
        const templateData = fs.readFileSync(templatePath);
        const zip = await JSZip.loadAsync(templateData);

        // Remove existing slides
        const slideFiles = Object.keys(zip.files).filter(f =>
            f.match(/^ppt\/slides\/slide\d+\.xml$/) ||
            f.match(/^ppt\/slides\/_rels\/slide\d+\.xml\.rels$/)
        );
        slideFiles.forEach(f => zip.remove(f));

        // Add new slides
        for (let i = 0; i < slides.length; i++) {
            const slideData = slides[i];
            const slideNum = i + 1;

            // Create slide XML
            let slideXml;
            if (slideData.layout === 1) {
                slideXml = createTitleSlideXml(slideData, slideNum);
            } else {
                slideXml = createContentSlideXml(slideData, slideNum);
            }

            zip.file(`ppt/slides/slide${slideNum}.xml`, slideXml);
            zip.file(`ppt/slides/_rels/slide${slideNum}.xml.rels`, createSlideRels(slideData.layout));
        }

        // Update presentation.xml to reference new slides
        let presentationXml = await zip.file('ppt/presentation.xml').async('string');

        // Find and replace sldIdLst section
        const sldIdLstMatch = presentationXml.match(/<p:sldIdLst>[\s\S]*?<\/p:sldIdLst>/);
        if (sldIdLstMatch) {
            let newSldIdLst = '<p:sldIdLst>';
            for (let i = 0; i < slides.length; i++) {
                newSldIdLst += `<p:sldId id="${256 + i}" r:id="rId${2 + i}"/>`;
            }
            newSldIdLst += '</p:sldIdLst>';
            presentationXml = presentationXml.replace(/<p:sldIdLst>[\s\S]*?<\/p:sldIdLst>/, newSldIdLst);
        }

        zip.file('ppt/presentation.xml', presentationXml);

        // Update presentation.xml.rels
        let presRels = await zip.file('ppt/_rels/presentation.xml.rels').async('string');

        // Remove old slide relationships
        presRels = presRels.replace(/<Relationship[^>]*slideLayout[^>]*\/>/g, '');
        presRels = presRels.replace(/<Relationship[^>]*slide\d+\.xml[^>]*\/>/g, '');

        // Add new slide relationships before closing tag
        let slideRels = '';
        for (let i = 0; i < slides.length; i++) {
            slideRels += `<Relationship Id="rId${2 + i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`;
        }
        presRels = presRels.replace('</Relationships>', slideRels + '</Relationships>');

        zip.file('ppt/_rels/presentation.xml.rels', presRels);

        // Update [Content_Types].xml
        let contentTypes = await zip.file('[Content_Types].xml').async('string');

        // Remove old slide overrides
        contentTypes = contentTypes.replace(/<Override[^>]*slide\d+\.xml[^>]*\/>/g, '');

        // Add new slide overrides
        let slideOverrides = '';
        for (let i = 0; i < slides.length; i++) {
            slideOverrides += `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
        }
        contentTypes = contentTypes.replace('</Types>', slideOverrides + '</Types>');

        zip.file('[Content_Types].xml', contentTypes);

        // Save the file
        const outputData = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
        fs.writeFileSync(outputPath, outputData);

        console.log(`SUCCESS: Created ${outputPath}`);
        console.log(`Slides: ${slides.length}`);

    } catch (error) {
        console.error('ERROR:', error.message);
        console.error(error.stack);
    }
}

createPresentation();
