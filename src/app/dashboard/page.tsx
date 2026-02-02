'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  AlertTriangle,
  FileWarning,
  Clock,
  TrendingUp,
  Shield,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

interface DashboardData {
  summary: {
    totalVendors: number
    activeVendors: number
    criticalVendors: number
    highRiskVendors: number
    openFindings: number
    criticalFindings: number
    overdueActions: number
    expiringDocuments: number
    recentAssessments: number
    complianceScore: number
  }
  riskDistribution: {
    CRITICAL: number
    HIGH: number
    MEDIUM: number
    LOW: number
  }
  findingsDistribution: {
    CRITICAL: number
    HIGH: number
    MEDIUM: number
    LOW: number
    INFORMATIONAL: number
  }
  alerts: {
    type: string
    message: string
    severity: string
  }[]
  recentActivity: {
    id: string
    agentName: string
    activityType: string
    actionTaken: string
    status: string
    createdAt: string
  }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  // Use mock data if no data from API
  const summary = data?.summary || {
    totalVendors: 0,
    activeVendors: 0,
    criticalVendors: 0,
    highRiskVendors: 0,
    openFindings: 0,
    criticalFindings: 0,
    overdueActions: 0,
    expiringDocuments: 0,
    recentAssessments: 0,
    complianceScore: 100,
  }

  const riskDistribution = data?.riskDistribution || {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Risk Dashboard</h1>
        <p className="text-gray-500">
          Third Party Risk Management Overview for Sleep Number
        </p>
      </div>

      {/* Alerts Section */}
      {data?.alerts && data.alerts.length > 0 && (
        <div className="space-y-2">
          {data.alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                alert.severity === 'critical'
                  ? 'bg-red-50 border border-red-200'
                  : alert.severity === 'high'
                  ? 'bg-orange-50 border border-orange-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}
            >
              <AlertTriangle
                className={`h-5 w-5 ${
                  alert.severity === 'critical'
                    ? 'text-red-600'
                    : alert.severity === 'high'
                    ? 'text-orange-600'
                    : 'text-yellow-600'
                }`}
              />
              <span className="text-sm font-medium">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Vendors
            </CardTitle>
            <Building2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalVendors}</div>
            <p className="text-xs text-gray-500">
              {summary.activeVendors} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Critical/High Risk
            </CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summary.criticalVendors + summary.highRiskVendors}
            </div>
            <p className="text-xs text-gray-500">
              {summary.criticalVendors} critical, {summary.highRiskVendors} high
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Open Findings
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.openFindings}</div>
            <p className="text-xs text-gray-500">
              {summary.criticalFindings} critical/high
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Compliance Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {summary.complianceScore}%
            </div>
            <p className="text-xs text-gray-500">
              Based on risk distribution
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Overdue Actions
            </CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summary.overdueActions}
            </div>
            <p className="text-xs text-gray-500">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Expiring Documents
            </CardTitle>
            <FileWarning className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {summary.expiringDocuments}
            </div>
            <p className="text-xs text-gray-500">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Recent Assessments
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.recentAssessments}</div>
            <p className="text-xs text-gray-500">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(riskDistribution).map(([tier, count]) => (
                <div key={tier} className="flex items-center gap-4">
                  <Badge
                    variant={
                      tier === 'CRITICAL'
                        ? 'critical'
                        : tier === 'HIGH'
                        ? 'high'
                        : tier === 'MEDIUM'
                        ? 'medium'
                        : 'low'
                    }
                    className="w-20 justify-center"
                  >
                    {tier}
                  </Badge>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          tier === 'CRITICAL'
                            ? 'bg-red-500'
                            : tier === 'HIGH'
                            ? 'bg-orange-500'
                            : tier === 'MEDIUM'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${
                            summary.totalVendors > 0
                              ? (count / summary.totalVendors) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium w-8 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Agent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent AI Agent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.recentActivity && data.recentActivity.length > 0 ? (
                data.recentActivity.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-2 rounded-lg bg-gray-50"
                  >
                    <div
                      className={`p-1.5 rounded-full ${
                        activity.status === 'SUCCESS'
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}
                    >
                      {activity.status === 'SUCCESS' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {activity.agentName}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {activity.activityType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {activity.actionTaken}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent activity</p>
                  <p className="text-xs mt-1">
                    Agent activity will appear here once you start using the
                    system
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Agents Overview */}
      <Card>
        <CardHeader>
          <CardTitle>AI Agents Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {
                name: 'VERA',
                full: 'Vendor Evaluation & Risk Assessment',
                status: 'Ready',
              },
              {
                name: 'CARA',
                full: 'Critical Assessment & Risk Analyzer',
                status: 'Ready',
              },
              {
                name: 'DORA',
                full: 'Documentation & Outreach Retrieval',
                status: 'Ready',
              },
              {
                name: 'SARA',
                full: 'Security Analysis & Risk Articulation',
                status: 'Ready',
              },
              {
                name: 'RITA',
                full: 'Report Intelligence & Threat Assessment',
                status: 'Ready',
              },
              {
                name: 'MARS',
                full: 'Management, Action & Remediation Supervisor',
                status: 'Ready',
              },
            ].map((agent) => (
              <div
                key={agent.name}
                className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="font-bold text-blue-600">{agent.name}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {agent.full}
                </p>
                <Badge variant="outline" className="mt-2 text-xs">
                  {agent.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
