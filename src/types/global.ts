// Global Application Types - Centralized Interface Definitions

// Re-export existing types from sgf-blueprint
export type { BlueprintLiveStatus, ToolUsageMetrics, PeriodMetrics, MaintenanceMetrics, Anomaly } from './sgf-blueprint';

// Define missing types that are referenced but not defined
export interface ToolUsageMetrics {
  toolId: string;
  toolName: string;
  totalUsageHours: number;
  usageCount: number;
  averageUsageTime: number;
  lastUsed: string;
  mostFrequentUser: string;
  utilizationRate: number;
}

export interface PeriodMetrics {
  period: string;
  totalCheckouts: number;
  totalCheckins: number;
  activeTools: number;
  utilizationRate: number;
  topTools: Array<{
    name: string;
    usage: number;
  }>;
}

export interface MaintenanceMetrics {
  scheduled: number;
  overdue: number;
  completed: number;
  averageCost: number;
  nextDue: Array<{
    toolName: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

export interface Anomaly {
  type: 'unusual_usage' | 'extended_possession' | 'maintenance_overdue';
  severity: 'low' | 'medium' | 'high';
  description: string;
  toolId?: string;
  recommendation: string;
}

export interface UtilizationTrend {
  date: string;
  utilization: number;
  trend: 'up' | 'down' | 'stable';
}

export interface Reservation {
  id: string;
  toolId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  purpose: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'reservation' | 'maintenance' | 'other';
  resourceId?: string;
}

export interface MaintenanceTask {
  id: string;
  toolId: string;
  type: 'preventive' | 'corrective' | 'inspection';
  description: string;
  scheduledDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  estimatedDuration: number;
  priority: 'low' | 'medium' | 'high';
}

export interface MaintenanceSchedule {
  id: string;
  toolId: string;
  intervalDays: number;
  lastMaintenance: Date;
  nextMaintenance: Date;
  type: 'preventive' | 'inspection';
}

export interface MaintenanceHistory {
  id: string;
  toolId: string;
  date: Date;
  type: 'preventive' | 'corrective' | 'inspection';
  description: string;
  performedBy: string;
  cost: number;
  duration: number;
}

export interface MaintenanceCosts {
  total: number;
  preventive: number;
  corrective: number;
  averagePerTool: number;
  monthlyTrend: Array<{
    month: string;
    cost: number;
  }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  department: string;
  isActive: boolean;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export type ToolStatus = 'DISPONÍVEL' | 'EM USO' | 'EM MANUTENÇÃO';

export interface GlobalAppState {
  tools: ToolsState;
  analytics: AnalyticsState;
  reservations: ReservationsState;
  maintenance: MaintenanceState;
  notifications: NotificationState;
  user: UserState;
  system: SystemState;
}

export interface ToolsState {
  stats: {
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
  };
  liveStatus: BlueprintLiveStatus[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export interface AnalyticsState {
  usageMetrics: ToolUsageMetrics[];
  periodMetrics: PeriodMetrics[];
  maintenanceMetrics: MaintenanceMetrics | null;
  anomalies: Anomaly[];
  trends: UtilizationTrend[];
  isLoading: boolean;
  lastRefresh: Date | null;
}

export interface ReservationsState {
  reservations: Reservation[];
  calendar: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
}

export interface MaintenanceState {
  tasks: MaintenanceTask[];
  schedule: MaintenanceSchedule[];
  history: MaintenanceHistory[];
  costs: MaintenanceCosts | null;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  settings: NotificationSettings;
}

export interface UserState {
  currentUser: User | null;
  permissions: Permission[];
  preferences: UserPreferences;
}

export interface SystemState {
  isOnline: boolean;
  pendingSync: number;
  lastSync: Date | null;
  performance: PerformanceMetrics;
}

// Event System Types - Updated with missing events
export interface AppEvents {
  'tool:status:changed': { toolId: string; status: ToolStatus; user: string };
  'tool:checkout': { toolId: string; userId: string; timestamp: Date };
  'tool:checkin': { toolId: string; userId: string; timestamp: Date };
  'maintenance:scheduled': { toolId: string; date: Date; type: string };
  'maintenance:completed': { toolId: string; completedAt: Date; cost: number };
  'anomaly:detected': { type: string; severity: 'low' | 'medium' | 'high'; toolId?: string };
  'reservation:created': { reservationId: string; toolId: string; userId: string };
  'reservation:approved': { reservationId: string; approvedBy: string };
  'stock:low': { itemId: string; currentStock: number; minStock: number };
  'system:offline': { timestamp: Date };
  'system:online': { timestamp: Date };
  'system:report:generated': { type: string; format: string; timestamp: Date };
  'system:notification:created': { notificationId: string; type: string; timestamp: Date };
  'system:notification:read': { notificationId: string; timestamp: Date };
  'system:notifications:cleared': { count: number; timestamp: Date };
}

// Utility Types
export interface AppNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface PerformanceMetrics {
  loadTime: number;
  apiResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  categories: {
    maintenance: boolean;
    reservations: boolean;
    anomalies: boolean;
    system: boolean;
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'pt-BR' | 'en-US';
  dashboardLayout: string;
  autoRefresh: boolean;
  refreshInterval: number;
}
