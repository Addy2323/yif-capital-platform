"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ModuleLayout, EmptyState, ErrorState } from "@/components/funds/module-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, DollarSign, Wallet, BarChart3 } from "lucide-react"
import type { Fund, FinancialsData } from "@/lib/types/funds"
import { cn } from "@/lib/utils"

export default function FinancialsPage() {
  const params = useParams()
  const fundId = params.fund_id as string

  const [fund, setFund] = useState<Fund | null>(null)
  const [financials, setFinancials] = useState<FinancialsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [fundRes, finRes] = await Promise.all([
          fetch(`/api/v1/funds/${fundId}`),
          fetch(`/api/v1/funds/${fundId}/financials`),
        ])
        const fundResult = await fundRes.json()
        const finResult = await finRes.json()

        if (!fundResult.success) {
          setError(fundResult.error || "Fund not found")
          return
        }
        setFund(fundResult.data)
        if (finResult.success) setFinancials(finResult.data)
      } catch (err) {
        setError("Failed to load financials")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [fundId])

  if (error) {
    return (
      <ModuleLayout fund={fund} fundId={fundId} activeModule="financials" showTimeframeSelector={false}>
        <ErrorState message={error} retry={() => window.location.reload()} />
      </ModuleLayout>
    )
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (value == null) return '-'
    return new Intl.NumberFormat('en-TZ', { style: 'currency', currency: fund?.base_currency || 'TZS', minimumFractionDigits: 0 }).format(value)
  }

  return (
    <ModuleLayout fund={fund} fundId={fundId} activeModule="financials" isLoading={isLoading} showTimeframeSelector={false}>
      <Tabs defaultValue="income" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="income" className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Income Statement</TabsTrigger>
          <TabsTrigger value="balance" className="flex items-center gap-2"><Wallet className="w-4 h-4" />Balance Sheet</TabsTrigger>
          <TabsTrigger value="cashflow" className="flex items-center gap-2"><BarChart3 className="w-4 h-4" />Cash Flow</TabsTrigger>
        </TabsList>

        {/* Income Statement */}
        <TabsContent value="income">
          <Card className="border-border/50">
            <CardHeader><CardTitle>Income Statement</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow><TableCell className="font-medium">Interest Income</TableCell><TableCell className="text-right">{formatCurrency(financials?.income_statement?.interest_income)}</TableCell></TableRow>
                  <TableRow><TableCell className="font-medium">Dividend Income</TableCell><TableCell className="text-right">{formatCurrency(financials?.income_statement?.dividend_income)}</TableCell></TableRow>
                  <TableRow><TableCell className="font-medium">Unrealized Gains/(Losses)</TableCell><TableCell className={cn("text-right", (financials?.income_statement?.unrealized_gains_losses ?? 0) >= 0 ? "text-green-600" : "text-red-600")}>{formatCurrency(financials?.income_statement?.unrealized_gains_losses)}</TableCell></TableRow>
                  <TableRow><TableCell className="font-medium">Realized Gains/(Losses)</TableCell><TableCell className={cn("text-right", (financials?.income_statement?.realized_gains_losses ?? 0) >= 0 ? "text-green-600" : "text-red-600")}>{formatCurrency(financials?.income_statement?.realized_gains_losses)}</TableCell></TableRow>
                  <TableRow><TableCell className="font-medium border-t">Total Income</TableCell><TableCell className="text-right font-bold border-t">{formatCurrency((financials?.income_statement?.interest_income ?? 0) + (financials?.income_statement?.dividend_income ?? 0) + (financials?.income_statement?.unrealized_gains_losses ?? 0) + (financials?.income_statement?.realized_gains_losses ?? 0))}</TableCell></TableRow>
                  <TableRow><TableCell className="font-medium text-muted-foreground">Management Fees</TableCell><TableCell className="text-right text-red-600">({formatCurrency(financials?.income_statement?.management_fees)})</TableCell></TableRow>
                  <TableRow><TableCell className="font-medium text-muted-foreground">Custody Fees</TableCell><TableCell className="text-right text-red-600">({formatCurrency(financials?.income_statement?.custody_fees)})</TableCell></TableRow>
                  <TableRow><TableCell className="font-medium text-muted-foreground">Other Expenses</TableCell><TableCell className="text-right text-red-600">({formatCurrency(financials?.income_statement?.other_expenses)})</TableCell></TableRow>
                  <TableRow className="bg-muted/30"><TableCell className="font-bold">Net Investment Income</TableCell><TableCell className="text-right font-bold">{formatCurrency(financials?.income_statement?.net_investment_income)}</TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balance Sheet */}
        <TabsContent value="balance">
          <Card className="border-border/50">
            <CardHeader><CardTitle>Balance Sheet</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow><TableCell colSpan={2} className="font-bold bg-muted/30">Assets</TableCell></TableRow>
                  <TableRow><TableCell className="pl-6">Cash & Equivalents</TableCell><TableCell className="text-right">{formatCurrency(financials?.balance_sheet?.assets?.cash)}</TableCell></TableRow>
                  <TableRow><TableCell className="pl-6">Investments</TableCell><TableCell className="text-right">{formatCurrency(financials?.balance_sheet?.assets?.investments)}</TableCell></TableRow>
                  <TableRow><TableCell className="pl-6">Receivables</TableCell><TableCell className="text-right">{formatCurrency(financials?.balance_sheet?.assets?.receivables)}</TableCell></TableRow>
                  <TableRow><TableCell className="font-medium">Total Assets</TableCell><TableCell className="text-right font-bold">{formatCurrency(financials?.balance_sheet?.total_assets)}</TableCell></TableRow>
                  <TableRow><TableCell colSpan={2} className="font-bold bg-muted/30">Liabilities</TableCell></TableRow>
                  <TableRow><TableCell className="pl-6">Payables</TableCell><TableCell className="text-right">{formatCurrency(financials?.balance_sheet?.liabilities?.payables)}</TableCell></TableRow>
                  <TableRow><TableCell className="pl-6">Management Fees Payable</TableCell><TableCell className="text-right">{formatCurrency(financials?.balance_sheet?.liabilities?.mgmt_fees)}</TableCell></TableRow>
                  <TableRow><TableCell className="font-medium">Total Liabilities</TableCell><TableCell className="text-right font-bold">{formatCurrency(financials?.balance_sheet?.total_liabilities)}</TableCell></TableRow>
                  <TableRow className="bg-green-500/10"><TableCell className="font-bold">Net Assets</TableCell><TableCell className="text-right font-bold text-green-600">{formatCurrency(financials?.balance_sheet?.net_assets)}</TableCell></TableRow>
                  <TableRow><TableCell className="font-medium">Units Outstanding</TableCell><TableCell className="text-right">{financials?.balance_sheet?.units_outstanding?.toLocaleString() || '-'}</TableCell></TableRow>
                  <TableRow><TableCell className="font-medium">NAV per Unit</TableCell><TableCell className="text-right">{financials?.balance_sheet?.nav_per_unit?.toFixed(4) || '-'}</TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow */}
        <TabsContent value="cashflow">
          <Card className="border-border/50">
            <CardHeader><CardTitle>Cash Flow Statement</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow><TableCell colSpan={2} className="font-bold bg-muted/30">Operating Activities</TableCell></TableRow>
                  <TableRow><TableCell className="pl-6">Investment Income (Cash)</TableCell><TableCell className="text-right">{formatCurrency(financials?.cash_flow?.operating?.investment_income_cash)}</TableCell></TableRow>
                  <TableRow><TableCell className="pl-6">Expenses Paid</TableCell><TableCell className="text-right text-red-600">({formatCurrency(financials?.cash_flow?.operating?.expenses_paid)})</TableCell></TableRow>
                  <TableRow><TableCell className="font-medium">Net Operating Cash</TableCell><TableCell className="text-right font-bold">{formatCurrency(financials?.cash_flow?.operating?.net)}</TableCell></TableRow>
                  <TableRow><TableCell colSpan={2} className="font-bold bg-muted/30">Investing Activities</TableCell></TableRow>
                  <TableRow><TableCell className="pl-6">Purchases</TableCell><TableCell className="text-right text-red-600">({formatCurrency(financials?.cash_flow?.investing?.purchases)})</TableCell></TableRow>
                  <TableRow><TableCell className="pl-6">Proceeds</TableCell><TableCell className="text-right">{formatCurrency(financials?.cash_flow?.investing?.proceeds)}</TableCell></TableRow>
                  <TableRow><TableCell className="font-medium">Net Investing Cash</TableCell><TableCell className="text-right font-bold">{formatCurrency(financials?.cash_flow?.investing?.net)}</TableCell></TableRow>
                  <TableRow><TableCell colSpan={2} className="font-bold bg-muted/30">Financing Activities</TableCell></TableRow>
                  <TableRow><TableCell className="pl-6">Units Issued</TableCell><TableCell className="text-right">{formatCurrency(financials?.cash_flow?.financing?.units_issued)}</TableCell></TableRow>
                  <TableRow><TableCell className="pl-6">Units Redeemed</TableCell><TableCell className="text-right text-red-600">({formatCurrency(financials?.cash_flow?.financing?.units_redeemed)})</TableCell></TableRow>
                  <TableRow><TableCell className="pl-6">Distributions</TableCell><TableCell className="text-right text-red-600">({formatCurrency(financials?.cash_flow?.financing?.distributions)})</TableCell></TableRow>
                  <TableRow><TableCell className="font-medium">Net Financing Cash</TableCell><TableCell className="text-right font-bold">{formatCurrency(financials?.cash_flow?.financing?.net)}</TableCell></TableRow>
                  <TableRow className="bg-muted/30"><TableCell className="font-bold">Net Cash Movement</TableCell><TableCell className="text-right font-bold">{formatCurrency(financials?.cash_flow?.net_cash_movement)}</TableCell></TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModuleLayout>
  )
}
