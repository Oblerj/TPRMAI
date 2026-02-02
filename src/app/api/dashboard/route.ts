import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Fetch all dashboard metrics in parallel
    const [
      totalVendors,
      vendorsByStatus,
      vendorsByRiskTier,
      openFindings,
      findingsBySeverity,
      recentAssessments,
      overdueActions,
      expiringDocuments,
      recentActivity,
    ] = await Promise.all([
      // Total active vendors
      prisma.vendor.count({ where: { status: 'ACTIVE' } }),

      // Vendors by status
      prisma.vendor.groupBy({
        by: ['status'],
        _count: true,
      }),

      // Vendors by risk tier
      prisma.riskProfile.groupBy({
        by: ['riskTier'],
        _count: true,
        where: {
          vendor: { status: 'ACTIVE' },
        },
      }),

      // Open findings count
      prisma.riskFinding.count({
        where: { status: { not: 'CLOSED' } },
      }),

      // Findings by severity
      prisma.riskFinding.groupBy({
        by: ['severity'],
        _count: true,
        where: { status: { not: 'CLOSED' } },
      }),

      // Recent assessments (last 30 days)
      prisma.riskAssessment.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Overdue remediation actions
      prisma.remediationAction.count({
        where: {
          status: { in: ['OPEN', 'IN_PROGRESS'] },
          dueDate: { lt: new Date() },
        },
      }),

      // Documents expiring in 30 days
      prisma.document.count({
        where: {
          expirationDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            gt: new Date(),
          },
          status: { not: 'EXPIRED' },
        },
      }),

      // Recent agent activity
      prisma.agentActivityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          agentName: true,
          activityType: true,
          entityType: true,
          actionTaken: true,
          status: true,
          createdAt: true,
        },
      }),
    ])

    // Transform data for frontend
    const riskDistribution = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    }
    vendorsByRiskTier.forEach((item) => {
      riskDistribution[item.riskTier as keyof typeof riskDistribution] = item._count
    })

    const findingsDistribution = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      INFORMATIONAL: 0,
    }
    findingsBySeverity.forEach((item) => {
      findingsDistribution[item.severity as keyof typeof findingsDistribution] = item._count
    })

    const statusDistribution: Record<string, number> = {}
    vendorsByStatus.forEach((item) => {
      statusDistribution[item.status] = item._count
    })

    // Calculate key metrics
    const criticalFindings = findingsDistribution.CRITICAL + findingsDistribution.HIGH
    const complianceScore = totalVendors > 0
      ? Math.round(((totalVendors - riskDistribution.CRITICAL) / totalVendors) * 100)
      : 100

    return NextResponse.json({
      summary: {
        totalVendors,
        activeVendors: statusDistribution['ACTIVE'] || 0,
        criticalVendors: riskDistribution.CRITICAL,
        highRiskVendors: riskDistribution.HIGH,
        openFindings,
        criticalFindings,
        overdueActions,
        expiringDocuments,
        recentAssessments,
        complianceScore,
      },
      riskDistribution,
      findingsDistribution,
      statusDistribution,
      recentActivity,
      alerts: generateAlerts({
        criticalVendors: riskDistribution.CRITICAL,
        criticalFindings,
        overdueActions,
        expiringDocuments,
      }),
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

function generateAlerts(data: {
  criticalVendors: number
  criticalFindings: number
  overdueActions: number
  expiringDocuments: number
}) {
  const alerts: { type: string; message: string; severity: string }[] = []

  if (data.criticalVendors > 0) {
    alerts.push({
      type: 'CRITICAL_VENDORS',
      message: `${data.criticalVendors} vendor(s) classified as critical risk`,
      severity: 'critical',
    })
  }

  if (data.criticalFindings > 0) {
    alerts.push({
      type: 'CRITICAL_FINDINGS',
      message: `${data.criticalFindings} critical/high findings require attention`,
      severity: 'high',
    })
  }

  if (data.overdueActions > 0) {
    alerts.push({
      type: 'OVERDUE_ACTIONS',
      message: `${data.overdueActions} remediation action(s) are overdue`,
      severity: 'high',
    })
  }

  if (data.expiringDocuments > 0) {
    alerts.push({
      type: 'EXPIRING_DOCS',
      message: `${data.expiringDocuments} document(s) expiring within 30 days`,
      severity: 'medium',
    })
  }

  return alerts
}
