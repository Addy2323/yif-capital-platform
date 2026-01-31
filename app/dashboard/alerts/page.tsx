"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getAllStocks, type Stock } from "@/lib/market-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Bell, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Trash2,
  AlertTriangle,
  Lock
} from "lucide-react"
import Link from "next/link"

interface PriceAlert {
  id: string
  symbol: string
  targetPrice: number
  condition: "above" | "below"
  createdAt: string
  triggered: boolean
}

const ALERTS_KEY = "yif_alerts"

export default function AlertsPage() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [stocks, setStocks] = useState<Stock[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newAlert, setNewAlert] = useState({
    symbol: "",
    targetPrice: "",
    condition: "above" as "above" | "below",
  })

  const isPro = user?.subscription?.plan === "pro" || user?.subscription?.plan === "institutional"

  useEffect(() => {
    const stored = localStorage.getItem(ALERTS_KEY)
    if (stored) {
      setAlerts(JSON.parse(stored))
    }
    setStocks(getAllStocks())
  }, [])

  const saveAlerts = (newAlerts: PriceAlert[]) => {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(newAlerts))
    setAlerts(newAlerts)
  }

  const addAlert = () => {
    if (!newAlert.symbol || !newAlert.targetPrice) return

    const alert: PriceAlert = {
      id: crypto.randomUUID(),
      symbol: newAlert.symbol,
      targetPrice: Number.parseFloat(newAlert.targetPrice),
      condition: newAlert.condition,
      createdAt: new Date().toISOString(),
      triggered: false,
    }

    saveAlerts([...alerts, alert])
    setNewAlert({ symbol: "", targetPrice: "", condition: "above" })
    setIsDialogOpen(false)
  }

  const removeAlert = (id: string) => {
    saveAlerts(alerts.filter((a) => a.id !== id))
  }

  if (!isPro) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gold/10">
            <Lock className="h-10 w-10 text-gold" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Price Alerts</h1>
          <p className="mt-4 text-muted-foreground">
            Set up custom price alerts to get notified when stocks reach your target prices.
            This feature is available on Pro and Institutional plans.
          </p>
          <Button asChild className="mt-8 bg-gold text-navy hover:bg-gold/90">
            <Link href="/pricing">Upgrade to Pro</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Price Alerts</h1>
          <p className="text-muted-foreground">Get notified when stocks reach your target prices</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold text-navy hover:bg-gold/90">
              <Plus className="mr-2 h-4 w-4" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Price Alert</DialogTitle>
              <DialogDescription>
                Set up an alert to be notified when a stock reaches your target price
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Stock Symbol</Label>
                <Select
                  value={newAlert.symbol}
                  onValueChange={(value) => setNewAlert({ ...newAlert, symbol: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a stock" />
                  </SelectTrigger>
                  <SelectContent>
                    {stocks.map((stock) => (
                      <SelectItem key={stock.symbol} value={stock.symbol}>
                        {stock.symbol} - {stock.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select
                  value={newAlert.condition}
                  onValueChange={(value: "above" | "below") => setNewAlert({ ...newAlert, condition: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Price goes above</SelectItem>
                    <SelectItem value="below">Price goes below</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Price (TZS)</Label>
                <Input
                  type="number"
                  placeholder="2500"
                  value={newAlert.targetPrice}
                  onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                />
              </div>
              <Button onClick={addAlert} className="w-full bg-gold text-navy hover:bg-gold/90">
                Create Alert
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.filter(a => !a.triggered).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Triggered Today</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.filter(a => a.triggered).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Alerts</CardTitle>
          <CardDescription>Manage your price alerts</CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No alerts yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first price alert to stay informed about market movements
              </p>
              <Button
                className="mt-4 bg-gold text-navy hover:bg-gold/90"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Alert
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => {
                const stock = stocks.find((s) => s.symbol === alert.symbol)
                
                return (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        alert.condition === "above" ? "bg-green-100" : "bg-red-100"
                      }`}>
                        {alert.condition === "above" ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{alert.symbol}</div>
                        <div className="text-sm text-muted-foreground">
                          Alert when price goes {alert.condition} TZS {alert.targetPrice.toLocaleString()}
                        </div>
                        {stock && (
                          <div className="text-xs text-muted-foreground">
                            Current: TZS {stock.price.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.triggered ? "default" : "secondary"}>
                        {alert.triggered ? "Triggered" : "Active"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAlert(alert.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
