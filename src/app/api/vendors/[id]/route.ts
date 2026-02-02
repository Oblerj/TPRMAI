import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { z } from 'zod'

const updateVendorSchema = z.object({
  name: z.string().min(1).optional(),
  legalName: z.string().optional(),
  dunsNumber: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
  country: z.string().optional(),
  stateProvince: z.string().optional(),
  primaryContactName: z.string().optional(),
  primaryContactEmail: z.string().email().optional().or(z.literal('')),
  primaryContactPhone: z.string().optional(),
  businessOwner: z.string().optional(),
  itOwner: z.string().optional(),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
  annualSpend: z.number().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'TERMINATED']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: params.id },
      include: {
        riskProfiles: {
          orderBy: { createdAt: 'desc' },
        },
        riskAssessments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        documents: {
          where: { isCurrent: true },
          orderBy: { uploadDate: 'desc' },
        },
        riskFindings: {
          where: { status: { not: 'CLOSED' } },
          orderBy: { severity: 'asc' },
        },
        remediationActions: {
          where: { status: { not: 'CLOSED' } },
          orderBy: { dueDate: 'asc' },
        },
      },
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    return NextResponse.json(vendor)
  } catch (error) {
    console.error('Error fetching vendor:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vendor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validated = updateVendorSchema.parse(body)

    const existingVendor = await prisma.vendor.findUnique({
      where: { id: params.id },
    })

    if (!existingVendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const updateData: any = { ...validated }
    if (validated.contractStartDate) {
      updateData.contractStartDate = new Date(validated.contractStartDate)
    }
    if (validated.contractEndDate) {
      updateData.contractEndDate = new Date(validated.contractEndDate)
    }

    const vendor = await prisma.vendor.update({
      where: { id: params.id },
      data: updateData,
    })

    // Create audit trail
    await prisma.auditTrail.create({
      data: {
        action: 'UPDATE',
        entityType: 'Vendor',
        entityId: vendor.id,
        oldValues: existingVendor as any,
        newValues: validated as any,
      },
    })

    return NextResponse.json(vendor)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error updating vendor:', error)
    return NextResponse.json(
      { error: 'Failed to update vendor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: params.id },
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Soft delete - set status to TERMINATED
    await prisma.vendor.update({
      where: { id: params.id },
      data: { status: 'TERMINATED' },
    })

    // Create audit trail
    await prisma.auditTrail.create({
      data: {
        action: 'DELETE',
        entityType: 'Vendor',
        entityId: params.id,
        oldValues: { status: vendor.status },
        newValues: { status: 'TERMINATED' },
      },
    })

    return NextResponse.json({ message: 'Vendor terminated successfully' })
  } catch (error) {
    console.error('Error deleting vendor:', error)
    return NextResponse.json(
      { error: 'Failed to delete vendor' },
      { status: 500 }
    )
  }
}
