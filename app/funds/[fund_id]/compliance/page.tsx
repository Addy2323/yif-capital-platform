"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ModuleLayout, EmptyState, ErrorState } from "@/components/funds/module-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle, AlertTriangle, XCircle, FileWarning } from "lucide-react"
import type { Fund, ComplianceData, ComplianceStatus } from "@/lib/types/funds"
import { cn } from "@/lib/utils"

export default function CompliancePage() {
  const params = useParams()
  const fundId = params.fund_id as string

  const [fund, setFund] = useState<Fund | null>(null)
  const [compliance, setCompliance] = useState<ComplianceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [fundRes, compRes] = await Promise.all([
          fetch(`/api/v1/funds/${fundId}`),
          fetch(`/api/v1/funds/${fundId}/compliance`),
        ])
        const fundResult = await fundRes.json()
        const compResult = await compRes.json()

        if (!fundResult.success) {
          setError(fundResult.error || "Fund not found")
          return
        }
        setFund(fundResult.data)
        if (compResult.success) setCompliance(compResult.data)
      } catch (err) {
        setError("Failed to load compliance data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [fundId])

  if (error) {
    return (
      <ModuleLayout fund={fund} fundId={fundId} activeModule="compliance" showTimeframeSelector={false}>
        <ErrorState message={error} retry={() => window.location.reload()} />
      </ModuleLayout>
    )
  }

  const getStatusIcon = (status: 'green' | 'amber' | 'red') => {
    switch (status) {
      case 'green': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'amber': return <AlertTriangle className="w-5 h-5 text-amber-500" />
      case 'red': return <XCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusBadge = (status: ComplianceStatus) => {
    switch (status) {
      case 'COMPLIANT': return <Badge className="bg-green-500 text-white">COMPLIANT</Badge>
      case 'WATCH': return <Badge className="bg-amber-500 text-white">WATCH</Badge>
      case 'BREACH': return <Badge className="bg-red-500 text-white">BREACH</Badge>
    }
  }

  return (
    <ModuleLayout fund={fund} fundId={fundId} activeModule="compliance" isLoading={isLoading} showTimeframeSelector={false}>
      <div className="space-y-6">
        {/* Overall Status Banner */}
        <Card className={cn(
          "border-2",
          compliance?.overall_status === 'COMPLIANT' && 'border-green-500/50 bg-green-500/5',
          compliance?.overall_status === 'WATCH' && 'border-amber-500/50 bg-amber-500/5',
          compliance?.overall_status === 'BREACH' && 'border-red-500/50 bg-red-500/5'
        )}>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Shield className={cn(
                  "w-10 h-10",
                  compliance?.overall_status === 'COMPLIANT' && 'text-green-500',
                  compliance?.overall_status === 'WATCH' && 'text-amber-500',
                  compliance?.overall_status === 'BREACH' && 'text-red-500'
                )} />
                <div>
                  <h2 className="text-xl font-bold">Overall Status</h2>
                  <p className="text-sm text-muted-foreground">Based on {compliance?.checks?.length || 0} compliance checks</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                {getStatusBadge(compliance?.overall_status || 'COMPLIANT')}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{compliance?.green_count || 0}</p>
                    <p className="text-xs text-muted-foreground">Passing</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">{compliance?.amber_count || 0}</p>
                    <p className="text-xs text-muted-foreground">Warning</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{compliance?.red_count || 0}</p>
                    <p className="text-xs text-muted-foreground">Breach</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Checks Table */}
        <Card className="border-border/50">
          <CardHeader><CardTitle>Compliance Checks</CardTitle></CardHeader>
          <CardContent>
            {compliance?.checks && compliance.checks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="text-right">Limit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Checked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compliance.checks.map((check, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{check.rule_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(check.rule_type === 'regulatory' ? 'border-blue-500 text-blue-500' : 'border-purple-500 text-purple-500')}>
                          {check.rule_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{check.current_value}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{check.limit_value}</TableCell>
                      <TableCell>{getStatusIcon(check.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(check.last_checked_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState title="No Compliance Checks" message="Compliance monitoring is not configured for this fund." />
            )}
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  )
}
