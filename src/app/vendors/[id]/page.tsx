'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Building2,
  Shield,
  FileText,
  AlertTriangle,
  Play,
  Loader2,
  CheckCircle2,
} from 'lucide-react'

interface VendorDetail {
  id: string
  name: string
  legalName: string | null
  website: string | null
  industry: string | null
  country: string | null
  status: string
  primaryContactName: string | null
  primaryContactEmail: string | null
  annualSpend: number | null
  riskProfiles: {
    id: string
    riskTier: string
    overallRiskScore: number | null
    hasPiiAccess: boolean
    hasPhiAccess: boolean
    hasPciAccess: boolean
    assessmentFrequency: string | null
    nextAssessmentDate: string | null
  }[]
  riskAssessments: {
    id: string
    assessmentType: string
    assessmentStatus: string
    riskRating: string | null
    assessmentDate: string | null
  }[]
  documents: {
    id: string
    documentType: string
    documentName: string
    status: string
    uploadDate: string
  }[]
  riskFindings: {
    id: string
    title: string
    severity: string
    status: string
    dueDate: string | null
  }[]
}

export default function VendorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [vendor, setVendor] = useState<VendorDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [runningAgent, setRunningAgent] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchVendor()
    }
  }, [params.id])

  const fetchVendor = async () => {
    try {
      const res = await fetch(`/api/vendors/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setVendor(data)
      }
    } catch (error) {
      console.error('Failed to fetch vendor:', error)
    } finally {
      setLoading(false)
    }
  }

  const runVERA = async () => {
    if (!vendor) return
    setRunningAgent('VERA')
    try {
      const res = await fetch('/api/agents/vera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: vendor.id,
          dataTypesAccessed: ['Customer Data'],
          systemIntegrations: [],
          hasPiiAccess: true,
          hasPhiAccess: false,
          hasPciAccess: false,
          businessCriticality: 'IMPORTANT',
        }),
      })
      if (res.ok) {
        await fetchVendor()
        alert('Risk profile created successfully!')
      }
    } catch (error) {
      console.error('VERA error:', error)
      alert('Failed to run VERA agent')
    } finally {
      setRunningAgent(null)
    }
  }

  const runCARA = async () => {
    if (!vendor) return
    setRunningAgent('CARA')
    try {
      const res = await fetch('/api/agents/cara', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: vendor.id,
          assessmentType: 'INITIAL',
        }),
      })
      if (res.ok) {
        await fetchVendor()
        alert('Assessment completed successfully!')
      }
    } catch (error) {
      console.error('CARA error:', error)
      alert('Failed to run CARA agent')
    } finally {
      setRunningAgent(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Vendor not found</h2>
        <Link href="/vendors">
          <Button className="mt-4">Back to Vendors</Button>
        </Link>
      </div>
    )
  }

  const riskProfile = vendor.riskProfiles[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/vendors">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
              <Badge
                variant={
                  riskProfile?.riskTier === 'CRITICAL'
                    ? 'critical'
                    : riskProfile?.riskTier === 'HIGH'
                    ? 'high'
                    : riskProfile?.riskTier === 'MEDIUM'
                    ? 'medium'
                    : riskProfile?.riskTier === 'LOW'
                    ? 'low'
                    : 'outline'
                }
              >
                {riskProfile?.riskTier || 'Not Assessed'}
              </Badge>
            </div>
            <p className="text-gray-500">{vendor.industry || 'No industry specified'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!riskProfile && (
            <Button onClick={runVERA} disabled={!!runningAgent}>
              {runningAgent === 'VERA' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Run Risk Profile (VERA)
            </Button>
          )}
          {riskProfile && ['CRITICAL', 'HIGH'].includes(riskProfile.riskTier) && (
            <Button onClick={runCARA} disabled={!!runningAgent}>
              {runningAgent === 'CARA' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Run Assessment (CARA)
            </Button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {riskProfile?.overallRiskScore ?? '-'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Open Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {vendor.riskFindings.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{vendor.documents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{vendor.riskAssessments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Profile */}
      {riskProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Risk Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Data Access</p>
                <div className="flex gap-2 mt-1">
                  {riskProfile.hasPiiAccess && (
                    <Badge variant="high">PII</Badge>
                  )}
                  {riskProfile.hasPhiAccess && (
                    <Badge variant="critical">PHI</Badge>
                  )}
                  {riskProfile.hasPciAccess && (
                    <Badge variant="high">PCI</Badge>
                  )}
                  {!riskProfile.hasPiiAccess &&
                    !riskProfile.hasPhiAccess &&
                    !riskProfile.hasPciAccess && (
                      <Badge variant="low">None</Badge>
                    )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Assessment Frequency</p>
                <p className="font-medium">{riskProfile.assessmentFrequency || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Next Assessment</p>
                <p className="font-medium">
                  {riskProfile.nextAssessmentDate
                    ? new Date(riskProfile.nextAssessmentDate).toLocaleDateString()
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge>{vendor.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Open Findings ({vendor.riskFindings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vendor.riskFindings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendor.riskFindings.map((finding) => (
                  <TableRow key={finding.id}>
                    <TableCell className="font-medium">{finding.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          finding.severity === 'CRITICAL'
                            ? 'critical'
                            : finding.severity === 'HIGH'
                            ? 'high'
                            : finding.severity === 'MEDIUM'
                            ? 'medium'
                            : 'low'
                        }
                      >
                        {finding.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>{finding.status}</TableCell>
                    <TableCell>
                      {finding.dueDate
                        ? new Date(finding.dueDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>No open findings</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents ({vendor.documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vendor.documents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendor.documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.documentName}</TableCell>
                    <TableCell>{doc.documentType}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No documents uploaded</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
