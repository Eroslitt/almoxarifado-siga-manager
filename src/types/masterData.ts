
export interface SKU {
  id: string;
  sku_code: string;
  description: string;
  technical_specs: string | null;
  unit_of_measure: 'piece' | 'kg' | 'liter' | 'box' | 'meter' | 'pack';
  dimensions: {
    height: number;
    width: number;
    depth: number;
  } | null;
  weight: number | null;
  abc_classification: 'A' | 'B' | 'C';
  xyz_classification: 'X' | 'Y' | 'Z';
  min_stock: number;
  max_stock: number;
  reorder_point: number;
  default_supplier_id: string | null;
  alternative_suppliers: string[] | null;
  photo_url: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  status: 'active' | 'inactive' | 'discontinued';
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  company_name: string;
  trade_name: string | null;
  cnpj: string;
  ie: string | null;
  address: {
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    zip_code: string;
  };
  contact_info: {
    phone: string;
    email: string;
    contact_person?: string;
  };
  payment_terms: string | null;
  lead_time_days: number;
  rating: number; // 1-5 stars
  status: 'active' | 'inactive' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface StorageLocation {
  id: string;
  code: string; // A-01-03-C format
  description: string | null;
  street: string; // A
  shelf: string; // 01
  level: string; // 03
  position: string; // C
  capacity: number | null;
  restrictions: string[] | null; // Ex: ['flamable', 'heavy_items']
  zone_type: 'picking' | 'storage' | 'staging' | 'quarantine';
  status: 'available' | 'occupied' | 'blocked' | 'maintenance';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null; // For subcategories
  code: string; // Short code for category
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface SKUMovement {
  id: string;
  sku_id: string;
  location_id: string;
  movement_type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  unit_cost: number | null;
  reference_document: string | null; // Invoice, transfer order, etc.
  user_id: string;
  notes: string | null;
  timestamp: string;
  created_at: string;
}

export interface StockLevel {
  id: string;
  sku_id: string;
  location_id: string;
  current_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  last_movement_date: string;
  last_count_date: string | null;
  updated_at: string;
}
