import { User } from './user';

export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Room {
  id: string;
  number: string;
  floor: {
    id: string;
    number: number;
    building: {
      id: string;
      name: string;
    };
  };
}

export interface IssueAssignment {
  id: string;
  staffId: string;
  assignedAt: string;
  staff: { id: string; name: string; email: string };
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string | null;
  department: string | null;
  tags: string[];
  priority: Priority;
  status: IssueStatus;
  room: Room;
  raisedBy: User;
  assignment: IssueAssignment | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIssuePayload {
  title: string;
  description: string;
  roomId: string;
  category?: string;
  department?: string;
  tags?: string[];
  priority?: Priority;
  forceCreate?: boolean;
}

export interface AIAnalysisResult {
  category: string;
  building: string | null;
  floor: string | null;
  room: string | null;
  priority: Priority;
  department: string;
  tags: string[];
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchedIssueId: string | null;
  confidence: number;
  reason: string;
}

export interface IssueStats {
  statusData: { name: string; count: number }[];
  categoryData: { name: string; count: number }[];
  buildingData: { name: string; count: number }[];
  total: number;
}
