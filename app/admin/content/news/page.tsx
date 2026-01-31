"use client"

import { useState } from "react"
import {
    Newspaper,
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
import { Textarea } from "@/components/ui/textarea"
import { MarketNews } from "@/lib/market-data"
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

interface NewsFormData {
    id: string
    title: string
    summary: string
    source: string
    date: string
    category: "market" | "company" | "economy" | "analysis"
}

const emptyFormData: NewsFormData = {
    id: "",
    title: "",
    summary: "",
    source: "",
    date: "",
    category: "market",
}

export default function AdminNewsPage() {
    const { newsList, addNews, updateNews, deleteNews } = useAdminData()
    const [searchQuery, setSearchQuery] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedNews, setSelectedNews] = useState<MarketNews | null>(null)
    const [formData, setFormData] = useState<NewsFormData>(emptyFormData)

    const filteredNews = newsList.filter(news =>
        news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.summary.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleAddNews = () => {
        const newArticle: MarketNews = {
            id: Date.now().toString(),
            title: formData.title,
            summary: formData.summary,
            source: formData.source,
            date: formData.date || new Date().toISOString().split("T")[0],
            category: formData.category,
        }
        addNews(newArticle)
        setFormData(emptyFormData)
        setIsAddDialogOpen(false)
    }

    const handleEditNews = () => {
        if (!selectedNews) return
        updateNews(selectedNews.id, formData)
        setFormData(emptyFormData)
        setSelectedNews(null)
        setIsEditDialogOpen(false)
    }

    const handleDeleteNews = () => {
        if (!selectedNews) return
        deleteNews(selectedNews.id)
        setSelectedNews(null)
        setIsDeleteDialogOpen(false)
    }

    const openEditDialog = (news: MarketNews) => {
        setSelectedNews(news)
        setFormData({
            id: news.id,
            title: news.title,
            summary: news.summary,
            source: news.source,
            date: news.date,
            category: news.category,
        })
        setIsEditDialogOpen(true)
    }

    const openDeleteDialog = (news: MarketNews) => {
        setSelectedNews(news)
        setIsDeleteDialogOpen(true)
    }

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "market": return "border-blue-500/50 text-blue-400"
            case "company": return "border-green-500/50 text-green-400"
            case "economy": return "border-purple-500/50 text-purple-400"
            case "analysis": return "border-gold/50 text-gold"
            default: return "border-white/20 text-white/60"
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">News Management</h1>
                    <p className="text-white/60">Manage market news and analysis articles.</p>
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
                                Add New Article
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add New Article</DialogTitle>
                                <DialogDescription className="text-white/60">
                                    Create a new news article.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-white/80">Title</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white"
                                        placeholder="Article title"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="summary" className="text-white/80">Summary</Label>
                                    <Textarea
                                        id="summary"
                                        value={formData.summary}
                                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                        className="bg-white/5 border-white/10 text-white min-h-[100px]"
                                        placeholder="Article summary..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="source" className="text-white/80">Source</Label>
                                        <Input
                                            id="source"
                                            value={formData.source}
                                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                            className="bg-white/5 border-white/10 text-white"
                                            placeholder="e.g., YIF Analytics"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="date" className="text-white/80">Date</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-white/80">Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value: "market" | "company" | "economy" | "analysis") => setFormData({ ...formData, category: value })}
                                    >
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-white/10 text-white">
                                            <SelectItem value="market">Market</SelectItem>
                                            <SelectItem value="company">Company</SelectItem>
                                            <SelectItem value="economy">Economy</SelectItem>
                                            <SelectItem value="analysis">Analysis</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">
                                    Cancel
                                </Button>
                                <Button onClick={handleAddNews} className="bg-gold text-navy hover:bg-gold/90">
                                    Publish Article
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                    placeholder="Search news articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
            </div>

            <div className="grid gap-4">
                {filteredNews.map((news) => (
                    <Card key={news.id} className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className={getCategoryColor(news.category)}>
                                            {news.category.toUpperCase()}
                                        </Badge>
                                        <span className="text-xs text-white/40 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {news.date}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">
                                        {news.title}
                                    </h3>
                                    <p className="text-xs text-white/60 line-clamp-2 mb-2">
                                        {news.summary}
                                    </p>
                                    <span className="text-xs text-white/40">Source: {news.source}</span>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-white/40 hover:text-white flex-shrink-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-slate-800 border-white/10 text-white">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => openEditDialog(news)} className="hover:bg-white/5 cursor-pointer">
                                            <Edit2 className="mr-2 h-4 w-4" /> Edit Article
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-white/10" />
                                        <DropdownMenuItem onClick={() => openDeleteDialog(news)} className="text-red-400 hover:bg-red-500/10 cursor-pointer">
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete Article
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Article</DialogTitle>
                        <DialogDescription className="text-white/60">
                            Modify the article details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title" className="text-white/80">Title</Label>
                            <Input
                                id="edit-title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-summary" className="text-white/80">Summary</Label>
                            <Textarea
                                id="edit-summary"
                                value={formData.summary}
                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                className="bg-white/5 border-white/10 text-white min-h-[100px]"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-source" className="text-white/80">Source</Label>
                                <Input
                                    id="edit-source"
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-date" className="text-white/80">Date</Label>
                                <Input
                                    id="edit-date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-category" className="text-white/80">Category</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value: "market" | "company" | "economy" | "analysis") => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-white/10 text-white">
                                    <SelectItem value="market">Market</SelectItem>
                                    <SelectItem value="company">Company</SelectItem>
                                    <SelectItem value="economy">Economy</SelectItem>
                                    <SelectItem value="analysis">Analysis</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button onClick={handleEditNews} className="bg-gold text-navy hover:bg-gold/90">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Delete Article</DialogTitle>
                        <DialogDescription className="text-white/60">
                            Are you sure you want to delete this article? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteNews} className="bg-red-600 text-white hover:bg-red-700">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
