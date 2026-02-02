'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertTriangle } from 'lucide-react'

interface Finding {
  id: string
  title: string
  severity: string
  status: string
  dueDate: string | null
  vendor: {
    id: string
    name: string
  }
  document: {
    id: string
    documentType: string
  } | null
}

export default function FindingsPage() {
  const [findings, setFindings] = useState<Finding[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFindings()
  }, [])

  const fetchFindings = async () => {
    try {
      const res = await fetch('/api/findings')
      if (res.ok) {
        const data = await res.json()
        setFindings(data.findings || [])
      }
    } catch (error) {
      console.error('Failed to fetch findings:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Risk Findings</h1>
        <p className="text-gray-500">Track and manage security findings across vendors</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Open Findings ({findings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : findings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Finding</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {findings.map((finding) => (
                  <TableRow key={finding.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {finding.title}
                    </TableCell>
                    <TableCell>{finding.vendor.name}</TableCell>
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
                    <TableCell>
                      <Badge variant="outline">{finding.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {finding.dueDate
                        ? new Date(finding.dueDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {finding.document?.documentType || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No findings yet
              </h3>
              <p className="text-gray-500">
                Findings will appear here after document analysis
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
