import { Priority, IssueStatus, Role } from '@prisma/client';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateIssueDto {
  title: string;
  description: string;
  roomId: string;
  category?: string;
  department?: string;
  tags?: string[];
  priority?: Priority;
  forceCreate?: boolean;
  imageUrl?: string;
}

export interface UpdateStatusDto {
  status: IssueStatus;
}

export interface AssignStaffDto {
  staffId: string;
}

export interface AnalyzeIssueDto {
  description: string;
}

export interface CheckDuplicateDto {
  description: string;
  roomId: string;
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
  duplicate: boolean;
  matchedIssueId: string | null;
  confidence: number;
  reason: string;
}
