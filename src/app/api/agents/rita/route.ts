import { NextRequest, NextResponse } from 'next/server'
import { rita } from '@/lib/agents'
import { z } from 'zod'

const reportRequestSchema = z.object({
  vendorId: z.string().optional(),
  assessmentId: z.string().optional(),
  reportType: z.enum([
    'EXECUTIVE_SUMMARY',
    'DETAILED_ASSESSMENT',
    'COMPLIANCE_STATUS',
    'TREND_ANALYSIS',
    'PORTFOLIO_OVERVIEW',
  ]),
  includeFindings: z.boolean().default(true),
  includeTrends: z.boolean().default(false),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = reportRequestSchema.parse(body)

    // Execute RITA agent
    const result = await rita.execute({
      vendorId: validated.vendorId,
      assessmentId: validated.assessmentId,
      reportType: validated.reportType,
      includeFindings: validated.includeFindings,
      includeTrends: validated.includeTrends,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Agent execution failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      report: result.data,
      processingTimeMs: result.processingTimeMs,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('RITA agent error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get executive dashboard data
    const result = await rita.generateExecutiveDashboard()

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate dashboard' },
        { status: 500 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
