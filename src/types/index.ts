export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  ukm: string;
  isActive: boolean;
  createdAt: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: 'sosial' | 'seni' | 'olahraga' | 'akademik';
  ukm: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  documentation?: string;
  createdBy: string;
  attendees: string[];
  maxParticipants?: number;
}

export interface Attendance {
  id: string;
  activityId: string;
  userId: string;
  attendedAt: string;
  status: 'present' | 'absent' | 'late';
}

export interface UKM {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isActive: boolean;
}

export interface AlertType {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}