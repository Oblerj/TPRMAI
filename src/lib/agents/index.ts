/**
 * AI Agents Index
 *
 * Export all TPRM AI agents and orchestrator
 */

// Individual Agents
export { vera, VERAAgent } from './vera'
export { cara, CARAAgent } from './cara'
export { dora, DORAAgent } from './dora'
export { sara, SARAAgent } from './sara'
export { rita, RITAAgent } from './rita'
export { mars, MARSAgent } from './mars'

// Orchestrator
export { orchestrator, AgentOrchestrator } from './orchestrator'

// Types
export * from './types'

// Base Agent (for extension)
export { BaseAgent } from './base-agent'

/**
 * Agent Summary:
 *
 * VERA - Vendor Evaluation & Risk Assessment Agent
 *   - Collects vendor information
 *   - Determines risk profile and tier
 *   - Sets assessment frequency
 *
 * CARA - Critical Assessment & Risk Analyzer Agent
 *   - Deep-dive assessments for Critical/High vendors
 *   - Multi-dimensional risk scoring
 *   - Detailed recommendations
 *
 * DORA - Documentation & Outreach Retrieval Agent
 *   - Requests documents from vendors
 *   - Tracks document status
 *   - Manages document inventory
 *
 * SARA - Security Analysis & Risk Articulation Agent
 *   - Analyzes security documents
 *   - Identifies findings and gaps
 *   - Maps to SNBR risk framework
 *
 * RITA - Report Intelligence & Threat Assessment Agent
 *   - Generates risk reports
 *   - Creates dashboards and metrics
 *   - Trend analysis
 *
 * MARS - Management, Action & Remediation Supervisor Agent
 *   - Creates remediation plans
 *   - Tracks progress and escalates
 *   - Manages risk acceptance
 */
