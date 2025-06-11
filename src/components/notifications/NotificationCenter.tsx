
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellOff, 
  Settings, 
  Trash2, 
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Filter
} from 'lucide-react';
import { notificationService } from '@/services/notificationService';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: NotificationAction[];
  data?: any;
}

interface NotificationAction {
  label: string;
  action: string;
  variant?: 'default' | 'secondary' | 'destructive';
}

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    initializeNotifications();
    setupMockNotifications();
    
    // Check permission status
    setPermissionStatus(notificationService.getPermissionStatus());
  }, []);

  const initializeNotifications = async () => {
    await notificationService.init();
  };

  const setupMockNotifications = () => {
    // Add some mock notifications for demo
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Estoque Crítico',
        message: 'Parafuso M6 x 20mm: 15 unidades (mín: 50)',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        read: false,
        actions: [
          { label: 'Ver Estoque', action: 'view-stock', variant: 'default' },
          { label: 'Solicitar', action: 'request-stock', variant: 'secondary' }
        ]
      },
      {
        id: '2',
        type: 'info',
        title: 'Nova Ferramenta',
        message: 'Furadeira Makita FER-08172 adicionada ao estoque',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        read: false,
        actions: [
          { label: 'Ver Detalhes', action: 'view-tool', variant: 'default' }
        ]
      },
      {
        id: '3',
        type: 'success',
        title: 'Manutenção Concluída',
        message: 'Alicate Universal FER-05621 liberado após manutenção',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: true,
        actions: [
          { label: 'Ver Histórico', action: 'view-maintenance', variant: 'secondary' }
        ]
      },
      {
        id: '4',
        type: 'error',
        title: 'Falha na Sincronização',
        message: 'Erro ao sincronizar dados com o servidor',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        read: false,
        actions: [
          { label: 'Tentar Novamente', action: 'retry-sync', variant: 'default' },
          { label: 'Ver Logs', action: 'view-logs', variant: 'secondary' }
        ]
      }
    ];

    setNotifications(mockNotifications);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      case 'success': return CheckCircle;
      default: return Info;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'success': return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'success': return 'bg-green-100 text-green-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return time.toLocaleDateString();
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleAction = (notificationId: string, action: string) => {
    console.log(`Notification action: ${action} for ${notificationId}`);
    
    // Mark as read when action is taken
    handleMarkAsRead(notificationId);
    
    // Handle specific actions
    switch (action) {
      case 'view-stock':
        // Navigate to stock module
        break;
      case 'view-tool':
        // Navigate to tools module
        break;
      case 'retry-sync':
        // Retry synchronization
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleRequestPermission = async () => {
    const permission = await notificationService.requestPermission();
    setPermissionStatus(permission);
  };

  const handleClearAll = () => {
    setNotifications([]);
    notificationService.clearAll();
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread': return !notif.read;
      case 'important': return notif.type === 'error' || notif.type === 'warning';
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Central de Notificações</span>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
            )}
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Permission Status */}
        {permissionStatus !== 'granted' && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BellOff className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">
                      Notificações Desabilitadas
                    </p>
                    <p className="text-sm text-yellow-600">
                      Habilite para receber alertas importantes
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={handleRequestPermission}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Habilitar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <div className="flex space-x-1">
            {[
              { key: 'all', label: 'Todas' },
              { key: 'unread', label: 'Não Lidas' },
              { key: 'important', label: 'Importantes' }
            ].map(filterOption => (
              <Button
                key={filterOption.key}
                variant={filter === filterOption.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(filterOption.key as any)}
              >
                {filterOption.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação encontrada</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const Icon = getIcon(notification.type);
                
                return (
                  <Card 
                    key={notification.id} 
                    className={`transition-all hover:shadow-md ${
                      !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${getIconColor(notification.type)}`} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <Badge className={getBadgeColor(notification.type)}>
                                {notification.type}
                              </Badge>
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTimeAgo(notification.timestamp)}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">
                            {notification.message}
                          </p>
                          
                          {notification.actions && (
                            <div className="flex items-center space-x-2">
                              {notification.actions.map((action, index) => (
                                <Button
                                  key={index}
                                  size="sm"
                                  variant={action.variant || 'secondary'}
                                  onClick={() => handleAction(notification.id, action.action)}
                                >
                                  {action.label}
                                </Button>
                              ))}
                              {!notification.read && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Marcar como Lida
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteNotification(notification.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
