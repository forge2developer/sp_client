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
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  Layers,
  RefreshCcw,
  Loader2,
  X,
  Target,
  Megaphone,
  ChevronDown,
  Power,
} from "lucide-react"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import api, { grpcApi } from "@/lib/api"

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Campaign {
  id: string
  campaignName: string
  project?: { projectId: string }
  sourceCount: number
  endpointCount: number
  status: string
  createdAt: string
}

const organization = "SP_PROMOTERS"

// ─── Column Definitions ────────────────────────────────────────────────────────
const getColumns = (
  onEdit: (campaign: Campaign) => void,
  onDelete: (campaign: Campaign) => void,
  onStatusToggle: (campaign: Campaign) => void
): ColumnDef<Campaign>[] => [
  {
    accessorKey: "campaignName",
    header: "Campaign Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/30">
          <Megaphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <div className="font-bold text-sm leading-tight">{row.original.campaignName}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {row.original.sourceCount} Sources Active
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "project",
    header: "Inheritance",
    cell: ({ row }) => (
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-zinc-900/50 rounded-xl border border-slate-100 dark:border-zinc-800">
        <Target className="h-3.5 w-3.5 text-zinc-400" />
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
          {row.original.project?.projectId ? "Universal Project" : "Variable Routing"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "sources",
    header: "Sub-Sources",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-bold text-xs">{row.original.endpointCount} Endpoints</span>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className={cn(
        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border-none",
        row.original.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-400"
      )}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-bold">
        <Calendar className="h-3.5 w-3.5" />
        {new Date(row.original.createdAt).toLocaleDateString()}
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center justify-end pr-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit(row.original)} className="cursor-pointer font-bold text-xs">
              <FileEdit className="h-4 w-4 mr-2 text-blue-500" />
              Manage Hierarchy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusToggle(row.original)} className="cursor-pointer font-bold text-xs">
              <Power className={cn("h-4 w-4 mr-2", row.original.status === "Active" ? "text-amber-500" : "text-emerald-500")} />
              {row.original.status === "Active" ? "Mark Inactive" : "Mark Active"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(row.original)} className="text-red-500 cursor-pointer font-bold text-xs">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Campaign
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}

// ─── Campaign Page Component ───────────────────────────────────────────────────
export default function Campaigns() {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [globalFilter, setGlobalFilter] = useState("")

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const res = await grpcApi.get(`/campaigns?organization=${organization}`)
      setCampaigns(res.data.data || [])
    } catch (error) {
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCampaigns() }, [])

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await api.delete(`/campaigns/${deleteTarget.id}`)
      fetchCampaigns()
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const handleStatusToggle = async (campaign: Campaign) => {
    const newStatus = campaign.status === "Active" ? "Inactive" : "Active"
    try {
      await api.put(`/campaigns/${campaign.id}`, { status: newStatus })
      fetchCampaigns()
    } catch (error) {
      alert("Failed to update status")
    }
  }

  const columns = useMemo(() => getColumns(
    (c) => navigate(`/automation/campaigns/builder/${c.id}`),
    (c) => setDeleteTarget(c),
    handleStatusToggle
  ), [navigate, handleStatusToggle])

  const table = useReactTable({
    data: campaigns,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <div className="flex flex-col gap-6">
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign?</DialogTitle>
            <DialogDescription>This will permanently delete the campaign and all its source mappings.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between px-1">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Campaign Manager</h1>
          <p className="text-sm text-muted-foreground font-medium">Track lead sources and project routing hierarchy.</p>
        </div>
      </div>

      <div className="flex justify-between items-center gap-4 py-2 w-full flex-wrap">
        <div className="flex items-center gap-4 flex-1 pl-1">
          <div className="relative w-full max-w-sm">
            <Input
              placeholder="Search campaigns..."
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
            <span className="text-sm text-muted-foreground font-medium">Rows per page</span>
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

          <Button variant="outline" size="icon" onClick={fetchCampaigns} className="h-8 w-8">
            <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>

          <Button onClick={() => navigate("/automation/campaigns/builder")} className="text-xs h-8" size="sm">
            <Plus className="mr-1.5 h-4 w-4" /> New Campaign
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 dark:border-white/10 shadow-sm">
        <Table>
          <TableHeader className="bg-gray-900/10 dark:bg-muted/70">
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id}>
                {hg.headers.map(h => (
                  <TableHead key={h.id} className="text-[10px] font-black uppercase tracking-widest py-3">
                    {flexRender(h.column.columnDef.header, h.getContext())}
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
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="hover:bg-muted/50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center">
                      <Megaphone className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                    <p className="font-bold text-muted-foreground">No Active Campaigns Found</p>
                    <Button onClick={() => navigate("/automation/campaigns/builder")} variant="outline" className="rounded-xl">Create Your First Campaign</Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between space-x-2 py-2">
        <div className="text-sm text-muted-foreground pl-3 font-medium">
          Showing {table.getRowModel().rows.length} of {campaigns.length} entries
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
