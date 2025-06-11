
import { masterDataApi } from './masterDataApi';
import { validationService } from './validationService';

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{ row: number; errors: string[] }>;
  warnings: Array<{ row: number; warnings: string[] }>;
}

interface ExportOptions {
  format: 'csv' | 'json';
  includeInactive?: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}

class DataImportService {
  async importSKUs(data: any[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: 0,
      failed: 0,
      errors: [],
      warnings: []
    };

    // Validate all records first
    const { valid, invalid } = validationService.validateBatch(data, 'sku');
    
    // Process invalid records
    invalid.forEach((item, index) => {
      result.errors.push({
        row: index + 1,
        errors: item.errors || []
      });
      if (item.warnings?.length > 0) {
        result.warnings.push({
          row: index + 1,
          warnings: item.warnings
        });
      }
    });

    // Process valid records
    for (const [index, item] of valid.entries()) {
      try {
        await masterDataApi.createSKU(item);
        result.imported++;
        
        if (item.warnings?.length > 0) {
          result.warnings.push({
            row: index + 1,
            warnings: item.warnings
          });
        }
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: index + 1,
          errors: [(error as Error).message]
        });
      }
    }

    result.success = result.imported > 0;
    return result;
  }

  async importSuppliers(data: any[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: 0,
      failed: 0,
      errors: [],
      warnings: []
    };

    const { valid, invalid } = validationService.validateBatch(data, 'supplier');
    
    invalid.forEach((item, index) => {
      result.errors.push({
        row: index + 1,
        errors: item.errors || []
      });
    });

    for (const [index, item] of valid.entries()) {
      try {
        await masterDataApi.createSupplier(item);
        result.imported++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: index + 1,
          errors: [(error as Error).message]
        });
      }
    }

    result.success = result.imported > 0;
    return result;
  }

  async importLocations(data: any[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: 0,
      failed: 0,
      errors: [],
      warnings: []
    };

    const { valid, invalid } = validationService.validateBatch(data, 'location');
    
    invalid.forEach((item, index) => {
      result.errors.push({
        row: index + 1,
        errors: item.errors || []
      });
    });

    for (const [index, item] of valid.entries()) {
      try {
        // Generate location code if not provided
        if (!item.code) {
          item.code = masterDataApi.generateLocationCode(
            item.street,
            item.shelf,
            item.level,
            item.position
          );
        }
        
        await masterDataApi.createStorageLocation(item);
        result.imported++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: index + 1,
          errors: [(error as Error).message]
        });
      }
    }

    result.success = result.imported > 0;
    return result;
  }

  async exportSKUs(options: ExportOptions): Promise<string> {
    const filters = {
      status: options.includeInactive ? undefined : 'active'
    };
    
    const data = await masterDataApi.getSKUs(filters);
    
    if (options.format === 'csv') {
      return this.convertToCSV(data, [
        'sku_code', 'description', 'category_id', 'unit_cost', 
        'min_stock', 'max_stock', 'abc_classification', 'status'
      ]);
    }
    
    return JSON.stringify(data, null, 2);
  }

  async exportSuppliers(options: ExportOptions): Promise<string> {
    const filters = {
      status: options.includeInactive ? undefined : 'active'
    };
    
    const data = await masterDataApi.getSuppliers(filters);
    
    if (options.format === 'csv') {
      return this.convertToCSV(data, [
        'company_name', 'trade_name', 'cnpj', 'email', 
        'phone', 'address', 'status'
      ]);
    }
    
    return JSON.stringify(data, null, 2);
  }

  async exportLocations(options: ExportOptions): Promise<string> {
    const data = await masterDataApi.getStorageLocations();
    
    if (options.format === 'csv') {
      return this.convertToCSV(data, [
        'code', 'description', 'zone_type', 'street', 
        'shelf', 'level', 'position', 'max_capacity', 'status'
      ]);
    }
    
    return JSON.stringify(data, null, 2);
  }

  private convertToCSV(data: any[], columns: string[]): string {
    const headers = columns.join(',');
    const rows = data.map(item => 
      columns.map(col => {
        const value = item[col] || '';
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }

  parseCSV(csvContent: string): any[] {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const item: any = {};
        headers.forEach((header, index) => {
          item[header] = values[index]?.trim() || '';
        });
        data.push(item);
      }
    }
    
    return data;
  }

  private parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  // Template generation for imports
  generateSKUTemplate(): string {
    const headers = [
      'sku_code', 'description', 'category_id', 'unit_cost',
      'min_stock', 'max_stock', 'abc_classification', 'status'
    ];
    
    const sampleData = [
      'SKU-001', 'Parafuso Phillips M6x20', 'CAT-001', '0.50',
      '100', '1000', 'C', 'active'
    ];
    
    return [headers.join(','), sampleData.join(',')].join('\n');
  }

  generateSupplierTemplate(): string {
    const headers = [
      'company_name', 'trade_name', 'cnpj', 'email',
      'phone', 'address', 'status'
    ];
    
    const sampleData = [
      'Empresa Exemplo Ltda', 'Exemplo', '12.345.678/0001-90', 'contato@exemplo.com',
      '(11) 1234-5678', 'Rua Exemplo, 123', 'active'
    ];
    
    return [headers.join(','), sampleData.join(',')].join('\n');
  }

  generateLocationTemplate(): string {
    const headers = [
      'street', 'shelf', 'level', 'position', 'zone_type',
      'description', 'max_capacity', 'status'
    ];
    
    const sampleData = [
      'A', '01', '01', 'A', 'picking',
      'Endereço de picking zona A', '100', 'active'
    ];
    
    return [headers.join(','), sampleData.join(',')].join('\n');
  }
}

export const dataImportService = new DataImportService();
