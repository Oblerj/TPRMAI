'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Bot,
  Play,
  CheckCircle2,
  Loader2,
  Shield,
  FileSearch,
  FileText,
  BarChart3,
  Wrench,
  AlertTriangle,
} from 'lucide-react'

const agents = [
  {
    id: 'VERA',
    name: 'VERA',
    fullName: 'Vendor Evaluation & Risk Assessment Agent',
    description:
      'Collects and processes vendor information to determine initial risk profile. Calculates risk tier, identifies data sensitivity, and sets assessment frequency.',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    capabilities: [
      'Vendor risk profiling',
      'Risk tier calculation',
      'Assessment scheduling',
      'Compliance requirement identification',
    ],
  },
  {
    id: 'CARA',
    name: 'CARA',
    fullName: 'Critical Assessment & Risk Analyzer Agent',
    description:
      'Performs deep-dive assessments on Critical and High-risk vendors. Evaluates security, operational, compliance, financial, and reputational risks.',
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    capabilities: [
      'Multi-dimensional risk scoring',
      'Business continuity assessment',
      'Financial stability analysis',
      'Concentration risk evaluation',
    ],
  },
  {
    id: 'DORA',
    name: 'DORA',
    fullName: 'Documentation & Outreach Retrieval Agent',
    description:
      'Obtains security documentation from vendors and external sources. Manages document requests, tracks status, and monitors expiration dates.',
    icon: FileSearch,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    capabilities: [
      'Automated document requests',
      'External API integration',
      'Document inventory management',
      'Expiration tracking',
    ],
  },
  {
    id: 'SARA',
    name: 'SARA',
    fullName: 'Security Analysis & Risk Articulation Agent',
    description:
      'Analyzes security documents to identify key risks. Parses SOC2 reports, penetration tests, and questionnaires to extract control gaps.',
    icon: FileText,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    capabilities: [
      'SOC2 report analysis',
      'Penetration test review',
      'Control gap identification',
      'SNBR risk framework mapping',
    ],
  },
  {
    id: 'RITA',
    name: 'RITA',
    fullName: 'Report Intelligence & Threat Assessment Agent',
    description:
      'Creates comprehensive summary reports of third-party risks. Generates executive summaries, detailed assessments, and trend analysis.',
    icon: BarChart3,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    capabilities: [
      'Executive report generation',
      'Compliance status reporting',
      'Trend analysis',
      'Dashboard metrics',
    ],
  },
  {
    id: 'MARS',
    name: 'MARS',
    fullName: 'Management, Action & Remediation Supervisor Agent',
    description:
      'Manages ongoing risk treatment and remediation activities. Creates action plans, tracks progress, and handles escalations.',
    icon: Wrench,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    capabilities: [
      'Remediation planning',
      'Progress tracking',
      'Escalation management',
      'Risk acceptance workflow',
    ],
  },
]

export default function AgentsPage() {
  const [runningAgent, setRunningAgent] = useState<string | null>(null)
  const [runningMaintenance, setRunningMaintenance] = useState(false)

  const runMaintenance = async () => {
    setRunningMaintenance(true)
    try {
      const res = await fetch('/api/orchestrator', { method: 'PATCH' })
      if (res.ok) {
        const data = await res.json()
        alert(
          `Maintenance cycle completed:\n` +
            `- Overdue escalations: ${data.maintenance.overdueEscalations}\n` +
            `- Expiring documents: ${data.maintenance.expiringDocuments}\n` +
            `- Upcoming assessments: ${data.maintenance.upcomingAssessments}`
        )
      }
    } catch (error) {
      console.error('Maintenance error:', error)
      alert('Failed to run maintenance cycle')
    } finally {
      setRunningMaintenance(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Agents</h1>
          <p className="text-gray-500">
            Manage and monitor TPRM AI agents
          </p>
        </div>
        <Button onClick={runMaintenance} disabled={runningMaintenance}>
          {runningMaintenance ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Run Maintenance Cycle
        </Button>
      </div>

      {/* Agent Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Workflow</CardTitle>
          <CardDescription>
            The AI agents work together in a coordinated workflow to manage third-party risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-4">
            {agents.map((agent, idx) => (
              <div key={agent.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`p-3 rounded-full ${agent.bgColor} ${agent.color}`}
                  >
                    <agent.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold mt-1">{agent.name}</span>
                </div>
                {idx < agents.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-300 mx-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg ${agent.bgColor}`}>
                  <agent.icon className={`h-6 w-6 ${agent.color}`} />
                </div>
                <Badge variant="outline" className="text-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <CardTitle className="flex items-center gap-2 mt-4">
                <span className={`font-bold ${agent.color}`}>{agent.name}</span>
              </CardTitle>
              <CardDescription>{agent.fullName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{agent.description}</p>

              <div>
                <h4 className="text-sm font-medium mb-2">Capabilities:</h4>
                <ul className="space-y-1">
                  {agent.capabilities.map((cap, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-600 flex items-center gap-2"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      {cap}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use AI Agents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Vendor Onboarding Workflow</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Create a new vendor in the Vendors section</li>
                <li>Run VERA to create the initial risk profile</li>
                <li>For Critical/High vendors, run CARA for detailed assessment</li>
                <li>DORA will request required documentation</li>
                <li>Upload documents and run SARA for analysis</li>
                <li>RITA generates reports automatically</li>
                <li>MARS manages any findings and remediation</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-2">API Endpoints</h4>
              <ul className="space-y-1 text-sm font-mono text-gray-600">
                <li>POST /api/agents/vera - Risk profiling</li>
                <li>POST /api/agents/cara - Assessment</li>
                <li>POST /api/agents/sara - Document analysis</li>
                <li>POST /api/agents/rita - Report generation</li>
                <li>POST /api/agents/mars - Remediation</li>
                <li>POST /api/orchestrator - Full workflow</li>
                <li>PATCH /api/orchestrator - Maintenance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
