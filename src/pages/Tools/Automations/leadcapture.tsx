import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Plus,
  MoreHorizontal,
  Trash2,
  FileEdit,
  Calendar,
  Target,
  RefreshCcw,
  Loader2,
  ClipboardIcon,
  X,
  Columns3,
  ChevronDown,
  Power,
} from "lucide-react"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import api, { grpcApi } from "@/lib/api"

// ─── Types ─────────────────────────────────────────────────────────────────────
interface LeadCaptureConfig {
  id: string
  name: string
  source: string
  project_ids: string[]
  assigned_people: { id: string; name: string; category: string }[]
  status: string
  selected_fields: string[]
  createdAt: string
}

// ─── Organization Constant ─────────────────────────────────────────────────────
const organization = "SP_PROMOTERS"

// ─── Column Definitions ────────────────────────────────────────────────────────
const getColumns = (
  onEdit: (config: LeadCaptureConfig) => void,
  onDelete: (config: LeadCaptureConfig) => void,
  onStatusToggle: (config: LeadCaptureConfig) => void,
  allProjects: any[]
): ColumnDef<LeadCaptureConfig>[] => [
  {
    accessorKey: "name",
    header: "Form Name & Source",
    meta: { label: "Form Name & Source" },
    cell: ({ row }) => (
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900/30 shadow-sm">
          <ClipboardIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-tight">
            {row.original.name || "Unnamed Form"}
          </div>
          <div className="text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-500 mt-1">
            {row.original.source || "MANUAL"}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "project_ids",
    header: "Target Project",
    meta: { label: "Target Project" },
    cell: ({ row }) => {
      const pIds = row.original.project_ids || []
      const projectNames = pIds
        .map(id => allProjects.find(p => (p.id || p._id) === id)?.name)
        .filter(Boolean)

      return (
        <div className="inline-flex items-center gap-2 bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800/50 px-3 py-1.5 rounded-xl">
          <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Target className="h-3 w-3 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="font-bold text-slate-700 dark:text-slate-200 text-xs">
            {projectNames.length > 0 ? projectNames.join(", ") : "All Projects"}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "assigned_people",
    header: "Assigned",
    meta: { label: "Assigned" },
    cell: ({ row }) => {
      const assigned = row.original.assigned_people || []
      return (
        <div className="flex -space-x-1.5 items-center">
          {assigned.slice(0, 3).map((p, i) => (
            <div
              key={i}
              className="h-7 w-7 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[9px] font-bold uppercase bg-primary/10 text-primary shadow-sm"
            >
              {p.name?.[0] || "?"}
            </div>
          ))}
          {assigned.length === 0 && (
            <span className="text-[11px] text-slate-300 dark:text-slate-600 font-bold tracking-tight uppercase">
              Unassigned
            </span>
          )}
          {assigned.length > 3 && (
            <div className="h-7 w-7 rounded-full border-2 border-white dark:border-zinc-900 bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-[9px] font-bold text-slate-400">
              +{assigned.length - 3}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { label: "Status" },
    cell: ({ row }) => (
      <Badge
        className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-none border-none ${
          row.original.status === "Active"
            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50"
            : "bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-600 hover:bg-slate-200 dark:hover:bg-zinc-800"
        }`}
      >
        {row.original.status || "Active"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    meta: { label: "Created" },
    cell: ({ row }) => (
      <div className="text-xs text-slate-500 flex items-center gap-1.5 font-bold">
        <Calendar className="h-3.5 w-3.5 text-slate-300" />
        {row.original.createdAt
          ? new Date(row.original.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })
          : "Recently"}
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    meta: { label: "Actions" },
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2 pr-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 rounded-lg hover:bg-muted"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              className="cursor-pointer font-bold text-xs"
              onClick={() => onEdit(row.original)}
            >
              <FileEdit className="h-4 w-4 mr-2 text-purple-500" />
              Configure Fields
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer font-bold text-xs"
              onClick={() => onStatusToggle(row.original)}
            >
              <Power className={cn("h-4 w-4 mr-2", row.original.status === "Active" ? "text-amber-500" : "text-emerald-500")} />
              {row.original.status === "Active" ? "Mark Inactive" : "Mark Active"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-500 focus:text-red-600 cursor-pointer font-bold text-xs"
              onClick={() => onDelete(row.original)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Config
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

// ─── Lead Capture Page Component ───────────────────────────────────────────────
export default function LeadCapture() {
  const navigate = useNavigate()
  const [forms, setForms] = useState<LeadCaptureConfig[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<LeadCaptureConfig | null>(
    null
  )
  const [isDeleting, setIsDeleting] = useState(false)

  // Table states
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // ── Fetch lead capture configs & projects ──
  const fetchData = async () => {
    setLoading(true)
    try {
      const [configsRes, projectsRes] = await Promise.all([
        grpcApi.get(`/lead-capture-configs?organization=${organization}`),
        grpcApi.get(`/projects?organization=${organization}`)
      ])
      setForms(configsRes.data.data || [])
      setProjects(projectsRes.data.data || [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
      setForms([])
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // ── Delete handler ──
  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await api.delete(`/lead-capture-configs/${deleteTarget.id}`)
      fetchData()
    } catch (error) {
      alert("Failed to delete configuration")
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  // ── Create handler ──
  const handleCreate = () => {
    navigate("/automation/leadcapture/form")
  }

  // ── Edit handler ──
  const handleEdit = (config: LeadCaptureConfig) => {
    navigate(`/automation/leadcapture/form?id=${config.id}`)
  }

  // ── Status toggle handler ──
  const handleStatusToggle = async (config: LeadCaptureConfig) => {
    const newStatus = config.status === "Active" ? "Inactive" : "Active"
    try {
      await api.put(`/lead-capture-configs/${config.id}`, { status: newStatus })
      fetchData()
    } catch (error) {
      alert("Failed to update status")
    }
  }

  // ── Table Columns ──
  const columns = useMemo(() => getColumns(handleEdit, setDeleteTarget, handleStatusToggle, projects), [handleEdit, handleStatusToggle, projects])

  function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ")
  }

  const table = useReactTable({
    data: forms,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
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
      pagination: { pageSize: 15 },
    },
  })

  return (
    <div className="flex flex-col gap-6">
      {/* ── Delete Dialog ── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Configuration?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the form
              configuration and disable all active entry points.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Header Section ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Capture Forms</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage reusable lead capture configurations.
          </p>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex justify-between items-center gap-4 py-2 w-full flex-wrap">
        <div className="flex items-center gap-4 flex-1 pl-1">
          <div className="relative w-full max-w-sm">
            <Input
              placeholder="Search configurations..."
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
          {/* Rows per page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px] dark:bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Column visibility toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 dark:bg-muted/50">
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
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {(column.columnDef.meta as any)?.label ?? column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Refresh Button */}
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={fetchData}>
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          {/* Create New Form */}
          <Button className="text-xs h-8" size="sm" onClick={handleCreate}>
            <Plus className="mr-1.5 h-4 w-4" /> New Form
          </Button>
        </div>
      </div>

      {/* ── Table ── */}
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
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                      <ClipboardIcon className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">No Forms Created</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        No lead capture forms have been configured for your
                        organization yet.
                      </p>
                    </div>
                    <Button onClick={handleCreate} className="mt-2">
                      <Plus className="h-4 w-4 mr-2" /> Setup First Form
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Footer - Pagination ── */}
      <div className="flex items-center justify-between space-x-2 py-2">
        <div className="text-sm text-muted-foreground pl-3 font-medium">
          Showing {table.getRowModel().rows.length} of {forms.length} entries
        </div>
        <div className="flex items-center gap-2 pr-2">
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
              className="h-8 w-8 p-0 font-bold"
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
