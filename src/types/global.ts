
// Global Application Types - Centralized Interface Definitions

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

// Event System Types
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

// Re-export existing types for convenience
export type { BlueprintLiveStatus, ToolUsageMetrics, PeriodMetrics, MaintenanceMetrics, Anomaly } from './sgf-blueprint';
