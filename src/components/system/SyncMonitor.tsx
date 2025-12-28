import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUnifiedStorage, useSync } from '@/hooks/useUnifiedStorage';
import {
  Cloud,
  CloudOff,
  RefreshCw,
  Database,
  HardDrive,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Download,
  Upload,
} from 'lucide-react';

export function SyncMonitor() {
  const { stats, refreshStats, performMaintenance, getQueue } = useUnifiedStorage();
  const { syncStatus, isActive, startSync, stopSync, forceSync } = useSync(false);
  const [queue, setQueue] = useState<any[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);

  const handleRefreshQueue = async () => {
    setIsLoadingQueue(true);
    try {
      const queueData = await getQueue();
      setQueue(queueData);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  const handleMaintenance = async () => {
    await performMaintenance();
    refreshStats();
  };

  const handleForceSync = async () => {
    await forceSync();
    refreshStats();
    handleRefreshQueue();
  };

  const getStatusBadge = () => {
    switch (syncStatus.status) {
      case 'syncing':
        return <Badge variant="default" className="bg-blue-500"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Sincronizando</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Sucesso</Badge>;
      case 'partial':
        return <Badge variant="default" className="bg-yellow-500"><AlertCircle className="h-3 w-3 mr-1" />Parcial</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Erro</Badge>;
      case 'offline':
        return <Badge variant="secondary"><CloudOff className="h-3 w-3 mr-1" />Offline</Badge>;
      default:
        return <Badge variant="outline"><Cloud className="h-3 w-3 mr-1" />Aguardando</Badge>;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const storagePercentage = stats ? (stats.totalSize / stats.quota) * 100 : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Monitor de Sincronização</h2>
        <p className="text-muted-foreground">
          Gerencie dados offline e sincronização com o servidor
        </p>
      </div>

      {/* Sync Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Status de Sincronização
              </CardTitle>
              <CardDescription>{syncStatus.message}</CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={() => isActive ? stopSync() : startSync()} 
              variant={isActive ? "destructive" : "default"}
              size="sm"
            >
              {isActive ? 'Parar Auto-Sync' : 'Iniciar Auto-Sync'}
            </Button>
            <Button 
              onClick={handleForceSync} 
              variant="outline"
              size="sm"
              disabled={syncStatus.status === 'syncing'}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus.status === 'syncing' ? 'animate-spin' : ''}`} />
              Sincronizar Agora
            </Button>
          </div>

          {syncStatus.synced !== undefined && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Sincronizados:</span>
                <span className="font-semibold">{syncStatus.synced}</span>
              </div>
              {syncStatus.failed !== undefined && syncStatus.failed > 0 && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-muted-foreground">Falharam:</span>
                  <span className="font-semibold">{syncStatus.failed}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Estatísticas de Armazenamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Cache</p>
              <p className="text-2xl font-bold">{stats?.cacheItems || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Fila</p>
              <p className="text-2xl font-bold">{stats?.queueItems || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Preferências</p>
              <p className="text-2xl font-bold">{stats?.preferences || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Última Sync</p>
              <p className="text-sm font-medium">
                {stats?.lastSync 
                  ? new Date(stats.lastSync).toLocaleTimeString('pt-BR')
                  : 'Nunca'
                }
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Uso de Armazenamento</span>
              <span className="font-medium">
                {formatBytes(stats?.totalSize || 0)} / {formatBytes(stats?.quota || 0)}
              </span>
            </div>
            <Progress value={storagePercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {storagePercentage.toFixed(1)}% utilizado
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={refreshStats} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={handleMaintenance} variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Manutenção
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Queue Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Fila de Sincronização
              </CardTitle>
              <CardDescription>
                {queue.length} operação(ões) aguardando sincronização
              </CardDescription>
            </div>
            <Button 
              onClick={handleRefreshQueue} 
              variant="outline" 
              size="sm"
              disabled={isLoadingQueue}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingQueue ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhuma operação na fila
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {queue.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        item.action === 'create' ? 'bg-green-100 dark:bg-green-900/30' :
                        item.action === 'update' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        {item.action === 'create' ? <Upload className="h-4 w-4 text-green-600 dark:text-green-400" /> :
                         item.action === 'update' ? <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" /> :
                         <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {item.action.toUpperCase()} - {item.table}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        item.priority === 'high' ? 'destructive' :
                        item.priority === 'medium' ? 'default' :
                        'secondary'
                      }>
                        {item.priority || 'medium'}
                      </Badge>
                      {item.retries > 0 && (
                        <Badge variant="outline">
                          {item.retries} tentativa(s)
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
