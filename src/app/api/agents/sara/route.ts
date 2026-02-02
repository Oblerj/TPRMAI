import { NextRequest, NextResponse } from 'next/server'
import { sara } from '@/lib/agents'
import prisma from '@/lib/db'
import { z } from 'zod'

const analysisRequestSchema = z.object({
  vendorId: z.string(),
  documentId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = analysisRequestSchema.parse(body)

    // Get document and vendor info
    const document = await prisma.document.findUnique({
      where: { id: validated.documentId },
      include: {
        vendor: {
          include: {
            riskProfiles: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (document.vendorId !== validated.vendorId) {
      return NextResponse.json(
        { error: 'Document does not belong to this vendor' },
        { status: 400 }
      )
    }

    // Update document status to analyzing
    await prisma.document.update({
      where: { id: validated.documentId },
      data: { status: 'ANALYZING' },
    })

    // For now, use placeholder content - in production, read from file
    const documentContent = document.analysisResult ||
      `Document Type: ${document.documentType}\n` +
      `Document Name: ${document.documentName}\n` +
      `This is a placeholder for the actual document content.\n` +
      `In production, this would be extracted from the uploaded file.`

    // Execute SARA agent
    const result = await sara.execute({
      vendorId: validated.vendorId,
      documentId: validated.documentId,
      documentType: document.documentType,
      documentContent,
      vendorContext: {
        name: document.vendor.name,
        riskTier: document.vendor.riskProfiles[0]?.riskTier || 'MEDIUM',
        dataAccess: document.vendor.riskProfiles[0]?.dataTypesAccessed || [],
      },
    })

    if (!result.success) {
      // Revert document status on failure
      await prisma.document.update({
        where: { id: validated.documentId },
        data: { status: 'RECEIVED' },
      })

      return NextResponse.json(
        { error: result.error || 'Agent execution failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      analysis: result.data,
      processingTimeMs: result.processingTimeMs,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('SARA agent error:', error)
    return NextResponse.json(
      { error: 'Failed to execute document analysis' },
      { status: 500 }
    )
  }
}
