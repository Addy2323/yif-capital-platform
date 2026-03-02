"use client"

import { useState } from "react"
import {
    Layers,
    Search,
    Plus,
    MoreVertical,
    Edit2,
    Trash2,
    Download
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ETF } from "@/lib/market-data"
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

interface ETFFormData {
    symbol: string
    name: string
    price: number
    changePercent: number
    provider: string
    category: string
}

const emptyFormData: ETFFormData = {
    symbol: "",
    name: "",
    price: 0,
    changePercent: 0,
    provider: "",
    category: "",
}

export default function AdminEtfsPage() {
    const { etfList, addEtf, updateEtf, deleteEtf } = useAdminData()
    const [searchQuery, setSearchQuery] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedEtf, setSelectedEtf] = useState<ETF | null>(null)
    const [formData, setFormData] = useState<ETFFormData>(emptyFormData)

    const filteredEtfs = etfList.filter(etf =>
        etf.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        etf.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleAddEtf = () => {
        const newEtf: ETF = {
            symbol: formData.symbol,
            name: formData.name,
            price: formData.price,
            changePercent: formData.changePercent,
            provider: formData.provider,
            category: formData.category,
            expenseRatio: 0.5,
            objectives: "",
            manager: formData.provider,
            inceptionDate: new Date().toISOString().split("T")[0],
            navHistory: [],
            performance: [],
            benchmark: "",
            assetAllocation: [],
        }
        addEtf(newEtf)
        setFormData(emptyFormData)
        setIsAddDialogOpen(false)
    }

    const handleEditEtf = () => {
        if (!selectedEtf) return
        updateEtf(selectedEtf.symbol, formData)
        setFormData(emptyFormData)
        setSelectedEtf(null)
        setIsEditDialogOpen(false)
    }

    const handleDeleteEtf = () => {
        if (!selectedEtf) return
        deleteEtf(selectedEtf.symbol)
        setSelectedEtf(null)
        setIsDeleteDialogOpen(false)
    }

    const openEditDialog = (etf: ETF) => {
        setSelectedEtf(etf)
        setFormData({
            symbol: etf.symbol,
            name: etf.name,
            price: etf.price,
            changePercent: etf.changePercent,
            provider: etf.provider,
            category: etf.category,
        })
        setIsEditDialogOpen(true)
    }

    const openDeleteDialog = (etf: ETF) => {
        setSelectedEtf(etf)
        setIsDeleteDialogOpen(true)
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">ETF Management</h1>
                    <p className="text-white/60">Manage Exchange Traded Funds and their providers.</p>
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
                                Add New ETF
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-white/10 text-white">
                            <DialogHeader>
                                <DialogTitle>Add New ETF</DialogTitle>
                                <DialogDescription className="text-white/60">
                                    Enter the details for the new ETF.
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
                                        placeholder="e.g., TZTOP20"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right text-white/80">Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="col-span-3 bg-white/5 border-white/10 text-white"
                                        placeholder="e.g., Tanzania Top 20 ETF"
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
                                    <Label htmlFor="provider" className="text-right text-white/80">Provider</Label>
                                    <Input
                                        id="provider"
                                        value={formData.provider}
                                        onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                        className="col-span-3 bg-white/5 border-white/10 text-white"
                                        placeholder="e.g., YIF Capital"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="category" className="text-right text-white/80">Category</Label>
                                    <Input
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="col-span-3 bg-white/5 border-white/10 text-white"
                                        placeholder="e.g., Equity, Regional, Commodity"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">
                                    Cancel
                                </Button>
                                <Button onClick={handleAddEtf} className="bg-gold text-navy hover:bg-gold/90">
                                    Add ETF
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                    placeholder="Search by symbol or ETF name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
            </div>

            <Card className="bg-white/5 border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-4 text-sm font-medium text-white/60">ETF</th>
                                <th className="p-4 text-sm font-medium text-white/60">Price</th>
                                <th className="p-4 text-sm font-medium text-white/60">Change</th>
                                <th className="p-4 text-sm font-medium text-white/60">Provider</th>
                                <th className="p-4 text-sm font-medium text-white/60">Category</th>
                                <th className="p-4 text-sm font-medium text-white/60 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {filteredEtfs.map((etf) => (
                                <tr key={etf.symbol} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div>
                                            <p className="text-sm font-bold text-white">{etf.symbol}</p>
                                            <p className="text-xs text-white/40">{etf.name}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-white">
                                        TZS {etf.price.toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <div className={`text-sm font-medium ${etf.changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                                            {etf.changePercent >= 0 ? "+" : ""}{etf.changePercent}%
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-white/60">
                                        {etf.provider}
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="outline" className="border-white/10 text-white/60">
                                            {etf.category}
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
                                                <DropdownMenuItem onClick={() => openEditDialog(etf)} className="hover:bg-white/5 cursor-pointer">
                                                    <Edit2 className="mr-2 h-4 w-4" /> Edit ETF
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10" />
                                                <DropdownMenuItem onClick={() => openDeleteDialog(etf)} className="text-red-400 hover:bg-red-500/10 cursor-pointer">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete ETF
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
                <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit ETF</DialogTitle>
                        <DialogDescription className="text-white/60">
                            Modify the details for {selectedEtf?.symbol}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-symbol" className="text-right text-white/80">Symbol</Label>
                            <Input
                                id="edit-symbol"
                                value={formData.symbol}
                                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
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
                            <Label htmlFor="edit-provider" className="text-right text-white/80">Provider</Label>
                            <Input
                                id="edit-provider"
                                value={formData.provider}
                                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                className="col-span-3 bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-category" className="text-right text-white/80">Category</Label>
                            <Input
                                id="edit-category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="col-span-3 bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button onClick={handleEditEtf} className="bg-gold text-navy hover:bg-gold/90">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Delete ETF</DialogTitle>
                        <DialogDescription className="text-white/60">
                            Are you sure you want to delete {selectedEtf?.symbol}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteEtf} className="bg-red-600 text-white hover:bg-red-700">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
