"use client"

import { useState } from "react"
import {
    Target,
    Search,
    Plus,
    MoreVertical,
    Edit2,
    Trash2,
    Calendar,
    Download
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { IPO } from "@/lib/market-data"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useAdminData } from "@/lib/admin-data-context"

interface IPOFormData {
    symbol: string
    name: string
    price: number
    status: "upcoming" | "recent"
    date: string
    exchange: string
    shares: number
    marketCap: number
}

const emptyFormData: IPOFormData = {
    symbol: "",
    name: "",
    price: 0,
    status: "upcoming",
    date: "",
    exchange: "DSE",
    shares: 0,
    marketCap: 0,
}

export default function AdminIposPage() {
    const { ipoList, addIpo, updateIpo, deleteIpo } = useAdminData()
    const [searchQuery, setSearchQuery] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedIpo, setSelectedIpo] = useState<IPO | null>(null)
    const [formData, setFormData] = useState<IPOFormData>(emptyFormData)

    const filteredIpos = ipoList.filter(ipo =>
        ipo.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ipo.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleAddIpo = () => {
        const newIpo: IPO = {
            symbol: formData.symbol,
            name: formData.name,
            price: formData.price,
            status: formData.status,
            date: formData.date,
            exchange: formData.exchange,
            shares: formData.shares,
            marketCap: formData.marketCap,
        }
        addIpo(newIpo)
        setFormData(emptyFormData)
        setIsAddDialogOpen(false)
    }

    const handleEditIpo = () => {
        if (!selectedIpo) return
        updateIpo(selectedIpo.symbol, formData)
        setFormData(emptyFormData)
        setSelectedIpo(null)
        setIsEditDialogOpen(false)
    }

    const handleDeleteIpo = () => {
        if (!selectedIpo) return
        deleteIpo(selectedIpo.symbol)
        setSelectedIpo(null)
        setIsDeleteDialogOpen(false)
    }

    const openEditDialog = (ipo: IPO) => {
        setSelectedIpo(ipo)
        setFormData({
            symbol: ipo.symbol,
            name: ipo.name,
            price: ipo.price,
            status: ipo.status,
            date: ipo.date,
            exchange: ipo.exchange,
            shares: ipo.shares,
            marketCap: ipo.marketCap,
        })
        setIsEditDialogOpen(true)
    }

    const openDeleteDialog = (ipo: IPO) => {
        setSelectedIpo(ipo)
        setIsDeleteDialogOpen(true)
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">IPO Management</h1>
                    <p className="text-white/60">Manage upcoming and recent Initial Public Offerings.</p>
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
                                Add New IPO
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add New IPO</DialogTitle>
                                <DialogDescription className="text-white/60">
                                    Enter the details for the new IPO.
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
                                        placeholder="e.g., TICL"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right text-white/80">Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="col-span-3 bg-white/5 border-white/10 text-white"
                                        placeholder="e.g., TICL Investment Co"
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
                                    <Label htmlFor="status" className="text-right text-white/80">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value: "upcoming" | "recent") => setFormData({ ...formData, status: value })}
                                    >
                                        <SelectTrigger className="col-span-3 bg-white/5 border-white/10 text-white">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-white/10 text-white">
                                            <SelectItem value="upcoming">Upcoming</SelectItem>
                                            <SelectItem value="recent">Recent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="date" className="text-right text-white/80">Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="col-span-3 bg-white/5 border-white/10 text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="exchange" className="text-right text-white/80">Exchange</Label>
                                    <Input
                                        id="exchange"
                                        value={formData.exchange}
                                        onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                                        className="col-span-3 bg-white/5 border-white/10 text-white"
                                        placeholder="e.g., DSE"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="shares" className="text-right text-white/80">Shares</Label>
                                    <Input
                                        id="shares"
                                        type="number"
                                        value={formData.shares}
                                        onChange={(e) => setFormData({ ...formData, shares: Number(e.target.value) })}
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
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">
                                    Cancel
                                </Button>
                                <Button onClick={handleAddIpo} className="bg-gold text-navy hover:bg-gold/90">
                                    Add IPO
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                    placeholder="Search by symbol or company name..."
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
                                <th className="p-4 text-sm font-medium text-white/60">Company</th>
                                <th className="p-4 text-sm font-medium text-white/60">Price</th>
                                <th className="p-4 text-sm font-medium text-white/60">Status</th>
                                <th className="p-4 text-sm font-medium text-white/60">Date</th>
                                <th className="p-4 text-sm font-medium text-white/60">Exchange</th>
                                <th className="p-4 text-sm font-medium text-white/60 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {filteredIpos.map((ipo) => (
                                <tr key={ipo.symbol} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div>
                                            <p className="text-sm font-bold text-white">{ipo.symbol}</p>
                                            <p className="text-xs text-white/40">{ipo.name}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-white">
                                        TZS {ipo.price.toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <Badge
                                            variant="outline"
                                            className={ipo.status === "recent" ? "border-green-500/50 text-green-400" : "border-blue-500/50 text-blue-400"}
                                        >
                                            {ipo.status.toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-sm text-white/60">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {ipo.date}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-white/60">
                                        {ipo.exchange}
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
                                                <DropdownMenuItem onClick={() => openEditDialog(ipo)} className="hover:bg-white/5 cursor-pointer">
                                                    <Edit2 className="mr-2 h-4 w-4" /> Edit IPO
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10" />
                                                <DropdownMenuItem onClick={() => openDeleteDialog(ipo)} className="text-red-400 hover:bg-red-500/10 cursor-pointer">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete IPO
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
                        <DialogTitle>Edit IPO</DialogTitle>
                        <DialogDescription className="text-white/60">
                            Modify the details for {selectedIpo?.symbol}.
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
                            <Label htmlFor="edit-status" className="text-right text-white/80">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: "upcoming" | "recent") => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger className="col-span-3 bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-white/10 text-white">
                                    <SelectItem value="upcoming">Upcoming</SelectItem>
                                    <SelectItem value="recent">Recent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-date" className="text-right text-white/80">Date</Label>
                            <Input
                                id="edit-date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="col-span-3 bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-exchange" className="text-right text-white/80">Exchange</Label>
                            <Input
                                id="edit-exchange"
                                value={formData.exchange}
                                onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                                className="col-span-3 bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button onClick={handleEditIpo} className="bg-gold text-navy hover:bg-gold/90">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Delete IPO</DialogTitle>
                        <DialogDescription className="text-white/60">
                            Are you sure you want to delete {selectedIpo?.symbol}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteIpo} className="bg-red-600 text-white hover:bg-red-700">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
