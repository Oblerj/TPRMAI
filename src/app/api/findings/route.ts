import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { z } from 'zod'

const findingUpdateSchema = z.object({
  status: z
    .enum([
      'OPEN',
      'IN_REMEDIATION',
      'PENDING_VERIFICATION',
      'RESOLVED',
      'ACCEPTED',
      'CLOSED',
    ])
    .optional(),
  dueDate: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const vendorId = searchParams.get('vendorId')
    const severity = searchParams.get('severity')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}

    if (vendorId) {
      where.vendorId = vendorId
    }

    if (severity) {
      where.severity = severity
    }

    if (status) {
      where.status = status
    } else {
      // By default, exclude closed findings
      where.status = { not: 'CLOSED' }
    }

    const [findings, total] = await Promise.all([
      prisma.riskFinding.findMany({
        where,
        include: {
          vendor: {
            select: { id: true, name: true },
          },
          document: {
            select: { id: true, documentType: true, documentName: true },
          },
          remediationActions: {
            where: { status: { not: 'CLOSED' } },
          },
        },
        orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.riskFinding.count({ where }),
    ])

    return NextResponse.json({
      findings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching findings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch findings' },
      { status: 500 }
    )
  }
}

// Get findings summary/stats
export async function HEAD(request: NextRequest) {
  try {
    const stats = await prisma.riskFinding.groupBy({
      by: ['severity'],
      _count: true,
      where: { status: { not: 'CLOSED' } },
    })

    const headers = new Headers()
    headers.set('X-Findings-Stats', JSON.stringify(stats))

    return new NextResponse(null, { status: 200, headers })
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}
