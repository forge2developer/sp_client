"use client"

import * as React from "react"
import {
  MoreHorizontal,
  Plus,
  ChevronDown,
  X,
  Edit,
  Trash2,
} from "lucide-react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import api, { grpcApi, type User } from "@/lib/api"
import { Loader2 } from "lucide-react"

// ─── Column Definitions (outside component for stability) ──
const getColumns = (
  onEdit: (user: User) => void,
  onDelete: (user: User) => void
): ColumnDef<User>[] => [
  {
    accessorKey: "profile_id",
    header: "Profile ID",
    meta: { label: "Profile ID" },
    cell: ({ row }) => (
      <div className="font-bold text-primary pl-2">
        {row.getValue("profile_id") || "---"}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    meta: { label: "Name" },
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      return (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
            {name
              ? name
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : "?"}
          </div>
          <span className="font-semibold">{name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    meta: { label: "Email" },
    cell: ({ row }) => (
      <div className="lowercase">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    meta: { label: "Phone" },
    cell: ({ row }) => <div>{row.getValue("phone") || "—"}</div>,
  },
  {
    accessorKey: "role",
    header: "Role",
    meta: { label: "Role" },
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.getValue("role")}
      </Badge>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    meta: { label: "Actions" },
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>User Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(user)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

// ─── Page Component ──────────────────────────────────────
export default function ManageUsers() {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<User | null>(null)
  const [users, setUsers] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)

  const organization = "SP_PROMOTERS"

  // ── Fetch users via gRPC gateway ──
  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await grpcApi.get(`/users?organization=${organization}`)
      setUsers(response.data.data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // ── Form state ──
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    const key =
      id === "first-name"
        ? "firstName"
        : id === "last-name"
        ? "lastName"
        : id
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  // ── Create/Update user via REST ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const name = [formData.firstName, formData.lastName]
        .filter(Boolean)
        .join(" ")
      const payload = {
        name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role || "user",
        organization,
        ...(editingUser ? {} : { password: formData.password }),
      }

      if (editingUser) {
        await api.put(`/users/${editingUser.id || editingUser._id}`, payload)
      } else {
        await api.post("/users", payload)
      }

      setIsSheetOpen(false)
      setEditingUser(null)
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        role: "",
      })
      await fetchUsers() // Refresh list
    } catch (error: any) {
      console.error("Error saving user:", error)
      alert(error?.response?.data?.message || "Failed to save user")
    } finally {
      setSubmitting(false)
    }
  }

  // ── Delete user via REST ──
  const handleDelete = React.useCallback(async (user: User) => {
    if (!window.confirm(`Are you sure you want to delete "${user.name}"?`)) return
    try {
      await api.delete(`/users/${user.id || user._id}`)
      await fetchUsers()
    } catch (error: any) {
      console.error("Error deleting user:", error)
      alert(error?.response?.data?.message || "Failed to delete user")
    }
  }, [fetchUsers])

  // ── Edit handler ──
  const handleEdit = React.useCallback((user: User) => {
    setEditingUser(user)
    const nameParts = user.name.split(" ")
    setFormData({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      email: user.email,
      phone: user.phone || "",
      password: "", // Password not required on edit
      role: user.role.toLowerCase(),
    })
    setIsSheetOpen(true)
  }, [])

  // ── TanStack Table setup ──
  const columns = React.useMemo(
    () => getColumns(handleEdit, handleDelete),
    [handleEdit, handleDelete]
  )

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
          <p className="text-sm text-muted-foreground">
            Invite and manage roles for your team members.
          </p>
        </div>
      </div>

      {/* Toolbar - matches desk_frontend DataTable layout */}
      <div className="flex justify-between items-center gap-4 py-2 w-full flex-wrap">
        <div className="flex items-center gap-4 flex-1 pl-1">
          <div className="relative w-full max-w-sm">
            <Input
              placeholder="Search users..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pr-8 bg-input/30 dark:bg-input/50 border-slate-200 dark:border-white/10"
            />
            {globalFilter && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setGlobalFilter("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          {/* Add User Button - placed in toolbar like desk_frontend's topRightContent */}
          <Sheet
            open={isSheetOpen}
            onOpenChange={(isOpen) => {
              setIsSheetOpen(isOpen)
              if (!isOpen) {
                setEditingUser(null)
                setFormData({
                  firstName: "",
                  lastName: "",
                  email: "",
                  phone: "",
                  password: "",
                  role: "",
                })
              }
            }}
          >
            <Button
              className="text-xs"
              size="sm"
              onClick={() => {
                setEditingUser(null)
                setIsSheetOpen(true)
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" /> Add User
            </Button>

            {/* ────────── Add User Sheet (desk_frontend style) ────────── */}
            <SheetContent className="w-xl px-5 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>
                  {editingUser ? "Edit User" : "Add New User"}
                </SheetTitle>
                <SheetDescription>
                  {editingUser
                    ? "Update the user's details below."
                    : "Enter the details below to create a new user account."}
                </SheetDescription>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">
                      Last Name{" "}
                      <span className="text-muted-foreground">(Optional)</span>
                    </Label>
                    <Input
                      id="last-name"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    autoComplete="off"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    autoComplete="off"
                  />
                </div>
                {!editingUser && (
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, role: value }))
                    }
                    value={formData.role}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="mt-4" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submitting
                    ? "Saving..."
                    : editingUser
                    ? "Update User"
                    : "Create User"}
                </Button>
              </form>
            </SheetContent>
          </Sheet>

          {/* Rows per page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Rows per page
            </span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-9 w-[70px] dark:bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Column visibility toggle - dynamic from TanStack table */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto dark:bg-muted/50"
              >
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {(column.columnDef.meta as any)?.label ?? column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* User Table - dynamic via TanStack flexRender */}
      <div className="overflow-hidden rounded-md border border-slate-200 dark:border-white/10">
        <Table>
          <TableHeader className="bg-gray-900/10 dark:bg-muted/70">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j} className="h-12 py-3 px-4">
                      <div className="h-4 bg-muted animate-pulse rounded w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer - Pagination */}
      <div className="flex items-center justify-between space-x-2 py-2">
        <div className="text-sm text-muted-foreground pl-3">
          Showing {table.getRowModel().rows.length} of {users.length}{" "}
          entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          {Array.from({ length: table.getPageCount() }, (_, i) => (
            <Button
              key={i}
              variant={
                table.getState().pagination.pageIndex === i
                  ? "default"
                  : "outline"
              }
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(i)}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}