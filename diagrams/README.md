# TPRM Process Flow Diagrams

Interactive process flow diagrams for Third Party Risk Management operations.

## Quick Start

**Open `TPRM_Diagrams.html` in any web browser** to view all diagrams with:
- Interactive rendering via Mermaid.js
- Download buttons for SVG and PNG exports
- Navigation menu for quick access
- Print-friendly layout

## Diagrams Included

| # | Diagram | Description |
|---|---------|-------------|
| 1 | TPRM Lifecycle | Overview of the 5-phase vendor management lifecycle |
| 2 | Vendor Onboarding | Complete onboarding workflow with decision points |
| 3 | Risk Assessment | Risk scoring methodology and tier assignment |
| 4 | Due Diligence | Swimlane diagram across teams |
| 5 | Contract Management | Contract negotiation and required clauses |
| 6 | Ongoing Monitoring | Continuous monitoring and reassessment triggers |
| 7 | Incident Response | Vendor incident handling by severity |
| 8 | Vendor Offboarding | Safe vendor exit with parallel workstreams |
| 9 | Risk Tier Matrix | Visual decision guide for risk classification |

## Exporting Diagrams

### From HTML Viewer
1. Open `TPRM_Diagrams.html` in browser
2. Click **Download SVG** or **Download PNG** for each diagram
3. Files save directly to your Downloads folder

### For Lucidchart Import
1. Export as SVG from the HTML viewer
2. In Lucidchart: File > Import > Select SVG file
3. Diagrams import as editable shapes

### For Other Tools
The Mermaid source code in `generate_tprm_diagrams.py` can be used in:
- **Mermaid Live Editor**: https://mermaid.live
- **VS Code**: With Mermaid Preview extension
- **Notion**: Native Mermaid support in code blocks
- **GitHub/GitLab**: Native rendering in markdown

## Regenerating Diagrams

To regenerate or modify diagrams:

```bash
# Edit the DIAGRAMS dictionary in the script
python scripts/generate_tprm_diagrams.py --output-dir diagrams --format all
```

### Requirements for PNG/SVG Generation
```bash
npm install -g @mermaid-js/mermaid-cli
```

## Color Coding

| Color | Meaning |
|-------|---------|
| Blue (#4285F4) | Standard process steps |
| Green (#34A853) | Approval/Success/Low Risk |
| Yellow (#FBBC04) | Decision points/Medium Risk |
| Orange (#FF6D01) | High Risk |
| Red (#EA4335) | Critical/Alert/Rejection |
| Purple (#A142F4) | External party (vendor) |
| Gray (#9AA0A6) | System/automated steps |

## Related Files

- `docs/TPRM_Process_Documentation.md` - Full process documentation
- `scripts/generate_tprm_diagrams.py` - Diagram generation script
- `.claude/skills/auditboard/` - AuditBoard API integration

## Support

For questions about TPRM processes, contact the TPRM Team.
