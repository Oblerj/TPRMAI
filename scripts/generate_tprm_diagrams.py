#!/usr/bin/env python3
"""
TPRM Process Flow Diagram Generator

Generates visual process flow diagrams from TPRM documentation.
Outputs:
  - Mermaid diagram files (.mmd)
  - HTML viewer with interactive diagrams
  - PNG/SVG images (requires mermaid-cli: npm install -g @mermaid-js/mermaid-cli)

Usage:
    python generate_tprm_diagrams.py [--output-dir OUTPUT_DIR] [--format FORMAT]

    --output-dir: Directory for output files (default: ./diagrams)
    --format: Output format - html, mermaid, png, svg, all (default: all)
"""

import os
import sys
import argparse
import subprocess
import json
from pathlib import Path
from datetime import datetime


# =============================================================================
# TPRM PROCESS DIAGRAMS - Mermaid Definitions
# =============================================================================

DIAGRAMS = {
    "tprm_lifecycle": {
        "title": "TPRM Lifecycle",
        "description": "Overview of the Third Party Risk Management lifecycle phases",
        "mermaid": """
flowchart LR
    subgraph LIFECYCLE["TPRM LIFECYCLE"]
        A[("1. IDENTIFY<br/>Vendor Selection")] --> B[("2. ASSESS<br/>Risk Assessment")]
        B --> C[("3. ENGAGE<br/>Contracting")]
        C --> D[("4. MONITOR<br/>Ongoing Oversight")]
        D --> E[("5. EXIT<br/>Offboarding")]
        E -.-> A
    end

    style A fill:#4285F4,stroke:#1a73e8,color:#fff
    style B fill:#FBBC04,stroke:#f9a825,color:#000
    style C fill:#34A853,stroke:#1e8e3e,color:#fff
    style D fill:#A142F4,stroke:#8430ce,color:#fff
    style E fill:#EA4335,stroke:#c5221f,color:#fff
"""
    },

    "vendor_onboarding": {
        "title": "Vendor Onboarding Process",
        "description": "Complete workflow for onboarding new third-party vendors",
        "mermaid": """
flowchart TD
    START((Start)) --> A[Business Unit submits<br/>vendor request]
    A --> B[TPRM Team<br/>reviews request]
    B --> C[Request vendor<br/>questionnaire]
    C --> D[Vendor submits<br/>questionnaire]
    D --> E[Determine inherent<br/>risk tier]

    E --> F{Risk Tier?}
    F -->|High/Critical| G[Enhanced<br/>due diligence]
    F -->|Medium| H[Standard<br/>due diligence]
    F -->|Low| I[Limited<br/>due diligence]

    G --> J{Approved?}
    H --> J
    I --> J

    J -->|No| K[Return to BU<br/>with findings]
    K --> END1((End<br/>Rejected))

    J -->|Yes| L[Contract<br/>negotiation]
    L --> M[System access<br/>provisioning]
    M --> N[Add to<br/>monitoring]
    N --> END2((End<br/>Active))

    style START fill:#34A853,stroke:#1e8e3e,color:#fff
    style END1 fill:#EA4335,stroke:#c5221f,color:#fff
    style END2 fill:#34A853,stroke:#1e8e3e,color:#fff
    style F fill:#FBBC04,stroke:#f9a825,color:#000
    style J fill:#FBBC04,stroke:#f9a825,color:#000
    style G fill:#EA4335,stroke:#c5221f,color:#fff
    style H fill:#4285F4,stroke:#1a73e8,color:#fff
    style I fill:#34A853,stroke:#1e8e3e,color:#fff
"""
    },

    "risk_assessment": {
        "title": "Risk Assessment Process",
        "description": "Risk scoring and assessment workflow",
        "mermaid": """
flowchart TD
    subgraph INHERENT["INHERENT RISK ASSESSMENT"]
        A1[Data Sensitivity<br/>1-5] --> CALC
        A2[Access Level<br/>1-5] --> CALC
        A3[Criticality Rating<br/>1-5] --> CALC
        A4[Financial Exposure<br/>1-5] --> CALC
        CALC[Calculate<br/>Inherent Risk Score<br/>4-20]
    end

    CALC --> TIER{Risk Tier}

    TIER -->|15-20| HIGH[HIGH RISK<br/>Enhanced DD<br/>Semi-annual review]
    TIER -->|10-14| MED[MEDIUM RISK<br/>Standard DD<br/>Annual review]
    TIER -->|4-9| LOW[LOW RISK<br/>Limited DD<br/>Biennial review]

    subgraph CONTROLS["CONTROL ASSESSMENT"]
        HIGH --> CA
        MED --> CA
        LOW --> CA
        CA[Control Assessment]
        CA --> C1[Security controls]
        CA --> C2[Compliance certs]
        CA --> C3[Pen test results]
        CA --> C4[SOC reports]
        CA --> C5[BC/DR review]
    end

    C1 --> RES
    C2 --> RES
    C3 --> RES
    C4 --> RES
    C5 --> RES

    RES[RESIDUAL RISK<br/>Inherent - Controls]
    RES --> RATING((Final<br/>Risk Rating))

    style TIER fill:#FBBC04,stroke:#f9a825,color:#000
    style HIGH fill:#EA4335,stroke:#c5221f,color:#fff
    style MED fill:#FBBC04,stroke:#f9a825,color:#000
    style LOW fill:#34A853,stroke:#1e8e3e,color:#fff
    style RATING fill:#A142F4,stroke:#8430ce,color:#fff
"""
    },

    "due_diligence": {
        "title": "Due Diligence Process",
        "description": "Swimlane diagram for due diligence workflow",
        "mermaid": """
flowchart TD
    subgraph ANALYST["TPRM Analyst"]
        A1[Prepare DD package] --> A2[Request documents]
        A5[Review SOC reports] --> A6[Compile findings<br/>& rating]
    end

    subgraph VENDOR["Vendor"]
        V1[Provide evidence<br/>& documents]
    end

    subgraph SME["SME Reviewers"]
        S1[Security review]
        S2[Legal review]
        S3[Privacy review]
    end

    subgraph MANAGER["TPRM Manager"]
        M1[Review & approve]
    end

    A2 --> V1
    V1 --> A5
    A5 --> S1
    S1 --> S2
    S2 --> S3
    S3 --> A6
    A6 --> M1
    M1 --> DONE((Complete))

    style A1 fill:#4285F4,stroke:#1a73e8,color:#fff
    style A2 fill:#4285F4,stroke:#1a73e8,color:#fff
    style A5 fill:#4285F4,stroke:#1a73e8,color:#fff
    style A6 fill:#4285F4,stroke:#1a73e8,color:#fff
    style V1 fill:#A142F4,stroke:#8430ce,color:#fff
    style S1 fill:#FBBC04,stroke:#f9a825,color:#000
    style S2 fill:#FBBC04,stroke:#f9a825,color:#000
    style S3 fill:#FBBC04,stroke:#f9a825,color:#000
    style M1 fill:#34A853,stroke:#1e8e3e,color:#fff
    style DONE fill:#34A853,stroke:#1e8e3e,color:#fff
"""
    },

    "contract_management": {
        "title": "Contract & SLA Management",
        "description": "Contract negotiation and management workflow",
        "mermaid": """
flowchart TD
    START[Risk Assessment<br/>Complete] --> A[TPRM provides<br/>security requirements]

    A --> B[Legal drafts/<br/>reviews contract]

    B --> REQ[Required Clauses]
    REQ --> R1[Data protection]
    REQ --> R2[Security standards]
    REQ --> R3[Audit rights]
    REQ --> R4[Breach notification]
    REQ --> R5[Termination rights]
    REQ --> R6[SLA definitions]

    B --> C{Vendor<br/>accepts?}

    C -->|No| D[Negotiate terms]
    D --> C

    C -->|Yes| E[Execute contract]
    E --> F[Record in CLM<br/>& AuditBoard]
    F --> G[Set renewal<br/>reminders]
    G --> DONE((Complete))

    style START fill:#4285F4,stroke:#1a73e8,color:#fff
    style C fill:#FBBC04,stroke:#f9a825,color:#000
    style DONE fill:#34A853,stroke:#1e8e3e,color:#fff
    style REQ fill:#9AA0A6,stroke:#5f6368,color:#fff
"""
    },

    "ongoing_monitoring": {
        "title": "Ongoing Monitoring Process",
        "description": "Continuous vendor monitoring and reassessment workflow",
        "mermaid": """
flowchart TD
    subgraph CONTINUOUS["CONTINUOUS MONITORING"]
        M1[Security Ratings<br/>BitSight/SecurityScorecard]
        M2[News & Media<br/>Alerts]
        M3[Financial Health<br/>Monitors]
        M1 --> DASH
        M2 --> DASH
        M3 --> DASH
        DASH[Alert Dashboard]
    end

    DASH --> A{Alert<br/>triggered?}

    A -->|No| LOG[Document in<br/>AuditBoard]
    A -->|Yes| B[TPRM Analyst<br/>investigates]

    B --> C{Material<br/>impact?}

    C -->|No| LOG
    C -->|Yes| D[Escalate to<br/>TPRM Manager]

    D --> E[Initiate<br/>reassessment]
    E --> LOG

    LOG --> PERIODIC

    subgraph PERIODIC["PERIODIC REASSESSMENT"]
        P1[Critical: Quarterly]
        P2[High: Semi-annual]
        P3[Medium: Annual]
        P4[Low: Biennial]
    end

    style A fill:#FBBC04,stroke:#f9a825,color:#000
    style C fill:#FBBC04,stroke:#f9a825,color:#000
    style D fill:#EA4335,stroke:#c5221f,color:#fff
    style E fill:#EA4335,stroke:#c5221f,color:#fff
    style DASH fill:#4285F4,stroke:#1a73e8,color:#fff
"""
    },

    "incident_response": {
        "title": "Vendor Incident Response",
        "description": "Process for responding to vendor security incidents",
        "mermaid": """
flowchart TD
    START((Incident<br/>Detected)) --> A[Log incident<br/>in system]
    A --> B[Initial triage<br/>& severity]

    B --> SEV{Severity?}

    SEV --> P1[P1 - Critical]
    SEV --> P2[P2 - High]
    SEV --> P3[P3 - Medium]
    SEV --> P4[P4 - Low]

    P1 --> NOTIFY
    P2 --> NOTIFY
    P3 --> NOTIFY
    P4 --> NOTIFY

    NOTIFY[Notify stakeholders<br/>per severity SLA]

    NOTIFY --> C[Coordinate with<br/>vendor]
    C --> D[Assess impact to<br/>our data/operations]

    D --> E{Our data<br/>affected?}

    E -->|Yes| F[Activate internal<br/>IR process]
    F --> G
    E -->|No| G[Monitor vendor<br/>remediation]

    G --> H[Post-incident<br/>review]
    H --> I[Update risk<br/>assessment]

    I --> J{Continue<br/>vendor?}

    J -->|No| K[Initiate<br/>offboarding]
    K --> END1((End))

    J -->|Yes| L[Update controls<br/>& monitoring]
    L --> END2((Complete))

    style START fill:#EA4335,stroke:#c5221f,color:#fff
    style SEV fill:#FBBC04,stroke:#f9a825,color:#000
    style P1 fill:#EA4335,stroke:#c5221f,color:#fff
    style P2 fill:#FF6D01,stroke:#e65100,color:#fff
    style P3 fill:#FBBC04,stroke:#f9a825,color:#000
    style P4 fill:#34A853,stroke:#1e8e3e,color:#fff
    style E fill:#FBBC04,stroke:#f9a825,color:#000
    style J fill:#FBBC04,stroke:#f9a825,color:#000
    style END1 fill:#EA4335,stroke:#c5221f,color:#fff
    style END2 fill:#34A853,stroke:#1e8e3e,color:#fff
"""
    },

    "vendor_offboarding": {
        "title": "Vendor Offboarding Process",
        "description": "Complete workflow for offboarding vendors",
        "mermaid": """
flowchart TD
    START((Offboarding<br/>Triggered)) --> TRIG

    subgraph TRIG["TRIGGERS"]
        T1[Contract expiration]
        T2[Business decision]
        T3[Risk-based termination]
    end

    TRIG --> A[Notify vendor<br/>per contract terms]

    A --> PARALLEL

    subgraph PARALLEL["PARALLEL WORKSTREAMS"]
        subgraph DATA["DATA"]
            D1[Request data return]
            D2[Verify deletion]
            D3[Get destruction cert]
        end

        subgraph ACCESS["ACCESS"]
            A1[Revoke system access]
            A2[Disable VPN]
            A3[Remove from directories]
        end

        subgraph KNOWLEDGE["KNOWLEDGE"]
            K1[Document processes]
            K2[Transfer knowledge]
            K3[Archive records]
        end
    end

    PARALLEL --> CHECK

    subgraph CHECK["OFFBOARDING CHECKLIST"]
        C1[✓ Data destruction cert]
        C2[✓ All access revoked]
        C3[✓ Final invoice settled]
        C4[✓ Documentation archived]
        C5[✓ Contract terminated]
        C6[✓ AuditBoard updated]
    end

    CHECK --> B[Final review<br/>& sign-off]
    B --> C[Archive vendor<br/>in AuditBoard]
    C --> DONE((Complete))

    style START fill:#EA4335,stroke:#c5221f,color:#fff
    style DONE fill:#34A853,stroke:#1e8e3e,color:#fff
    style D1 fill:#4285F4,stroke:#1a73e8,color:#fff
    style A1 fill:#A142F4,stroke:#8430ce,color:#fff
    style K1 fill:#FBBC04,stroke:#f9a825,color:#000
"""
    },

    "raci_matrix": {
        "title": "RACI Matrix",
        "description": "Responsibility assignment matrix for TPRM processes",
        "mermaid": """
flowchart LR
    subgraph LEGEND["LEGEND"]
        R[R = Responsible]
        A[A = Accountable]
        C[C = Consulted]
        I[I = Informed]
    end

    subgraph MATRIX["TPRM RACI MATRIX"]
        direction TB

        subgraph H["Headers"]
            BU[Business Unit]
            TA[TPRM Analyst]
            TM[TPRM Manager]
            SEC[Security]
            LEG[Legal]
            IT[IT]
        end

        subgraph ACTIVITIES["Activities"]
            ACT1["Vendor Request: R/A | I | I | I | I | I"]
            ACT2["Risk Assessment: C | R | A | C | C | C"]
            ACT3["Due Diligence: I | R | A | C | C | I"]
            ACT4["Contract Review: C | C | I | C | R/A | I"]
            ACT5["Access Provisioning: C | I | I | C | I | R/A"]
            ACT6["Monitoring: I | R | A | C | I | I"]
            ACT7["Incident Response: I | R | C | A | C | C"]
            ACT8["Offboarding: C | R | A | C | C | R"]
        end
    end

    style R fill:#4285F4,stroke:#1a73e8,color:#fff
    style A fill:#EA4335,stroke:#c5221f,color:#fff
    style C fill:#FBBC04,stroke:#f9a825,color:#000
    style I fill:#9AA0A6,stroke:#5f6368,color:#fff
"""
    },

    "risk_tier_matrix": {
        "title": "Risk Tier Decision Matrix",
        "description": "Visual guide for determining vendor risk tiers",
        "mermaid": """
flowchart TD
    subgraph INPUT["RISK FACTORS"]
        F1["Data Sensitivity<br/>(1-5)"]
        F2["Access Level<br/>(1-5)"]
        F3["Business Criticality<br/>(1-5)"]
        F4["Financial Exposure<br/>(1-5)"]
    end

    F1 --> SCORE
    F2 --> SCORE
    F3 --> SCORE
    F4 --> SCORE

    SCORE["TOTAL SCORE<br/>(4-20)"]

    SCORE --> T1
    SCORE --> T2
    SCORE --> T3
    SCORE --> T4

    subgraph TIERS["RISK TIERS"]
        T1["CRITICAL (18-20)<br/>━━━━━━━━━━━━<br/>Full Enhanced DD<br/>Quarterly Review<br/>Approver: CISO + VP"]
        T2["HIGH (15-17)<br/>━━━━━━━━━━━━<br/>Enhanced DD<br/>Semi-annual Review<br/>Approver: TPRM Director"]
        T3["MEDIUM (10-14)<br/>━━━━━━━━━━━━<br/>Standard DD<br/>Annual Review<br/>Approver: TPRM Manager"]
        T4["LOW (4-9)<br/>━━━━━━━━━━━━<br/>Limited DD<br/>Biennial Review<br/>Approver: TPRM Analyst"]
    end

    style T1 fill:#EA4335,stroke:#c5221f,color:#fff
    style T2 fill:#FF6D01,stroke:#e65100,color:#fff
    style T3 fill:#FBBC04,stroke:#f9a825,color:#000
    style T4 fill:#34A853,stroke:#1e8e3e,color:#fff
    style SCORE fill:#4285F4,stroke:#1a73e8,color:#fff
"""
    }
}


# =============================================================================
# GENERATOR FUNCTIONS
# =============================================================================

def ensure_directory(path: Path) -> None:
    """Create directory if it doesn't exist."""
    path.mkdir(parents=True, exist_ok=True)


def generate_mermaid_files(output_dir: Path) -> list:
    """Generate individual Mermaid diagram files."""
    mermaid_dir = output_dir / "mermaid"
    ensure_directory(mermaid_dir)

    generated = []
    for name, diagram in DIAGRAMS.items():
        filepath = mermaid_dir / f"{name}.mmd"
        content = f"%%{{ title: {diagram['title']} }}%%\n"
        content += f"%% {diagram['description']} %%\n\n"
        content += diagram['mermaid'].strip()

        filepath.write_text(content, encoding='utf-8')
        generated.append(filepath)
        print(f"  Created: {filepath}")

    return generated


def generate_html_viewer(output_dir: Path) -> Path:
    """Generate HTML file with all diagrams rendered via Mermaid.js."""

    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TPRM Process Flow Diagrams</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <style>
        :root {
            --bg-primary: #1a1a2e;
            --bg-secondary: #16213e;
            --bg-card: #0f3460;
            --text-primary: #eaeaea;
            --text-secondary: #a0a0a0;
            --accent: #e94560;
            --border: #0f3460;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
        }

        .header {
            background: var(--bg-secondary);
            padding: 2rem;
            text-align: center;
            border-bottom: 3px solid var(--accent);
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }

        .header p {
            color: var(--text-secondary);
            font-size: 1.1rem;
        }

        .nav {
            background: var(--bg-secondary);
            padding: 1rem 2rem;
            position: sticky;
            top: 0;
            z-index: 100;
            border-bottom: 1px solid var(--border);
        }

        .nav ul {
            list-style: none;
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            justify-content: center;
        }

        .nav a {
            color: var(--text-primary);
            text-decoration: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            background: var(--bg-card);
            transition: all 0.3s ease;
            font-size: 0.9rem;
        }

        .nav a:hover {
            background: var(--accent);
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }

        .diagram-section {
            background: var(--bg-secondary);
            border-radius: 12px;
            margin-bottom: 2rem;
            overflow: hidden;
            border: 1px solid var(--border);
        }

        .diagram-header {
            background: var(--bg-card);
            padding: 1.5rem;
            border-bottom: 1px solid var(--border);
        }

        .diagram-header h2 {
            color: var(--accent);
            margin-bottom: 0.5rem;
        }

        .diagram-header p {
            color: var(--text-secondary);
        }

        .diagram-content {
            padding: 2rem;
            background: #ffffff;
            display: flex;
            justify-content: center;
            overflow-x: auto;
        }

        .mermaid {
            min-width: 100%;
        }

        .controls {
            padding: 1rem 1.5rem;
            background: var(--bg-card);
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
        }

        .btn {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }

        .btn-primary {
            background: var(--accent);
            color: white;
        }

        .btn-primary:hover {
            background: #ff6b6b;
        }

        .btn-secondary {
            background: var(--bg-secondary);
            color: var(--text-primary);
            border: 1px solid var(--border);
        }

        .btn-secondary:hover {
            background: var(--bg-primary);
        }

        .footer {
            text-align: center;
            padding: 2rem;
            color: var(--text-secondary);
            border-top: 1px solid var(--border);
        }

        @media print {
            .nav, .controls, .btn {
                display: none;
            }
            .diagram-section {
                break-inside: avoid;
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>TPRM Process Flow Diagrams</h1>
        <p>Third Party Risk Management - Visual Process Documentation</p>
        <p style="margin-top: 0.5rem; font-size: 0.9rem;">Generated: """ + datetime.now().strftime("%Y-%m-%d %H:%M") + """</p>
    </div>

    <nav class="nav">
        <ul>
"""

    # Add navigation links
    for name, diagram in DIAGRAMS.items():
        html_content += f'            <li><a href="#{name}">{diagram["title"]}</a></li>\n'

    html_content += """        </ul>
    </nav>

    <div class="container">
"""

    # Add diagram sections
    for name, diagram in DIAGRAMS.items():
        html_content += f"""
        <section id="{name}" class="diagram-section">
            <div class="diagram-header">
                <h2>{diagram['title']}</h2>
                <p>{diagram['description']}</p>
            </div>
            <div class="diagram-content">
                <div class="mermaid">
{diagram['mermaid']}
                </div>
            </div>
            <div class="controls">
                <button class="btn btn-secondary" onclick="downloadSVG('{name}')">Download SVG</button>
                <button class="btn btn-primary" onclick="downloadPNG('{name}')">Download PNG</button>
            </div>
        </section>
"""

    html_content += """
    </div>

    <footer class="footer">
        <p>TPRM Process Documentation - AI TPRM Machine</p>
        <p>For use with Lucidchart import or standalone viewing</p>
    </footer>

    <script>
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            },
            securityLevel: 'loose'
        });

        function downloadSVG(diagramId) {
            const section = document.getElementById(diagramId);
            const svg = section.querySelector('svg');
            if (svg) {
                const svgData = new XMLSerializer().serializeToString(svg);
                const blob = new Blob([svgData], {type: 'image/svg+xml'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = diagramId + '.svg';
                a.click();
                URL.revokeObjectURL(url);
            }
        }

        function downloadPNG(diagramId) {
            const section = document.getElementById(diagramId);
            const svg = section.querySelector('svg');
            if (svg) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const svgData = new XMLSerializer().serializeToString(svg);
                const img = new Image();

                // Get SVG dimensions
                const bbox = svg.getBoundingClientRect();
                canvas.width = bbox.width * 2;
                canvas.height = bbox.height * 2;
                ctx.scale(2, 2);
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                img.onload = function() {
                    ctx.drawImage(img, 0, 0);
                    const a = document.createElement('a');
                    a.href = canvas.toDataURL('image/png');
                    a.download = diagramId + '.png';
                    a.click();
                };

                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
            }
        }
    </script>
</body>
</html>
"""

    filepath = output_dir / "TPRM_Diagrams.html"
    filepath.write_text(html_content, encoding='utf-8')
    print(f"  Created: {filepath}")

    return filepath


def generate_png_images(output_dir: Path) -> list:
    """Generate PNG images using mermaid-cli (mmdc)."""
    png_dir = output_dir / "png"
    ensure_directory(png_dir)

    mermaid_dir = output_dir / "mermaid"
    generated = []

    # Check if mmdc is available
    try:
        subprocess.run(["mmdc", "--version"], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("  Warning: mermaid-cli (mmdc) not found.")
        print("  Install with: npm install -g @mermaid-js/mermaid-cli")
        print("  Skipping PNG generation.")
        return generated

    for name in DIAGRAMS.keys():
        input_file = mermaid_dir / f"{name}.mmd"
        output_file = png_dir / f"{name}.png"

        try:
            subprocess.run([
                "mmdc",
                "-i", str(input_file),
                "-o", str(output_file),
                "-b", "white",
                "-w", "1200"
            ], capture_output=True, check=True)
            generated.append(output_file)
            print(f"  Created: {output_file}")
        except subprocess.CalledProcessError as e:
            print(f"  Error generating {name}.png: {e}")

    return generated


def generate_svg_images(output_dir: Path) -> list:
    """Generate SVG images using mermaid-cli (mmdc)."""
    svg_dir = output_dir / "svg"
    ensure_directory(svg_dir)

    mermaid_dir = output_dir / "mermaid"
    generated = []

    # Check if mmdc is available
    try:
        subprocess.run(["mmdc", "--version"], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("  Warning: mermaid-cli (mmdc) not found.")
        print("  Install with: npm install -g @mermaid-js/mermaid-cli")
        print("  Skipping SVG generation.")
        return generated

    for name in DIAGRAMS.keys():
        input_file = mermaid_dir / f"{name}.mmd"
        output_file = svg_dir / f"{name}.svg"

        try:
            subprocess.run([
                "mmdc",
                "-i", str(input_file),
                "-o", str(output_file),
                "-b", "white"
            ], capture_output=True, check=True)
            generated.append(output_file)
            print(f"  Created: {output_file}")
        except subprocess.CalledProcessError as e:
            print(f"  Error generating {name}.svg: {e}")

    return generated


def generate_index(output_dir: Path) -> Path:
    """Generate an index file listing all diagrams."""
    index_content = f"""# TPRM Process Diagrams

Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")}

## Diagrams

| Diagram | Description | Files |
|---------|-------------|-------|
"""

    for name, diagram in DIAGRAMS.items():
        index_content += f"| {diagram['title']} | {diagram['description']} | "
        index_content += f"[mmd](mermaid/{name}.mmd) "
        index_content += f"[svg](svg/{name}.svg) "
        index_content += f"[png](png/{name}.png) |\n"

    index_content += """
## Viewing Options

1. **HTML Viewer**: Open `TPRM_Diagrams.html` in a browser for interactive viewing with download options

2. **Mermaid Files**: Import `.mmd` files into:
   - [Mermaid Live Editor](https://mermaid.live)
   - VS Code with Mermaid extension
   - Notion, GitHub, GitLab (native support)

3. **Lucidchart Import**:
   - Use SVG files for direct import
   - Or recreate using the visual patterns in HTML viewer

4. **Image Files**: PNG/SVG files for documentation and presentations

## Regenerating Diagrams

```bash
python generate_tprm_diagrams.py --output-dir ./diagrams --format all
```

### Options

- `--format html`: HTML viewer only
- `--format mermaid`: Mermaid source files only
- `--format png`: PNG images (requires mermaid-cli)
- `--format svg`: SVG images (requires mermaid-cli)
- `--format all`: All formats (default)
"""

    filepath = output_dir / "README.md"
    filepath.write_text(index_content, encoding='utf-8')
    print(f"  Created: {filepath}")

    return filepath


# =============================================================================
# MAIN
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Generate TPRM process flow diagrams"
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="./diagrams",
        help="Output directory for generated files (default: ./diagrams)"
    )
    parser.add_argument(
        "--format",
        type=str,
        choices=["html", "mermaid", "png", "svg", "all"],
        default="all",
        help="Output format (default: all)"
    )

    args = parser.parse_args()

    # Resolve output directory
    script_dir = Path(__file__).parent.parent
    output_dir = Path(args.output_dir)
    if not output_dir.is_absolute():
        output_dir = script_dir / output_dir

    ensure_directory(output_dir)

    print(f"\n{'='*60}")
    print("TPRM Process Flow Diagram Generator")
    print(f"{'='*60}")
    print(f"Output directory: {output_dir}")
    print(f"Format: {args.format}")
    print(f"{'='*60}\n")

    # Generate based on format
    if args.format in ["mermaid", "all"]:
        print("Generating Mermaid files...")
        generate_mermaid_files(output_dir)
        print()

    if args.format in ["html", "all"]:
        print("Generating HTML viewer...")
        generate_html_viewer(output_dir)
        print()

    if args.format in ["png", "all"]:
        print("Generating PNG images...")
        generate_png_images(output_dir)
        print()

    if args.format in ["svg", "all"]:
        print("Generating SVG images...")
        generate_svg_images(output_dir)
        print()

    print("Generating index...")
    generate_index(output_dir)

    print(f"\n{'='*60}")
    print("Generation complete!")
    print(f"{'='*60}")
    print(f"\nOpen {output_dir / 'TPRM_Diagrams.html'} in a browser to view diagrams.")
    print(f"See {output_dir / 'README.md'} for usage instructions.\n")


if __name__ == "__main__":
    main()
