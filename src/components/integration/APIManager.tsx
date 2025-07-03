
import React, { useState, useEffect } from 'react';
import { Settings, Key, Webhook, Database, Zap, Check, X, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed?: string;
  active: boolean;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
}

interface Integration {
  id: string;
  name: string;
  type: 'erp' | 'iot' | 'api' | 'database';
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, any>;
  lastSync?: string;
}

const mockAPIKeys: APIKey[] = [
  {
    id: '1',
    name: 'Mobile App',
    key: 'sk_live_abc123...',
    permissions: ['read:tools', 'write:movements'],
    createdAt: '2024-01-15',
    lastUsed: '2024-01-20',
    active: true
  }
];

const mockWebhooks: Webhook[] = [
  {
    id: '1',
    name: 'ERP Sync',
    url: 'https://erp.empresa.com/webhooks/siga',
    events: ['tool.moved', 'stock.updated'],
    active: true,
    secret: 'whsec_abc123'
  }
];

const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'SAP ERP',
    type: 'erp',
    status: 'connected',
    config: { endpoint: 'https://sap.empresa.com', user: 'siga_user' },
    lastSync: '2024-01-20 14:30'
  },
  {
    id: '2',
    name: 'Sensores IoT',
    type: 'iot',
    status: 'connected',
    config: { protocol: 'MQTT', broker: 'mqtt.empresa.com' },
    lastSync: '2024-01-20 14:35'
  }
];

export const APIManager: React.FC = () => {
  const [apiKeys, setAPIKeys] = useState<APIKey[]>(mockAPIKeys);
  const [webhooks, setWebhooks] = useState<Webhook[]>(mockWebhooks);
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [newAPIKey, setNewAPIKey] = useState({ name: '', permissions: [] as string[] });
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', events: [] as string[] });

  const availablePermissions = [
    'read:tools', 'write:tools', 'read:stock', 'write:stock',
    'read:movements', 'write:movements', 'read:reports', 'admin'
  ];

  const availableEvents = [
    'tool.created', 'tool.moved', 'tool.deleted',
    'stock.updated', 'stock.low', 'reservation.created'
  ];

  const generateAPIKey = () => {
    const key = `sk_live_${Math.random().toString(36).substr(2, 32)}`;
    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newAPIKey.name,
      key,
      permissions: newAPIKey.permissions,
      createdAt: new Date().toISOString().split('T')[0],
      active: true
    };

    setAPIKeys([...apiKeys, newKey]);
    setNewAPIKey({ name: '', permissions: [] });
  };

  const createWebhook = () => {
    const webhook: Webhook = {
      id: Date.now().toString(),
      name: newWebhook.name,
      url: newWebhook.url,
      events: newWebhook.events,
      active: true,
      secret: `whsec_${Math.random().toString(36).substr(2, 16)}`
    };

    setWebhooks([...webhooks, webhook]);
    setNewWebhook({ name: '', url: '', events: [] });
  };

  const toggleAPIKey = (id: string) => {
    setAPIKeys(keys => keys.map(key => 
      key.id === id ? { ...key, active: !key.active } : key
    ));
  };

  const toggleWebhook = (id: string) => {
    setWebhooks(hooks => hooks.map(hook => 
      hook.id === id ? { ...hook, active: !hook.active } : hook
    ));
  };

  const testWebhook = async (webhook: Webhook) => {
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SIGA-Signature': 'test'
        },
        body: JSON.stringify({
          event: 'webhook.test',
          data: { message: 'Test webhook from SIGA' }
        })
      });

      if (response.ok) {
        alert('Webhook testado com sucesso!');
      } else {
        alert('Erro ao testar webhook');
      }
    } catch (error) {
      alert('Erro de conexão com webhook');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de APIs</h2>
          <p className="text-muted-foreground">
            Configure chaves de API, webhooks e integrações externas
          </p>
        </div>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Chaves API
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Integrações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Criar Nova Chave API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="api-name">Nome da Chave</Label>
                  <Input
                    id="api-name"
                    value={newAPIKey.name}
                    onChange={(e) => setNewAPIKey({ ...newAPIKey, name: e.target.value })}
                    placeholder="Ex: Mobile App, Dashboard Web"
                  />
                </div>
                <div>
                  <Label>Permissões</Label>
                  <Select onValueChange={(value) => {
                    if (!newAPIKey.permissions.includes(value)) {
                      setNewAPIKey({
                        ...newAPIKey,
                        permissions: [...newAPIKey.permissions, value]
                      });
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar permissões" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePermissions.map(permission => (
                        <SelectItem key={permission} value={permission}>
                          {permission}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newAPIKey.permissions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newAPIKey.permissions.map(permission => (
                    <Badge key={permission} variant="secondary" className="cursor-pointer" 
                           onClick={() => setNewAPIKey({
                             ...newAPIKey,
                             permissions: newAPIKey.permissions.filter(p => p !== permission)
                           })}>
                      {permission} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}

              <Button onClick={generateAPIKey} disabled={!newAPIKey.name}>
                <Plus className="h-4 w-4 mr-2" />
                Gerar Chave API
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {apiKeys.map(apiKey => (
              <Card key={apiKey.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{apiKey.name}</h3>
                        <Badge variant={apiKey.active ? "default" : "secondary"}>
                          {apiKey.active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      <p className="text-sm font-mono text-muted-foreground">
                        {apiKey.key}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {apiKey.permissions.map(permission => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Criada em {apiKey.createdAt}
                        {apiKey.lastUsed && ` • Último uso: ${apiKey.lastUsed}`}
                      </p>
                    </div>
                    <Switch
                      checked={apiKey.active}
                      onCheckedChange={() => toggleAPIKey(apiKey.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Webhook</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="webhook-name">Nome do Webhook</Label>
                  <Input
                    id="webhook-name"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                    placeholder="Ex: ERP Sync, Notificações"
                  />
                </div>
                <div>
                  <Label htmlFor="webhook-url">URL do Webhook</Label>
                  <Input
                    id="webhook-url"
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    placeholder="https://seu-sistema.com/webhook"
                  />
                </div>
              </div>

              <div>
                <Label>Eventos</Label>
                <Select onValueChange={(value) => {
                  if (!newWebhook.events.includes(value)) {
                    setNewWebhook({
                      ...newWebhook,
                      events: [...newWebhook.events, value]
                    });
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar eventos" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEvents.map(event => (
                      <SelectItem key={event} value={event}>
                        {event}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {newWebhook.events.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newWebhook.events.map(event => (
                    <Badge key={event} variant="secondary" className="cursor-pointer"
                           onClick={() => setNewWebhook({
                             ...newWebhook,
                             events: newWebhook.events.filter(e => e !== event)
                           })}>
                      {event} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}

              <Button onClick={createWebhook} disabled={!newWebhook.name || !newWebhook.url}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Webhook
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {webhooks.map(webhook => (
              <Card key={webhook.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{webhook.name}</h3>
                        <Badge variant={webhook.active ? "default" : "secondary"}>
                          {webhook.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{webhook.url}</p>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map(event => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                      {webhook.secret && (
                        <p className="text-xs font-mono text-muted-foreground">
                          Secret: {webhook.secret}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testWebhook(webhook)}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Testar
                      </Button>
                      <Switch
                        checked={webhook.active}
                        onCheckedChange={() => toggleWebhook(webhook.id)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid gap-4">
            {integrations.map(integration => (
              <Card key={integration.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{integration.name}</h3>
                        <Badge className={getStatusColor(integration.status)}>
                          {integration.status === 'connected' ? 'Conectado' :
                           integration.status === 'disconnected' ? 'Desconectado' : 'Erro'}
                        </Badge>
                        <Badge variant="outline">{integration.type.toUpperCase()}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Object.entries(integration.config).map(([key, value]) => (
                          <span key={key} className="mr-4">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                      {integration.lastSync && (
                        <p className="text-xs text-muted-foreground">
                          Última sincronização: {integration.lastSync}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                      {integration.status === 'connected' ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <X className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
