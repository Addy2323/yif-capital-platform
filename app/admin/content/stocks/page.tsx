"use client"

import { useState } from "react"
import {
    TrendingUp,
    Search,
    Plus,
    MoreVertical,
    Edit2,
    Trash2,
    ArrowUpRight,
    ArrowDownRight,
    Download
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Stock } from "@/lib/market-data"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useAdminData } from "@/lib/admin-data-context"

interface StockFormData {
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
    volume: number
    marketCap: number
    sector: string
}

const emptyFormData: StockFormData = {
    symbol: "",
    name: "",
    price: 0,
    change: 0,
    changePercent: 0,
    volume: 0,
    marketCap: 0,
    sector: "",
}

export default function AdminStocksPage() {
    const { stocks, addStock, updateStock, deleteStock } = useAdminData()
    const [searchQuery, setSearchQuery] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
    const [formData, setFormData] = useState<StockFormData>(emptyFormData)

    const filteredStocks = stocks.filter(stock =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleAddStock = () => {
        const newStock: Stock = {
            symbol: formData.symbol,
            name: formData.name,
            price: formData.price,
            change: formData.change,
            changePercent: formData.changePercent,
            volume: formData.volume,
            marketCap: formData.marketCap,
            sector: formData.sector,
            industry: formData.sector,
            description: "",
            listingDate: new Date().toISOString().split("T")[0],
            freeFloat: "50%",
            avgVolume: formData.volume,
            high52w: formData.price * 1.2,
            low52w: formData.price * 0.8,
        }
        addStock(newStock)
        setFormData(emptyFormData)
        setIsAddDialogOpen(false)
    }

    const handleEditStock = () => {
        if (!selectedStock) return
        updateStock(selectedStock.symbol, formData)
        setFormData(emptyFormData)
        setSelectedStock(null)
        setIsEditDialogOpen(false)
    }

    const handleDeleteStock = () => {
        if (!selectedStock) return
        deleteStock(selectedStock.symbol)
        setSelectedStock(null)
        setIsDeleteDialogOpen(false)
    }

    const openEditDialog = (stock: Stock) => {
        setSelectedStock(stock)
        setFormData({
            symbol: stock.symbol,
            name: stock.name,
            price: stock.price,
            change: stock.change,
            changePercent: stock.changePercent,
            volume: stock.volume,
            marketCap: stock.marketCap,
            sector: stock.sector,
        })
        setIsEditDialogOpen(true)
    }

    const openDeleteDialog = (stock: Stock) => {
        setSelectedStock(stock)
        setIsDeleteDialogOpen(true)
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Stock Management</h1>
                    <p className="text-white/60">Manage DSE listed companies and real-time prices.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-gold/50 bg-gold/10 text-gold hover:bg-gold/20">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gold text-navy hover:bg-gold/90">
                                <Plus className="mr-2 h-4 w-4" />
                                Add New Stock
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add New Stock</DialogTitle>
                                <DialogDescription className="text-white/60">
                                    Enter the details for the new stock.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="symbol" className="text-right text-white/80">Symbol</Label>
                                    <Input
                                        id="symbol"
                                        value={formData.symbol}
                                        onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                                        className="col-span-3 bg-white/5 border-white/10 text-white"
                                        placeholder="e.g., CRDB"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right text-white/80">Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="col-span-3 bg-white/5 border-white/10 text-white"
                                        placeholder="e.g., CRDB Bank Plc"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="price" className="text-right text-white/80">Price (TZS)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        className="col-span-3 bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="change" className="text-right text-white/80">Change</Label>
                                    <Input
                                        id="change"
                                        type="number"
                                        value={formData.change}
                                        onChange={(e) => setFormData({ ...formData, change: Number(e.target.value) })}
                                        className="col-span-3 bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="changePercent" className="text-right text-white/80">Change %</Label>
                                    <Input
                                        id="changePercent"
                                        type="number"
                                        step="0.01"
                                        value={formData.changePercent}
                                        onChange={(e) => setFormData({ ...formData, changePercent: Number(e.target.value) })}
                                        className="col-span-3 bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="volume" className="text-right text-white/80">Volume</Label>
                                    <Input
                                        id="volume"
                                        type="number"
                                        value={formData.volume}
                                        onChange={(e) => setFormData({ ...formData, volume: Number(e.target.value) })}
                                        className="col-span-3 bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="marketCap" className="text-right text-white/80">Market Cap</Label>
                                    <Input
                                        id="marketCap"
                                        type="number"
                                        value={formData.marketCap}
                                        onChange={(e) => setFormData({ ...formData, marketCap: Number(e.target.value) })}
                                        className="col-span-3 bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="sector" className="text-right text-white/80">Sector</Label>
                                    <Input
                                        id="sector"
                                        value={formData.sector}
                                        onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                                        className="col-span-3 bg-white/5 border-white/10 text-white"
                                        placeholder="e.g., Banking, Industrial"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">
                                    Cancel
                                </Button>
                                <Button onClick={handleAddStock} className="bg-gold text-navy hover:bg-gold/90">
                                    Add Stock
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                    placeholder="Search by symbol or company name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
            </div>

            {/* Stocks Table */}
            <Card className="bg-white/5 border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-4 text-sm font-medium text-white/60">Company</th>
                                <th className="p-4 text-sm font-medium text-white/60">Price</th>
                                <th className="p-4 text-sm font-medium text-white/60">Change</th>
                                <th className="p-4 text-sm font-medium text-white/60">Market Cap</th>
                                <th className="p-4 text-sm font-medium text-white/60">Sector</th>
                                <th className="p-4 text-sm font-medium text-white/60 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {filteredStocks.map((stock) => (
                                <tr key={stock.symbol} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div>
                                            <p className="text-sm font-bold text-white">{stock.symbol}</p>
                                            <p className="text-xs text-white/40">{stock.name}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-white">
                                        TZS {stock.price.toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <div className={`flex items-center gap-1 text-sm font-medium ${stock.changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                                            {stock.changePercent >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                            {Math.abs(stock.changePercent)}%
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-white/60">
                                        TZS {(stock.marketCap / 1e12).toFixed(2)}T
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="outline" className="border-white/10 text-white/60">
                                            {stock.sector}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-white/40 hover:text-white">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-slate-800 border-white/10 text-white">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => openEditDialog(stock)} className="hover:bg-white/5 cursor-pointer">
                                                    <Edit2 className="mr-2 h-4 w-4" /> Edit Stock
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10" />
                                                <DropdownMenuItem onClick={() => openDeleteDialog(stock)} className="text-red-400 hover:bg-red-500/10 cursor-pointer">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Stock
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Stock</DialogTitle>
                        <DialogDescription className="text-white/60">
                            Modify the details for {selectedStock?.symbol}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-symbol" className="text-right text-white/80">Symbol</Label>
                            <Input
                                id="edit-symbol"
                                value={formData.symbol}
                                className="col-span-3 bg-white/5 border-white/10 text-white"
                                disabled
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right text-white/80">Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="col-span-3 bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-price" className="text-right text-white/80">Price (TZS)</Label>
                            <Input
                                id="edit-price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                className="col-span-3 bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-change" className="text-right text-white/80">Change</Label>
                            <Input
                                id="edit-change"
                                type="number"
                                value={formData.change}
                                onChange={(e) => setFormData({ ...formData, change: Number(e.target.value) })}
                                className="col-span-3 bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-changePercent" className="text-right text-white/80">Change %</Label>
                            <Input
                                id="edit-changePercent"
                                type="number"
                                step="0.01"
                                value={formData.changePercent}
                                onChange={(e) => setFormData({ ...formData, changePercent: Number(e.target.value) })}
                                className="col-span-3 bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-volume" className="text-right text-white/80">Volume</Label>
                            <Input
                                id="edit-volume"
                                type="number"
                                value={formData.volume}
                                onChange={(e) => setFormData({ ...formData, volume: Number(e.target.value) })}
                                className="col-span-3 bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-marketCap" className="text-right text-white/80">Market Cap</Label>
                            <Input
                                id="edit-marketCap"
                                type="number"
                                value={formData.marketCap}
                                onChange={(e) => setFormData({ ...formData, marketCap: Number(e.target.value) })}
                                className="col-span-3 bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-sector" className="text-right text-white/80">Sector</Label>
                            <Input
                                id="edit-sector"
                                value={formData.sector}
                                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                                className="col-span-3 bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button onClick={handleEditStock} className="bg-gold text-navy hover:bg-gold/90">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Delete Stock</DialogTitle>
                        <DialogDescription className="text-white/60">
                            Are you sure you want to delete {selectedStock?.symbol}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteStock} className="bg-red-600 text-white hover:bg-red-700">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
