
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GlobalAppState, AppEvents } from '@/types/global';
import { eventBus } from '@/services/eventBus';
import { advancedCacheService } from '@/services/advancedCacheService';

// Initial state
const initialState: GlobalAppState = {
  tools: {
    stats: { total: 0, available: 0, inUse: 0, maintenance: 0 },
    liveStatus: [],
    isLoading: false,
    error: null,
    lastUpdate: null
  },
  analytics: {
    usageMetrics: [],
    periodMetrics: [],
    maintenanceMetrics: null,
    anomalies: [],
    trends: [],
    isLoading: false,
    lastRefresh: null
  },
  reservations: {
    reservations: [],
    calendar: [],
    isLoading: false,
    error: null
  },
  maintenance: {
    tasks: [],
    schedule: [],
    history: [],
    costs: null,
    isLoading: false,
    error: null
  },
  notifications: {
    notifications: [],
    unreadCount: 0,
    settings: {
      emailEnabled: true,
      pushEnabled: true,
      categories: {
        maintenance: true,
        reservations: true,
        anomalies: true,
        system: true
      }
    }
  },
  user: {
    currentUser: null,
    permissions: [],
    preferences: {
      theme: 'auto',
      language: 'pt-BR',
      dashboardLayout: 'default',
      autoRefresh: true,
      refreshInterval: 30000
    }
  },
  system: {
    isOnline: navigator.onLine,
    pendingSync: 0,
    lastSync: null,
    performance: {
      loadTime: 0,
      apiResponseTime: 0,
      cacheHitRate: 0,
      errorRate: 0
    }
  }
};

// Actions
type GlobalAction = 
  | { type: 'UPDATE_TOOLS'; payload: Partial<GlobalAppState['tools']> }
  | { type: 'UPDATE_ANALYTICS'; payload: Partial<GlobalAppState['analytics']> }
  | { type: 'UPDATE_RESERVATIONS'; payload: Partial<GlobalAppState['reservations']> }
  | { type: 'UPDATE_MAINTENANCE'; payload: Partial<GlobalAppState['maintenance']> }
  | { type: 'ADD_NOTIFICATION'; payload: GlobalAppState['notifications']['notifications'][0] }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'UPDATE_USER'; payload: Partial<GlobalAppState['user']> }
  | { type: 'UPDATE_SYSTEM'; payload: Partial<GlobalAppState['system']> }
  | { type: 'RESET_STATE' };

// Reducer
const globalReducer = (state: GlobalAppState, action: GlobalAction): GlobalAppState => {
  switch (action.type) {
    case 'UPDATE_TOOLS':
      return { ...state, tools: { ...state.tools, ...action.payload } };
    case 'UPDATE_ANALYTICS':
      return { ...state, analytics: { ...state.analytics, ...action.payload } };
    case 'UPDATE_RESERVATIONS':
      return { ...state, reservations: { ...state.reservations, ...action.payload } };
    case 'UPDATE_MAINTENANCE':
      return { ...state, maintenance: { ...state.maintenance, ...action.payload } };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          notifications: [action.payload, ...state.notifications.notifications],
          unreadCount: state.notifications.unreadCount + 1
        }
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          notifications: state.notifications.notifications.map(n =>
            n.id === action.payload ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.notifications.unreadCount - 1)
        }
      };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'UPDATE_SYSTEM':
      return { ...state, system: { ...state.system, ...action.payload } };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
};

// Context
interface GlobalContextType {
  state: GlobalAppState;
  actions: {
    updateTools: (payload: Partial<GlobalAppState['tools']>) => void;
    updateAnalytics: (payload: Partial<GlobalAppState['analytics']>) => void;
    updateReservations: (payload: Partial<GlobalAppState['reservations']>) => void;
    updateMaintenance: (payload: Partial<GlobalAppState['maintenance']>) => void;
    addNotification: (notification: GlobalAppState['notifications']['notifications'][0]) => void;
    markNotificationRead: (id: string) => void;
    updateUser: (payload: Partial<GlobalAppState['user']>) => void;
    updateSystem: (payload: Partial<GlobalAppState['system']>) => void;
    resetState: () => void;
  };
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  const actions = {
    updateTools: (payload: Partial<GlobalAppState['tools']>) =>
      dispatch({ type: 'UPDATE_TOOLS', payload }),
    updateAnalytics: (payload: Partial<GlobalAppState['analytics']>) =>
      dispatch({ type: 'UPDATE_ANALYTICS', payload }),
    updateReservations: (payload: Partial<GlobalAppState['reservations']>) =>
      dispatch({ type: 'UPDATE_RESERVATIONS', payload }),
    updateMaintenance: (payload: Partial<GlobalAppState['maintenance']>) =>
      dispatch({ type: 'UPDATE_MAINTENANCE', payload }),
    addNotification: (notification: GlobalAppState['notifications']['notifications'][0]) =>
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification }),
    markNotificationRead: (id: string) =>
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id }),
    updateUser: (payload: Partial<GlobalAppState['user']>) =>
      dispatch({ type: 'UPDATE_USER', payload }),
    updateSystem: (payload: Partial<GlobalAppState['system']>) =>
      dispatch({ type: 'UPDATE_SYSTEM', payload }),
    resetState: () =>
      dispatch({ type: 'RESET_STATE' })
  };

  // Event bus integration
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Listen to tool events
    unsubscribers.push(
      eventBus.on('tool:status:changed', (data) => {
        console.log('🔧 Tool status changed:', data);
        // Refresh tools data when status changes
      }),

      eventBus.on('tool:checkout', (data) => {
        actions.addNotification({
          id: `checkout-${Date.now()}`,
          type: 'info',
          title: 'Ferramenta Retirada',
          message: `Ferramenta ${data.toolId} retirada por ${data.user}`,
          timestamp: data.timestamp,
          read: false,
          priority: 'medium'
        });
      }),

      eventBus.on('anomaly:detected', (data) => {
        actions.addNotification({
          id: `anomaly-${Date.now()}`,
          type: data.severity === 'high' ? 'error' : 'warning',
          title: 'Anomalia Detectada',
          message: `${data.type} - Severidade: ${data.severity}`,
          timestamp: new Date(),
          read: false,
          priority: data.severity
        });
      }),

      eventBus.on('system:offline', () => {
        actions.updateSystem({ isOnline: false });
      }),

      eventBus.on('system:online', () => {
        actions.updateSystem({ isOnline: true });
      })
    );

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  // Load cached state on startup
  useEffect(() => {
    const loadCachedState = async () => {
      try {
        const cachedState = await advancedCacheService.get<Partial<GlobalAppState>>('global-state');
        if (cachedState) {
          console.log('🗄️ Loading cached global state');
          // Selectively restore cached data (don't override system state)
          if (cachedState.tools) actions.updateTools(cachedState.tools);
          if (cachedState.user) actions.updateUser(cachedState.user);
        }
      } catch (error) {
        console.error('Error loading cached state:', error);
      }
    };

    loadCachedState();
  }, []);

  // Save state to cache periodically
  useEffect(() => {
    const saveInterval = setInterval(async () => {
      try {
        // Only cache specific parts of state (not temporary data)
        const stateToCache = {
          user: state.user,
          notifications: {
            ...state.notifications,
            notifications: state.notifications.notifications.slice(0, 50) // Limit cached notifications
          }
        };
        
        await advancedCacheService.set('global-state', stateToCache, 3600); // 1 hour cache
      } catch (error) {
        console.error('Error saving state to cache:', error);
      }
    }, 60000); // Save every minute

    return () => clearInterval(saveInterval);
  }, [state]);

  return (
    <GlobalContext.Provider value={{ state, actions }}>
      {children}
    </GlobalContext.Provider>
  );
};
