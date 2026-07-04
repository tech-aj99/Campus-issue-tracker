import { IssueStatus, Priority } from '../types/issue';

export const STATUS_LABELS: Record<IssueStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
};

export const STATUS_COLORS: Record<IssueStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-orange-100 text-orange-700',
  HIGH: 'bg-red-100 text-red-700',
};

export const CATEGORIES = [
  'electrical', 'plumbing', 'hvac', 'cleaning',
  'structural', 'it', 'security', 'other',
];

export const DEPARTMENTS = ['maintenance', 'it', 'housekeeping', 'security'];
