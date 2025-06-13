
export class BlueprintUtils {
  static formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static calcularTempoPosse(timestampRetirada: string): string {
    const agora = new Date();
    const retirada = new Date(timestampRetirada);
    const diffMs = agora.getTime() - retirada.getTime();
    
    const horas = Math.floor(diffMs / (1000 * 60 * 60));
    const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (horas > 0) {
      return `${horas}h ${minutos}min`;
    } else {
      return `${minutos}min`;
    }
  }

  static mapearStatus(status: string): 'DISPONÍVEL' | 'EM USO' | 'EM MANUTENÇÃO' {
    const statusMap = {
      'available': 'DISPONÍVEL',
      'in-use': 'EM USO',
      'maintenance': 'EM MANUTENÇÃO'
    };
    return statusMap[status] || 'DISPONÍVEL';
  }
}
