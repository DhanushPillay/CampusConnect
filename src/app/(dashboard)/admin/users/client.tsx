"use client"

import { useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { createUser, updateUser, deleteUser } from "@/lib/actions/users"

export function UsersTable({ users, campuses = [] }: { users: any[], campuses?: any[] }) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingUser, setEditingUser] = useState<any | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
    campusId: "",
  })

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", role: "STUDENT", campusId: "" })
    setEditingUser(null)
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await createUser(formData)
      setIsAddOpen(false)
      resetForm()
    } catch (error) {
      console.error(error)
      alert("Failed to create user")
    }
    setIsLoading(false)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await updateUser(editingUser.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        campusId: formData.campusId || undefined,
      })
      setEditingUser(null)
      resetForm()
    } catch (error) {
      console.error(error)
      alert("Failed to update user")
    }
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await deleteUser(id)
    }
  }

  const openEditModal = (user: any) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      campusId: user.campusId || "",
    })
    setEditingUser(user)
  }

  const columns = [
    { key: "name", header: "Name", render: (u: any) => <span className="font-semibold">{u.name}</span> },
    { key: "email", header: "Email" },
    {
      key: "role",
      header: "Role",
      render: (u: any) => (
        <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-md uppercase tracking-wider">
          {u.role}
        </span>
      ),
    },
    { key: "campus", header: "Campus", render: (u: any) => u.campus?.name || "—" },
    {
      key: "isActive",
      header: "Status",
      render: (u: any) => (
        <span className={u.isActive ? "text-emerald-600 font-medium" : "text-destructive font-medium"}>
          {u.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (u: any) => new Date(u.createdAt).toLocaleDateString("en-IN"),
    },
    {
      key: "actions",
      header: "Actions",
      render: (u: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => openEditModal(u)} className="h-8 w-8 text-muted-foreground hover:text-primary">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="shadow-soft hover:shadow-soft-lg transition-all">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="campus">Campus</Label>
                <Select value={formData.campusId} onValueChange={(val) => setFormData({...formData, campusId: val})}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Campus..." />
                  </SelectTrigger>
                  <SelectContent>
                    {campuses.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Create User"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={!!editingUser} onOpenChange={(open) => {
          if (!open) resetForm()
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input id="edit-name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-campus">Campus</Label>
                <Select value={formData.campusId} onValueChange={(val) => setFormData({...formData, campusId: val})}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Campus..." />
                  </SelectTrigger>
                  <SelectContent>
                    {campuses.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Update User"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        data={users}
        columns={columns}
        emptyTitle="No users yet"
        emptyDescription="Add your first user to get started."
      />
    </div>
  )
}

