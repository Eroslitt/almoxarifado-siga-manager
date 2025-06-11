
interface ValidationRule {
  field: string;
  message: string;
  validate: (value: any, context?: any) => boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

class ValidationService {
  private skuRules: ValidationRule[] = [
    {
      field: 'sku_code',
      message: 'Código SKU deve ter entre 3 e 20 caracteres',
      validate: (value: string) => value && value.length >= 3 && value.length <= 20
    },
    {
      field: 'sku_code',
      message: 'Código SKU deve conter apenas letras, números e hífens',
      validate: (value: string) => /^[A-Za-z0-9-]+$/.test(value)
    },
    {
      field: 'description',
      message: 'Descrição é obrigatória e deve ter pelo menos 5 caracteres',
      validate: (value: string) => value && value.trim().length >= 5
    },
    {
      field: 'min_stock',
      message: 'Estoque mínimo deve ser maior que zero',
      validate: (value: number) => value > 0
    },
    {
      field: 'max_stock',
      message: 'Estoque máximo deve ser maior que o mínimo',
      validate: (value: number, context: any) => value > (context?.min_stock || 0)
    },
    {
      field: 'unit_cost',
      message: 'Custo unitário deve ser maior que zero',
      validate: (value: number) => value > 0
    }
  ];

  private supplierRules: ValidationRule[] = [
    {
      field: 'company_name',
      message: 'Razão social é obrigatória',
      validate: (value: string) => value && value.trim().length > 0
    },
    {
      field: 'cnpj',
      message: 'CNPJ deve ter 14 dígitos',
      validate: (value: string) => this.validateCNPJ(value)
    },
    {
      field: 'email',
      message: 'Email deve ter formato válido',
      validate: (value: string) => !value || this.validateEmail(value)
    },
    {
      field: 'phone',
      message: 'Telefone deve ter formato válido',
      validate: (value: string) => !value || /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value)
    }
  ];

  private locationRules: ValidationRule[] = [
    {
      field: 'code',
      message: 'Código do endereço é obrigatório',
      validate: (value: string) => value && value.trim().length > 0
    },
    {
      field: 'street',
      message: 'Rua deve ter entre 1 e 10 caracteres',
      validate: (value: string) => value && value.length >= 1 && value.length <= 10
    },
    {
      field: 'shelf',
      message: 'Prateleira deve ser um número entre 1 e 99',
      validate: (value: string) => {
        const num = parseInt(value);
        return !isNaN(num) && num >= 1 && num <= 99;
      }
    },
    {
      field: 'level',
      message: 'Nível deve ser um número entre 1 e 20',
      validate: (value: string) => {
        const num = parseInt(value);
        return !isNaN(num) && num >= 1 && num <= 20;
      }
    },
    {
      field: 'position',
      message: 'Posição deve ter entre 1 e 3 caracteres',
      validate: (value: string) => value && value.length >= 1 && value.length <= 3
    }
  ];

  validateSKU(data: any): ValidationResult {
    return this.runValidation(data, this.skuRules);
  }

  validateSupplier(data: any): ValidationResult {
    return this.runValidation(data, this.supplierRules);
  }

  validateLocation(data: any): ValidationResult {
    return this.runValidation(data, this.locationRules);
  }

  private runValidation(data: any, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    rules.forEach(rule => {
      const value = data[rule.field];
      if (!rule.validate(value, data)) {
        errors.push(rule.message);
      }
    });

    // Add business logic warnings
    this.addBusinessWarnings(data, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private addBusinessWarnings(data: any, warnings: string[]): void {
    // SKU specific warnings
    if (data.min_stock && data.max_stock) {
      const ratio = data.max_stock / data.min_stock;
      if (ratio > 10) {
        warnings.push('Diferença muito alta entre estoque mínimo e máximo - considere revisar');
      }
    }

    if (data.unit_cost && data.unit_cost > 1000) {
      warnings.push('Item de alto valor - considere controles adicionais');
    }

    // Location warnings
    if (data.max_capacity && data.max_capacity > 1000) {
      warnings.push('Capacidade muito alta para um endereço - verifique se está correto');
    }

    // Supplier warnings
    if (data.company_name && data.trade_name && data.company_name === data.trade_name) {
      warnings.push('Razão social e nome fantasia são iguais - verifique se está correto');
    }
  }

  validateBatch(items: any[], type: 'sku' | 'supplier' | 'location'): { valid: any[]; invalid: any[] } {
    const valid: any[] = [];
    const invalid: any[] = [];

    items.forEach(item => {
      let result: ValidationResult;
      
      switch (type) {
        case 'sku':
          result = this.validateSKU(item);
          break;
        case 'supplier':
          result = this.validateSupplier(item);
          break;
        case 'location':
          result = this.validateLocation(item);
          break;
        default:
          result = { isValid: false, errors: ['Tipo de validação inválido'], warnings: [] };
      }

      if (result.isValid) {
        valid.push({ ...item, warnings: result.warnings });
      } else {
        invalid.push({ ...item, errors: result.errors, warnings: result.warnings });
      }
    });

    return { valid, invalid };
  }

  private validateCNPJ(cnpj: string): boolean {
    if (!cnpj) return false;
    
    // Remove formatting
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    
    // Check length
    if (cleanCNPJ.length !== 14) return false;
    
    // Check for repeated digits
    if (/^(\d)\1+$/.test(cleanCNPJ)) return false;
    
    // Validate check digits (simplified)
    let sum = 0;
    let weight = 5;
    
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanCNPJ[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    
    let checkDigit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (parseInt(cleanCNPJ[12]) !== checkDigit1) return false;
    
    sum = 0;
    weight = 6;
    
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleanCNPJ[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }
    
    let checkDigit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return parseInt(cleanCNPJ[13]) === checkDigit2;
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Custom validation for specific business rules
  async validateUniqueConstraints(data: any, type: 'sku' | 'supplier' | 'location'): Promise<ValidationResult> {
    const errors: string[] = [];
    
    // This would typically check against the database
    // For now, we'll simulate the validation
    console.log(`Validating unique constraints for ${type}:`, data);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }
}

export const validationService = new ValidationService();
