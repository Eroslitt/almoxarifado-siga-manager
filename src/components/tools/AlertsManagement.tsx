
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, AlertTriangle, Clock, XCircle } from 'lucide-react';
import { alertsApi } from '@/services/alertsApi';
import { Alert } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const AlertsManagement = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    const data = await alertsApi.getActiveAlerts();
    setAlerts(data);
    setLoading(false);
  };

  const handleAcknowledge = async (alertId: string) => {
    const result = await alertsApi.acknowledgeAlert(alertId);
    if (result.success) {
      toast({ title: "Sucesso", description: result.message });
      loadAlerts();
    } else {
      toast({ title: "Erro", description: result.message, variant: "destructive" });
    }
  };

  const handleResolve = async (alertId: string) => {
    const result = await alertsApi.resolveAlert(alertId);
    if (result.success) {
      toast({ title: "Sucesso", description: result.message });
      loadAlerts();
    } else {
      toast({ title: "Erro", description: result.message, variant: "destructive" });
    }
  };

  const getPriorityColor = (priority: Alert['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityIcon = (priority: Alert['priority']) => {
    switch (priority) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <Bell className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeText = (type: Alert['type']) => {
    switch (type) {
      case 'overdue_return': return 'Devolução Atrasada';
      case 'maintenance_due': return 'Manutenção Necessária';
      case 'tool_unavailable': return 'Ferramenta Indisponível';
      case 'reservation_reminder': return 'Lembrete de Reserva';
      default: return 'Alerta';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Carregando alertas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Alertas Ativos ({alerts.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum alerta ativo no momento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getPriorityColor(alert.priority)}>
                          {getPriorityIcon(alert.priority)}
                          <span className="ml-1">{alert.priority.toUpperCase()}</span>
                        </Badge>
                        <Badge variant="outline">
                          {getTypeText(alert.type)}
                        </Badge>
                      </div>
                      <h4 className="font-semibold">{alert.title}</h4>
                      <p className="text-gray-600 text-sm">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alert.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {alert.status === 'active' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAcknowledge(alert.id)}
                        >
                          Confirmar
                        </Button>
                      )}
                      <Button 
                        size="sm"
                        onClick={() => handleResolve(alert.id)}
                      >
                        Resolver
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
