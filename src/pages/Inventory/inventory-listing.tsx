import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MapPin,
  Grid2X2,
  List,
  Search,
  ChevronRight,
  Loader2,
  Package,
  CornerDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api, { type Project } from "@/lib/api";

export function InventoryListing() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const navigate = useNavigate();

  const organization = "SP_PROMOTERS";

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/projects?organization=${organization}`);
      setProjects(response.data.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Listing</h1>
          <p className="text-sm text-muted-foreground">Manage and view your plotted development projects.</p>
        </div>
        <Button onClick={() => navigate("/add_inventory")}>
          <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "table")}>
          <TabsList>
            <TabsTrigger value="grid"><Grid2X2 className="h-4 w-4" /></TabsTrigger>
            <TabsTrigger value="table"><List className="h-4 w-4" /></TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="flex h-64 flex-col items-center justify-center text-center border-dashed">
          <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold">No projects found</h3>
          <p className="text-muted-foreground max-w-xs mx-auto mb-6">
            {searchQuery ? "Try adjusting your search terms." : "Get started by creating your first project."}
          </p>
          <Button variant="outline" onClick={() => navigate("/add_inventory")}>
            Create Project
          </Button>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card
              key={project.product_id}
              className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => navigate(`/project_showcase/${project.product_id}`)}
            >
              {/* Banner */}
              <div className="h-40 bg-muted relative flex items-center justify-center overflow-hidden">
                {project.layoutImages?.[0] ? (
                  <img
                    src={project.layoutImages[0]}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <MapPin className="h-12 w-12 text-muted-foreground/30" />
                )}
                <Badge className="absolute top-3 right-3 capitalize">Plots</Badge>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="group-hover:text-primary transition-colors">{project.name}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" /> {project.location || "Location not set"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Phases</p>
                    <p className="text-lg font-bold">{project.phaseCount || 0}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Plots</p>
                    <p className="text-lg font-bold">{project.totalPlots || 0}</p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-primary/70 uppercase font-semibold">Booked</p>
                    <p className="text-lg font-bold text-primary">{project.bookedCount || 0}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>ID: {project.product_id}</span>
                    {(project.cornerPlots ?? 0) > 0 && (
                      <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200">
                        <CornerDownRight className="h-2.5 w-2.5 mr-0.5" /> {project.cornerPlots} corner
                      </Badge>
                    )}
                  </div>
                  <span className="flex items-center text-primary font-medium">
                    View <ChevronRight className="h-4 w-4 ml-0.5" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left font-medium">ID</th>
                <th className="h-12 px-4 text-left font-medium">Project Name</th>
                <th className="h-12 px-4 text-left font-medium">Location</th>
                <th className="h-12 px-4 text-center font-medium">Phases</th>
                <th className="h-12 px-4 text-center font-medium">Total Plots</th>
                <th className="h-12 px-4 text-center font-medium">Corner</th>
                <th className="h-12 px-4 text-center font-medium">Booked</th>
                <th className="h-12 px-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr
                  key={project.product_id}
                  className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/project_showcase/${project.product_id}`)}
                >
                  <td className="p-4 font-medium">{project.product_id}</td>
                  <td className="p-4 font-bold">{project.name}</td>
                  <td className="p-4">{project.location}</td>
                  <td className="p-4 text-center">{project.phaseCount}</td>
                  <td className="p-4 text-center">{project.totalPlots}</td>
                  <td className="p-4 text-center">
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                      {project.cornerPlots || 0}
                    </Badge>
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant={project.bookedCount ? "default" : "secondary"}>
                      {project.bookedCount}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/project_showcase/${project.product_id}`);
                      }}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}