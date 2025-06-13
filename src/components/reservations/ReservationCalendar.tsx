
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReservations } from '@/hooks/useReservations';
import { Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';

export const ReservationCalendar: React.FC = () => {
  const { reservations, calendar, isLoading, loadCalendar, approveReservation } = useReservations();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // Next 30 days
    
    loadCalendar(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
  }, [loadCalendar]);

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const todayReservations = calendar.find(day => day.date === selectedDate)?.reservations || [];

  const handleApprove = async (reservationId: string) => {
    await approveReservation(reservationId, 'ADMIN-001');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Carregando calendário...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Calendário de Reservas</h2>
        <p className="text-gray-600">Gerencie reservas e disponibilidade de ferramentas</p>
      </div>

      {/* Pending Approvals */}
      {pendingReservations.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Clock className="h-5 w-5" />
              Reservas Pendentes de Aprovação ({pendingReservations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingReservations.map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{reservation.toolName}</p>
                      <p className="text-sm text-gray-600">
                        {reservation.userName} • {new Date(reservation.startDate).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-gray-500">{reservation.purpose}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleApprove(reservation.id)}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Aprovar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendário de Disponibilidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {calendar.slice(0, 35).map((day) => {
                const isSelected = day.date === selectedDate;
                const hasReservations = day.reservations.length > 0;
                const availabilityRate = (day.availability.available / day.availability.total) * 100;
                
                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className={`p-2 text-sm rounded border transition-colors ${
                      isSelected 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : hasReservations
                        ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{new Date(day.date).getDate()}</div>
                    {hasReservations && (
                      <div className="text-xs mt-1">
                        <div className={`w-2 h-2 rounded-full mx-auto ${
                          availabilityRate > 70 ? 'bg-green-400' :
                          availabilityRate > 30 ? 'bg-yellow-400' : 'bg-red-400'
                        }`} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-400 rounded-full" />
                <span>Alta Disponibilidade</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                <span>Média Disponibilidade</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-400 rounded-full" />
                <span>Baixa Disponibilidade</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {new Date(selectedDate).toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayReservations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma reserva para este dia</p>
            ) : (
              <div className="space-y-3">
                {todayReservations.map((reservation) => (
                  <div key={reservation.id} className="p-3 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{reservation.toolName}</span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {reservation.userName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(reservation.startDate).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {new Date(reservation.endDate).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      {reservation.purpose && (
                        <p className="text-xs">{reservation.purpose}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
