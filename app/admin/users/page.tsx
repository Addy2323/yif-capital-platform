"use client"

import { useState, useEffect } from "react"
import {
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    Shield,
    UserPlus,
    Download,
    Mail,
    CheckCircle2,
    XCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    getAllUsers,
    updateUser,
    deleteUser,
    exportUsersToCSV,
    createUser
} from "@/lib/admin-service"
import { type User } from "@/lib/auth-context"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
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

import { toast } from "sonner"

interface UserFormData {
    name: string
    email: string
    password: string
    role: "free" | "pro" | "institutional" | "admin"
}

const emptyFormData: UserFormData = {
    name: "",
    email: "",
    password: "",
    role: "free",
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState<string>("all")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [formData, setFormData] = useState<UserFormData>(emptyFormData)

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            toast.error("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesRole = roleFilter === "all" || user.role === roleFilter

        return matchesSearch && matchesRole
    })

    const handleAddUser = async () => {
        setIsLoading(true)
        const success = await createUser({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
        })
        if (success) {
            await fetchUsers()
            setFormData(emptyFormData)
            setIsAddDialogOpen(false)
            toast.success("User created successfully")
        } else {
            toast.error("Failed to create user")
        }
        setIsLoading(false)
    }

    const handleEditUser = async () => {
        if (!selectedUser) return
        setIsLoading(true)
        const success = await updateUser(selectedUser.id, {
            name: formData.name,
            role: formData.role as any
        })
        if (success) {
            await fetchUsers()
            setFormData(emptyFormData)
            setSelectedUser(null)
            setIsEditDialogOpen(false)
            toast.success("User updated successfully")
        } else {
            toast.error("Failed to update user")
        }
        setIsLoading(false)
    }

    const handleDeleteUser = async () => {
        if (!selectedUser) return
        setIsLoading(true)
        const success = await deleteUser(selectedUser.id)
        if (success) {
            await fetchUsers()
            setSelectedUser(null)
            setIsDeleteDialogOpen(false)
            toast.success("User deleted successfully")
        } else {
            toast.error("Failed to delete user")
        }
        setIsLoading(false)
    }

    const handleRoleChange = async (userId: string, newRole: any) => {
        setIsLoading(true)
        const success = await updateUser(userId, { role: newRole })
        if (success) {
            await fetchUsers()
            toast.success("Role updated successfully")
        } else {
            toast.error("Failed to update role")
        }
        setIsLoading(false)
    }

    const openEditDialog = (user: User) => {
        setSelectedUser(user)
        setFormData({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role as any,
        })
        setIsEditDialogOpen(true)
    }

    const openDeleteDialog = (user: User) => {
        setSelectedUser(user)
        setIsDeleteDialogOpen(true)
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">User Management</h1>
                    <p className="text-white/60">Manage your platform users and their permissions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="border-gold/50 bg-gold/10 text-gold hover:bg-gold/20"
                        onClick={exportUsersToCSV}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gold text-navy hover:bg-gold/90">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-white/10 text-white">
                            <DialogHeader>
                                <DialogTitle>Add New User</DialogTitle>
                                <DialogDescription className="text-white/60">
                                    Create a new user account.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right text-white/80">Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="col-span-3 bg-white/5 border-white/10 text-white"
                                        placeholder="Full name"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email" className="text-right text-white/80">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="col-span-3 bg-white/5 border-white/10 text-white"
                                        placeholder="user@example.com"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="password" className="text-right text-white/80">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="col-span-3 bg-white/5 border-white/10 text-white"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="role" className="text-right text-white/80">Role</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(value: "free" | "pro" | "institutional" | "admin") => setFormData({ ...formData, role: value })}
                                    >
                                        <SelectTrigger className="col-span-3 bg-white/5 border-white/10 text-white">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-white/10 text-white">
                                            <SelectItem value="free">Free</SelectItem>
                                            <SelectItem value="pro">Pro</SelectItem>
                                            <SelectItem value="institutional">Institutional</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">
                                    Cancel
                                </Button>
                                <Button onClick={handleAddUser} className="bg-gold text-navy hover:bg-gold/90">
                                    Add User
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <Input
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-white/40" />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold"
                    >
                        <option value="all">All Roles</option>
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="institutional">Institutional</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <Card className="bg-white/5 border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-4 text-sm font-medium text-white/60">User</th>
                                <th className="p-4 text-sm font-medium text-white/60">Role</th>
                                <th className="p-4 text-sm font-medium text-white/60">Subscription</th>
                                <th className="p-4 text-sm font-medium text-white/60">Joined</th>
                                <th className="p-4 text-sm font-medium text-white/60 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{user.name}</p>
                                                <p className="text-xs text-white/40">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "capitalize",
                                                user.role === "admin" ? "border-red-500/50 text-red-400" :
                                                    user.role === "institutional" ? "border-blue-500/50 text-blue-400" :
                                                        user.role === "pro" ? "border-gold/50 text-gold" :
                                                            "border-white/20 text-white/60"
                                            )}
                                        >
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {user.subscription?.status === "active" ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-white/20" />
                                            )}
                                            <span className="text-sm text-white/80 capitalize">
                                                {user.subscription?.plan || "Free"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-white/40">
                                        {new Date(user.createdAt).toLocaleDateString()}
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
                                                <DropdownMenuItem onClick={() => openEditDialog(user)} className="hover:bg-white/5 cursor-pointer">
                                                    <Edit2 className="mr-2 h-4 w-4" /> Edit Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="hover:bg-white/5 cursor-pointer">
                                                    <Mail className="mr-2 h-4 w-4" /> Send Email
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10" />
                                                <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, "free")} className="hover:bg-white/5 cursor-pointer">Free</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, "pro")} className="hover:bg-white/5 cursor-pointer text-gold">Pro</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, "institutional")} className="hover:bg-white/5 cursor-pointer text-blue-400">Institutional</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, "admin")} className="hover:bg-white/5 cursor-pointer text-red-400">Admin</DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10" />
                                                <DropdownMenuItem
                                                    onClick={() => openDeleteDialog(user)}
                                                    className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-8 text-center">
                        <p className="text-white/40">No users found matching your search.</p>
                    </div>
                )}
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription className="text-white/60">
                            Modify user details for {selectedUser?.email}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
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
                            <Label htmlFor="edit-email" className="text-right text-white/80">Email</Label>
                            <Input
                                id="edit-email"
                                value={formData.email}
                                className="col-span-3 bg-white/5 border-white/10 text-white"
                                disabled
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-role" className="text-right text-white/80">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value: "free" | "pro" | "institutional" | "admin") => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger className="col-span-3 bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-white/10 text-white">
                                    <SelectItem value="free">Free</SelectItem>
                                    <SelectItem value="pro">Pro</SelectItem>
                                    <SelectItem value="institutional">Institutional</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button onClick={handleEditUser} className="bg-gold text-navy hover:bg-gold/90">
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription className="text-white/60">
                            Are you sure you want to delete {selectedUser?.email}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-white/10 text-white hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteUser} className="bg-red-600 text-white hover:bg-red-700">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ")
}
