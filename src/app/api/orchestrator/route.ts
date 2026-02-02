import { NextRequest, NextResponse } from 'next/server'
import { orchestrator } from '@/lib/agents'
import prisma from '@/lib/db'
import { z } from 'zod'

const onboardRequestSchema = z.object({
  vendorId: z.string(),
  dataTypesAccessed: z.array(z.string()).default([]),
  systemIntegrations: z.array(z.string()).default([]),
  hasPiiAccess: z.boolean().default(false),
  hasPhiAccess: z.boolean().default(false),
  hasPciAccess: z.boolean().default(false),
  businessCriticality: z.enum([
    'MISSION_CRITICAL',
    'BUSINESS_CRITICAL',
    'IMPORTANT',
    'STANDARD',
  ]),
})

const documentProcessSchema = z.object({
  vendorId: z.string(),
  documentId: z.string(),
  documentContent: z.string().optional(),
})

// Full vendor onboarding workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = onboardRequestSchema.parse(body)

    // Get vendor info
    const vendor = await prisma.vendor.findUnique({
      where: { id: validated.vendorId },
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Execute full onboarding workflow
    const result = await orchestrator.onboardVendor({
      vendorId: validated.vendorId,
      vendorName: vendor.name,
      industry: vendor.industry || undefined,
      dataTypesAccessed: validated.dataTypesAccessed,
      systemIntegrations: validated.systemIntegrations,
      hasPiiAccess: validated.hasPiiAccess,
      hasPhiAccess: validated.hasPhiAccess,
      hasPciAccess: validated.hasPciAccess,
      businessCriticality: validated.businessCriticality,
      annualSpend: vendor.annualSpend ? Number(vendor.annualSpend) : undefined,
    })

    return NextResponse.json({
      success: result.overallSuccess,
      workflow: result,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Orchestrator error:', error)
    return NextResponse.json(
      { error: 'Failed to execute onboarding workflow' },
      { status: 500 }
    )
  }
}

// Document processing workflow
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = documentProcessSchema.parse(body)

    const document = await prisma.document.findUnique({
      where: { id: validated.documentId },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Use provided content or placeholder
    const content = validated.documentContent ||
      `Document: ${document.documentName}\nType: ${document.documentType}`

    const result = await orchestrator.processDocument(
      validated.vendorId,
      validated.documentId,
      document.documentType,
      content
    )

    return NextResponse.json({
      success: result.overallSuccess,
      workflow: result,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Document processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    )
  }
}

// Maintenance cycle
export async function PATCH() {
  try {
    const result = await orchestrator.runMaintenanceCycle()

    return NextResponse.json({
      success: true,
      maintenance: result,
    })
  } catch (error) {
    console.error('Maintenance error:', error)
    return NextResponse.json(
      { error: 'Failed to run maintenance cycle' },
      { status: 500 }
    )
  }
}
