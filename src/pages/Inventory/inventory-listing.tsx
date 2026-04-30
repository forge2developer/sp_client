import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MapPin,
  Grid2X2,
  List,
  ChevronRight,
  Loader2,
  Package,
  CornerDownRight,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  X,
} from "lucide-react";
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuLabel,
} from "@/components/ui/context-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api, { grpcApi, getImageUrl, type Project } from "@/lib/api";

// ─── Column Definitions ──────────────────────────────────
const getColumns = (
  navigate: ReturnType<typeof useNavigate>,
  handleDelete: (id: number) => void
): ColumnDef<Project>[] => [
  {
    accessorKey: "product_id",
    header: "ID",
    meta: { label: "ID" },
    cell: ({ row }) => (
      <div className="font-medium pl-2">{row.getValue("product_id")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "Project Name",
    meta: { label: "Project Name" },
    cell: ({ row }) => (
      <div className="font-bold group-hover:text-primary transition-colors">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
    meta: { label: "Location" },
    cell: ({ row }) => <div>{row.getValue("location") || "—"}</div>,
  },
  {
    accessorKey: "phaseCount",
    header: "Phases",
    meta: { label: "Phases" },
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("phaseCount") ?? 0}</div>
    ),
  },
  {
    accessorKey: "totalPlots",
    header: "Total Plots",
    meta: { label: "Total Plots" },
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("totalPlots") ?? 0}</div>
    ),
  },
  {
    accessorKey: "cornerPlots",
    header: "Corner",
    meta: { label: "Corner" },
    cell: ({ row }) => (
      <div className="text-center">
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-600 border-amber-200"
        >
          {(row.getValue("cornerPlots") as number) || 0}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "bookedCount",
    header: "Booked",
    meta: { label: "Booked" },
    cell: ({ row }) => {
      const count = (row.getValue("bookedCount") as number) || 0;
      return (
        <div className="text-center">
          <Badge variant={count ? "default" : "secondary"}>{count}</Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    meta: { label: "Actions" },
    cell: ({ row }) => {
      const project = row.original;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/project_showcase/${project.product_id}`);
                }}
              >
                <Eye className="mr-2 h-4 w-4" /> View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/add_inventory?edit=${project.product_id}`);
                }}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(project.product_id);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

// ─── Page Component ──────────────────────────────────────
export function InventoryListing() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const navigate = useNavigate();

  const organization = "SP_PROMOTERS";

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await grpcApi.get(`/projects?organization=${organization}`);
      setProjects(response.data.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: number) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await api.delete(`/projects/${productId}?organization=${organization}`);
        fetchProjects();
      } catch (error: any) {
        console.error("Error deleting project:", error);
        alert(error?.response?.data?.message || "Failed to delete project");
      }
    }
  };

  // ── TanStack Table setup ──
  const columns = useMemo(
    () => getColumns(navigate, handleDelete),
    [navigate]
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data: projects,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  // For grid view, use globalFilter for consistency
  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
      p.location?.toLowerCase().includes(globalFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Inventory Listing
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and view your plotted development projects.
          </p>
        </div>
        <Button onClick={() => navigate("/add_inventory")}>
          <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>

      {/* Toolbar Row 1: Search + Grid/Table toggle */}
      <div className="flex justify-between items-center gap-4 py-2 w-full flex-wrap">
        <div className="flex items-center gap-4 flex-1 pl-1">
          <div className="relative w-full max-w-sm">
            <Input
              placeholder="Search projects..."
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
        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as "grid" | "table")}
        >
          <TabsList className="bg-muted/20">
            <TabsTrigger value="grid">
              <Grid2X2 className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="table">
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Toolbar Row 2: Rows per page + Columns (table view only) */}
      {viewMode === "table" && (
        <div className="flex items-center justify-end gap-3">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="dark:bg-muted/50"
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
      )}

      {/* Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredProjects.length === 0 && viewMode === "grid" ? (
        <Card className="flex h-64 flex-col items-center justify-center text-center border-dashed">
          <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No projects found</h3>
          <p className="text-muted-foreground max-w-xs mx-auto mb-6">
            {globalFilter
              ? "Try adjusting your search terms."
              : "Get started by creating your first project."}
          </p>
          <Button
            variant="outline"
            onClick={() => navigate("/add_inventory")}
          >
            Create Project
          </Button>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ContextMenu key={project.product_id}>
              <ContextMenuTrigger asChild>
                <Card
                  className="overflow-hidden pt-0 transition-all cursor-pointer group relative border-none ring-1 ring-border"
                  onClick={() =>
                    navigate(`/project_showcase/${project.product_id}`)
                  }
                >
                  {/* Banner */}
                  <div className="h-40 bg-muted relative flex items-center justify-center overflow-hidden">
                    {project.layoutImages?.[0] ? (
                      <img
                        src={getImageUrl(project.layoutImages[0])}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <MapPin className="h-12 w-12 text-muted-foreground/30" />
                    )}
                    <Badge className="absolute top-3 right-3 capitalize">
                      Plots
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />{" "}
                      {project.location || "Location not set"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="bg-muted/50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                          Phases
                        </p>
                        <p className="text-lg font-bold">
                          {project.phaseCount || 0}
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                          Total Plots
                        </p>
                        <p className="text-lg font-bold">
                          {project.totalPlots || 0}
                        </p>
                      </div>
                      <div className="bg-primary/5 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-primary/70 uppercase font-semibold">
                          Booked
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {project.bookedCount || 0}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>ID: {project.product_id}</span>
                        {(project.cornerPlots ?? 0) > 0 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-amber-50 text-amber-600 border-amber-200"
                          >
                            <CornerDownRight className="h-2.5 w-2.5 mr-0.5" />{" "}
                            {project.cornerPlots} corner
                          </Badge>
                        )}
                      </div>
                      <span className="flex items-center text-primary font-medium">
                        View <ChevronRight className="h-4 w-4 ml-0.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-64">
                <ContextMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Project Actions
                </ContextMenuLabel>
                <ContextMenuSeparator />
                <ContextMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/project_showcase/${project.product_id}`);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" /> View Showcase
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      `/add_inventory?edit=${project.product_id}`
                    );
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit Project
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(project.product_id);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Project
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      ) : (
        /* ────────── Table View (TanStack) ────────── */
        <>
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
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer group hover:bg-muted/50"
                      onClick={() =>
                        navigate(
                          `/project_showcase/${row.original.product_id}`
                        )
                      }
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
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer - Pagination */}
          <div className="flex items-center justify-between space-x-2 py-2">
            <div className="text-sm text-muted-foreground pl-3">
              Showing {table.getRowModel().rows.length} of {projects.length}{" "}
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
        </>
      )}
    </div>
  );
}