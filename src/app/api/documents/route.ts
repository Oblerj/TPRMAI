import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { z } from 'zod'

const documentSchema = z.object({
  vendorId: z.string(),
  documentType: z.enum([
    'SOC2_TYPE1',
    'SOC2_TYPE2',
    'ISO27001',
    'PENTEST',
    'VULNERABILITY_SCAN',
    'SIG_QUESTIONNAIRE',
    'CAIQ',
    'CUSTOM_QUESTIONNAIRE',
    'INSURANCE_CERTIFICATE',
    'BUSINESS_CONTINUITY',
    'PRIVACY_POLICY',
    'OTHER',
  ]),
  documentName: z.string(),
  documentDate: z.string().optional(),
  expirationDate: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const vendorId = searchParams.get('vendorId')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const where: any = {}

    if (vendorId) {
      where.vendorId = vendorId
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.documentType = type
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        vendor: {
          select: { id: true, name: true },
        },
        _count: {
          select: { riskFindings: true },
        },
      },
      orderBy: { uploadDate: 'desc' },
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = documentSchema.parse(body)

    // Check if vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: validated.vendorId },
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Mark previous versions as not current
    if (validated.documentType) {
      await prisma.document.updateMany({
        where: {
          vendorId: validated.vendorId,
          documentType: validated.documentType,
          isCurrent: true,
        },
        data: { isCurrent: false },
      })
    }

    const document = await prisma.document.create({
      data: {
        vendorId: validated.vendorId,
        documentType: validated.documentType,
        documentName: validated.documentName,
        documentDate: validated.documentDate
          ? new Date(validated.documentDate)
          : null,
        expirationDate: validated.expirationDate
          ? new Date(validated.expirationDate)
          : null,
        status: 'RECEIVED',
        source: 'Manual Upload',
        isCurrent: true,
      },
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    )
  }
}
