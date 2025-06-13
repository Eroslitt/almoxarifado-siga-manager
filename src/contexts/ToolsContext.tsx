
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { BlueprintLiveStatus } from '@/types/sgf-blueprint';

interface ToolsState {
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

type ToolsAction = 
  | { type: 'SET_STATS'; payload: ToolsState['stats'] }
  | { type: 'SET_LIVE_STATUS'; payload: BlueprintLiveStatus[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_TOOL_STATUS'; payload: { toolId: string; status: BlueprintLiveStatus } }
  | { type: 'RESET_STATE' };

const initialState: ToolsState = {
  stats: {
    total: 0,
    available: 0,
    inUse: 0,
    maintenance: 0
  },
  liveStatus: [],
  isLoading: false,
  error: null,
  lastUpdate: null
};

const toolsReducer = (state: ToolsState, action: ToolsAction): ToolsState => {
  switch (action.type) {
    case 'SET_STATS':
      return {
        ...state,
        stats: action.payload,
        lastUpdate: new Date()
      };
    case 'SET_LIVE_STATUS':
      return {
        ...state,
        liveStatus: action.payload,
        lastUpdate: new Date()
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    case 'UPDATE_TOOL_STATUS':
      return {
        ...state,
        liveStatus: state.liveStatus.map(tool =>
          tool.ferramenta === action.payload.toolId
            ? { ...tool, ...action.payload.status }
            : tool
        ),
        lastUpdate: new Date()
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
};

interface ToolsContextType {
  state: ToolsState;
  actions: {
    setStats: (stats: ToolsState['stats']) => void;
    setLiveStatus: (status: BlueprintLiveStatus[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateToolStatus: (toolId: string, status: BlueprintLiveStatus) => void;
    resetState: () => void;
  };
}

const ToolsContext = createContext<ToolsContextType | undefined>(undefined);

export const useToolsContext = () => {
  const context = useContext(ToolsContext);
  if (!context) {
    throw new Error('useToolsContext must be used within a ToolsProvider');
  }
  return context;
};

interface ToolsProviderProps {
  children: ReactNode;
}

export const ToolsProvider: React.FC<ToolsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(toolsReducer, initialState);

  const actions = {
    setStats: (stats: ToolsState['stats']) => 
      dispatch({ type: 'SET_STATS', payload: stats }),
    setLiveStatus: (status: BlueprintLiveStatus[]) => 
      dispatch({ type: 'SET_LIVE_STATUS', payload: status }),
    setLoading: (loading: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | null) => 
      dispatch({ type: 'SET_ERROR', payload: error }),
    updateToolStatus: (toolId: string, status: BlueprintLiveStatus) => 
      dispatch({ type: 'UPDATE_TOOL_STATUS', payload: { toolId, status } }),
    resetState: () => 
      dispatch({ type: 'RESET_STATE' })
  };

  return (
    <ToolsContext.Provider value={{ state, actions }}>
      {children}
    </ToolsContext.Provider>
  );
};
