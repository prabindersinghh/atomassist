export type UserRole = 'agent' | 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  agent_id: string;
  start_time: string;
  end_time?: string;
  status: 'pending' | 'active' | 'ended';
  recording_id?: string;
  summary?: string;
  ai_summary?: {
    issue_summary: string;
    root_cause: string;
    actions_taken: string;
    resolution: string;
    next_steps: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  session_id: string;
  user_id: string;
  role: 'agent' | 'customer';
  joined_at: string;
  left_at?: string;
  connection_quality: 'good' | 'fair' | 'poor';
  device_info?: {
    browser: string;
    os: string;
    camera: string;
    microphone: string;
  };
}

export interface Message {
  id: string;
  session_id: string;
  user_id: string;
  content: string;
  type: 'text' | 'file';
  metadata?: Record<string, any>;
  read_by: string[];
  created_at: string;
}

export interface Recording {
  id: string;
  session_id: string;
  status: 'recording' | 'processing' | 'ready' | 'error';
  duration?: number;
  size?: number;
  url?: string;
  started_at: string;
  completed_at?: string;
  error?: string;
}

export interface FileUpload {
  id: string;
  session_id: string;
  user_id: string;
  filename: string;
  size: number;
  type: string;
  url: string;
  preview_url?: string;
  created_at: string;
}

export interface SessionNote {
  id: string;
  session_id: string;
  created_by: string;
  content: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionTag {
  id: string;
  session_id: string;
  tag: 'installation' | 'warranty' | 'repair' | 'troubleshooting' | 'complaint' | 'other';
  created_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor_id: string;
  resource_type: string;
  resource_id: string;
  changes?: Record<string, any>;
  created_at: string;
}

export interface SystemMetric {
  id: string;
  metric_name: string;
  value: number;
  timestamp: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface InviteToken {
  token: string;
  session_id: string;
  expires_at: string;
  created_at: string;
}
