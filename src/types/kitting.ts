
import { Tool, User } from './database';

export interface WorkTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  department: string;
  estimated_duration_minutes: number;
  priority: number;
  active: boolean;
  usage_count: number;
  success_rate: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkTemplateItem {
  id: string;
  template_id: string;
  tool_id: string;
  quantity: number;
  priority: 'essential' | 'recommended' | 'optional';
  alternative_tool_ids: string[];
  notes: string | null;
  usage_frequency: number;
  created_at: string;
}

export interface BatchCheckout {
  id: string;
  template_id: string | null;
  user_id: string;
  work_type: string;
  status: 'in-progress' | 'completed' | 'cancelled';
  total_items: number;
  completed_items: number;
  started_at: string;
  completed_at: string | null;
  estimated_return: string | null;
  notes: string | null;
}

export interface BatchCheckoutItem {
  id: string;
  batch_id: string;
  tool_id: string;
  status: 'pending' | 'scanned' | 'checked-out' | 'skipped';
  priority: 'essential' | 'recommended' | 'optional';
  scanned_at: string | null;
  checkout_at: string | null;
}

export interface KittingSuggestion {
  toolId: string;
  toolName: string;
  priority: 'essential' | 'recommended' | 'optional';
  confidence: number;
  reason: string;
  available: boolean;
  location: string;
  alternatives?: KittingSuggestion[];
}

export interface WorkTemplateWithItems extends WorkTemplate {
  items: (WorkTemplateItem & { tool: Tool })[];
}

export interface BatchCheckoutWithDetails extends BatchCheckout {
  items: (BatchCheckoutItem & { tool: Tool })[];
  template?: WorkTemplate;
  user: User;
}
