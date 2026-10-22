export type AppMode = "citizen" | "field" | "municipal" | "showcase";

export type CitizenScreen = "home" | "report" | "confirm" | "track" | "feedback";
export type FieldScreen = "tasks" | "instructions" | "progress";
export type MunicipalTab = "Overview" | "Complaints" | "Map" | "Work Orders" | "Teams" | "Hotspots" | "Reports" | "Settings";

export type Priority = "Urgent" | "High" | "Medium" | "Low";
export type CaseStatus = "Submitted" | "Under Review" | "Assigned" | "In Progress" | "Awaiting Verification" | "Resolved" | "Rejected";

export interface CaseItem {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  ward: string;
  priority: Priority;
  status: CaseStatus;
  time: string;
  createdAt: string;
  photoUrl: string;
  afterPhotoUrl?: string;
  distance?: string;
  eta?: string;
  possibleCause?: string;
  recommendedDepartment?: string;
  suggestedAction?: string;
  steps?: string[];
  wasteCollectedKg?: number;
  notes?: string;
  coordinates?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  visualFingerprint?: string;
  reportedByCount?: number;
  duplicateCases?: {
    reportedAt: string;
    photoUrl?: string;
    notes?: string;
  }[];
  isDuplicateMerged?: boolean;
  feedback?: {
    resolved: boolean;
    comment?: string;
  };
  timeline: {
    status: string;
    timestamp: string;
    completed: boolean;
    active?: boolean;
    subtext?: string;
  }[];
}
