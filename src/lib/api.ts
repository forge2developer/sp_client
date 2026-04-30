import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`,
});

export default api;

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
