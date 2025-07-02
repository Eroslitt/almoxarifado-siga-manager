
import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Info, CheckCircle, Clock, Filter, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  category: 'stock' | 'tools' | 'maintenance' | 'system' | 'approval';
  actionRequired?: boolean;
  actionUrl?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'critical',
    title: 'Estoque Crítico',
    message: 'Furadeira Makita HP333D está com estoque crítico (2 unidades)',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    priority: 'high',
    category: 'stock',
    actionRequired: true,
    actionUrl: '/stock'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Manutenção Programada',
    message: 'Serra Circular precisa de manutenção preventiva em 3 dias',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    read: false,
    priority: 'medium',
    category: 'maintenance',
    actionRequired: true,
    actionUrl: '/tools-qr?tab=maintenance'
  },
  {
    id: '3',
    type: 'info',
    title: 'Nova Ferramenta Cadastrada',
    message: 'Parafusadeira Bosch GSR12V foi adicionada ao sistema',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: true,
    priority: 'low',
    category: 'tools'
  },
  {
    id: '4',
    type: 'success',
    title: 'Aprovação Concluída',
    message: 'Solicitação de compra #SC-2024-001 foi aprovada',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    read: false,
    priority: 'medium',
    category: 'approval'
  }
];

export const AdvancedNotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');
  const [settings, setSettings] = useState({
    email: true,
    push: true,
    sound: true,
    categories: {
      stock: true,
      tools: true,
      maintenance: true,
      system: true,
      approval: true
    }
  });
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'high') return notification.priority === 'high';
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({
      title: "Sucesso",
      description: "Todas as notificações foram marcadas como lidas"
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const shouldAddNotification = Math.random() < 0.1; // 10% chance every 30 seconds
      
      if (shouldAddNotification) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: Math.random() > 0.5 ? 'warning' : 'info',
          title: 'Movimentação de ferramenta',
          message: `${Math.random() > 0.5 ? 'Retirada' : 'Devolução'} de ferramenta detectada`,
          timestamp: new Date(),
          read: false,
          priority: 'medium',
          category: 'tools'
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep only 20 notifications
        
        if (settings.push) {
          toast({
            title: newNotification.title,
            description: newNotification.message
          });
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [settings.push, toast]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 px-1 min-w-[1.25rem] h-5 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-10 w-96 max-h-[600px] z-50 shadow-lg">
          <Tabs defaultValue="notifications" className="w-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Central de Notificações</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="notifications">
                  Notificações
                  {highPriorityCount > 0 && (
                    <Badge variant="destructive" className="ml-2 px-1 text-xs">
                      {highPriorityCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="notifications" className="mt-0">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex gap-2">
                    <Button
                      variant={filter === 'all' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setFilter('all')}
                    >
                      Todas
                    </Button>
                    <Button
                      variant={filter === 'unread' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setFilter('unread')}
                    >
                      Não lidas ({unreadCount})
                    </Button>
                    <Button
                      variant={filter === 'high' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setFilter('high')}
                    >
                      Alta prioridade
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Marcar todas como lidas
                  </Button>
                </div>

                <ScrollArea className="max-h-96">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma notificação encontrada</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer ${
                            !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {getIcon(notification.type)}
                                <span className="font-medium text-sm">{notification.title}</span>
                                <Badge className={getPriorityColor(notification.priority)}>
                                  {notification.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                {notification.actionRequired && (
                                  <Button variant="outline" size="sm">
                                    Ver detalhes
                                  </Button>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Preferências de notificação</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications">Notificações por email</Label>
                        <Switch
                          id="email-notifications"
                          checked={settings.email}
                          onCheckedChange={(checked) => setSettings(prev => ({ ...prev, email: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-notifications">Notificações push</Label>
                        <Switch
                          id="push-notifications"
                          checked={settings.push}
                          onCheckedChange={(checked) => setSettings(prev => ({ ...prev, push: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sound-notifications">Som das notificações</Label>
                        <Switch
                          id="sound-notifications"
                          checked={settings.sound}
                          onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sound: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Categorias</h4>
                    <div className="space-y-3">
                      {Object.entries(settings.categories).map(([category, enabled]) => (
                        <div key={category} className="flex items-center justify-between">
                          <Label htmlFor={`category-${category}`} className="capitalize">
                            {category === 'stock' ? 'Estoque' :
                             category === 'tools' ? 'Ferramentas' :
                             category === 'maintenance' ? 'Manutenção' :
                             category === 'system' ? 'Sistema' :
                             'Aprovações'}
                          </Label>
                          <Switch
                            id={`category-${category}`}
                            checked={enabled}
                            onCheckedChange={(checked) => 
                              setSettings(prev => ({
                                ...prev,
                                categories: { ...prev.categories, [category]: checked }
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
};
