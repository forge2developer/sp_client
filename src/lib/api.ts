import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── REST API (for mutations: create, update, delete) ──────────────────────────
const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

export default api;

// ─── gRPC Gateway API (for fetching data) ──────────────────────────────────────
const grpcApi = axios.create({
  baseURL: `${API_BASE}/api/grpc`,
});

export { grpcApi, API_BASE };

/**
 * Prefixes a relative image path with the backend base URL if needed.
 */
export const getImageUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  // Ensure we don't have double slashes
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${API_BASE}/${cleanPath}`;
};

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface BookedBy {
  leadName: string;
  leadUuid?: string;
  profileId?: number;
  phone?: string;
  userId?: string;
  userName?: string;
  bookedAt?: string;
}

export interface Plot {
  plotId: string;
  plotNumber: string;
  size?: number;
  facing?: string;
  isCorner?: boolean;
  status: "available" | "booked" | "sold";
  price?: number;
  bookedBy?: BookedBy;
}

export interface Phase {
  phaseId: string;
  phaseName: string;
  plots: Plot[];
}

export interface Project {
  _id?: string;
  id?: string;
  product_id: number;
  organization: string;
  property: string;
  name: string;
  location?: string;
  layoutImages?: string[];
  phases?: Phase[];
  status: "active" | "inactive";
  createdAt?: string;
  // Aggregated fields from backend
  phaseCount?: number;
  totalPlots?: number;
  bookedCount?: number;
  cornerPlots?: number;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  organization?: string;
  profile_id?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
