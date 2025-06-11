
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Plus, X } from 'lucide-react';
import { reservationsApi } from '@/services/reservationsApi';
import { toolsApi } from '@/services/toolsApi';
import { ToolReservation, Tool } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const ReservationsManagement = () => {
  const [reservations, setReservations] = useState<ToolReservation[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const [newReservation, setNewReservation] = useState({
    toolId: '',
    reservedFrom: '',
    reservedUntil: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    const [reservationsData, toolsData] = await Promise.all([
      reservationsApi.getUserReservations(user.id),
      toolsApi.getTools()
    ]);
    
    setReservations(reservationsData);
    setTools(toolsData.data);
    setLoading(false);
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const result = await reservationsApi.createReservation({
      toolId: newReservation.toolId,
      userId: user.id,
      reservedFrom: newReservation.reservedFrom,
      reservedUntil: newReservation.reservedUntil,
      notes: newReservation.notes || undefined
    });

    if (result.success) {
      toast({ title: "Sucesso", description: result.message });
      setShowCreateForm(false);
      setNewReservation({ toolId: '', reservedFrom: '', reservedUntil: '', notes: '' });
      loadData();
    } else {
      toast({ title: "Erro", description: result.message, variant: "destructive" });
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    const result = await reservationsApi.cancelReservation(reservationId);
    if (result.success) {
      toast({ title: "Sucesso", description: result.message });
      loadData();
    } else {
      toast({ title: "Erro", description: result.message, variant: "destructive" });
    }
  };

  const getStatusColor = (status: ToolReservation['status']) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: ToolReservation['status']) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Carregando reservas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Minhas Reservas</span>
            </CardTitle>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Reserva
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showCreateForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Nova Reserva</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateReservation} className="space-y-4">
                  <div>
                    <Label htmlFor="tool">Ferramenta</Label>
                    <select
                      id="tool"
                      className="w-full p-2 border rounded"
                      value={newReservation.toolId}
                      onChange={(e) => setNewReservation(prev => ({ ...prev, toolId: e.target.value }))}
                      required
                    >
                      <option value="">Selecione uma ferramenta</option>
                      {tools.filter(tool => tool.status === 'available').map(tool => (
                        <option key={tool.id} value={tool.id}>
                          {tool.name} - {tool.location}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reservedFrom">Data/Hora Início</Label>
                      <Input
                        id="reservedFrom"
                        type="datetime-local"
                        value={newReservation.reservedFrom}
                        onChange={(e) => setNewReservation(prev => ({ ...prev, reservedFrom: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="reservedUntil">Data/Hora Fim</Label>
                      <Input
                        id="reservedUntil"
                        type="datetime-local"
                        value={newReservation.reservedUntil}
                        onChange={(e) => setNewReservation(prev => ({ ...prev, reservedUntil: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Observações (opcional)</Label>
                    <Textarea
                      id="notes"
                      value={newReservation.notes}
                      onChange={(e) => setNewReservation(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Descreva o uso planejado..."
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit">Criar Reserva</Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {reservations.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Você não possui reservas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getStatusColor(reservation.status)}>
                          {getStatusText(reservation.status)}
                        </Badge>
                        {reservation.priority > 1 && (
                          <Badge variant="outline">Alta Prioridade</Badge>
                        )}
                      </div>
                      <h4 className="font-semibold">{(reservation as any).tools?.name}</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {new Date(reservation.reserved_from).toLocaleString('pt-BR')} - 
                            {new Date(reservation.reserved_until).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        {reservation.notes && (
                          <p className="mt-2">{reservation.notes}</p>
                        )}
                      </div>
                    </div>
                    {reservation.status === 'active' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCancelReservation(reservation.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    )}
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
