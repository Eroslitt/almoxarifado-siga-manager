# Sistema de Sincronização Offline-Online

## Visão Geral

Este documento descreve o sistema robusto de sincronização offline-online implementado no SIGA Almoxarifado Manager. O sistema permite que o aplicativo funcione completamente offline, armazenando dados localmente e sincronizando automaticamente quando a conexão é restaurada.

## Arquitetura

### Componentes Principais

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                         │
├─────────────────────────────────────────────────────────────┤
│  useUnifiedStorage Hook  │  useSync Hook  │  useOfflineFirst │
├─────────────────────────────────────────────────────────────┤
│  unifiedStorage.ts  │  syncService.ts  │  errorHandler.ts   │
├─────────────────────────────────────────────────────────────┤
│                    IndexedDB (idb)                           │
└─────────────────────────────────────────────────────────────┘
```

## 1. Unified Storage (`src/lib/unifiedStorage.ts`)

### Descrição
Serviço unificado de armazenamento baseado em IndexedDB que combina cache, fila de operações e preferências do usuário.

### Stores do IndexedDB

- **cache**: Armazenamento geral com expiração opcional
- **queue**: Fila de operações pendentes para sincronização
- **preferences**: Configurações e preferências do usuário
- **api_cache**: Cache de respostas de API

### Métodos Principais

#### Cache
```typescript
// Armazenar no cache
await unifiedStorage.setCache('produtos', data, 60000); // 60s expiry

// Recuperar do cache
const produtos = await unifiedStorage.getCache('produtos');

// Deletar do cache
await unifiedStorage.deleteCache('produtos');

// Limpar cache expirado
await unifiedStorage.clearExpiredCache();
```

#### Fila de Sincronização
```typescript
// Adicionar à fila
const id = await unifiedStorage.addToQueue('create', 'skus', data, 'high');

// Obter fila
const queue = await unifiedStorage.getQueue();

// Remover da fila
await unifiedStorage.removeFromQueue(id);

// Incrementar tentativas
await unifiedStorage.incrementRetries(id, 3);
```

#### Preferências
```typescript
// Salvar preferência
await unifiedStorage.setPreference('theme', 'dark');

// Obter preferência
const theme = await unifiedStorage.getPreference('theme', 'light');

// Deletar preferência
await unifiedStorage.deletePreference('theme');
```

#### Cache de API
```typescript
// Cachear resposta
await unifiedStorage.cacheApiResponse(url, response, 'GET', 300000);

// Obter resposta cacheada
const cached = await unifiedStorage.getCachedApiResponse(url);

// Limpar cache expirado
await unifiedStorage.clearExpiredApiCache();
```

#### Utilitários
```typescript
// Obter estatísticas
const stats = await unifiedStorage.getStats();
// { cacheItems, queueItems, preferences, totalSize, quota, lastSync }

// Exportar dados
const exportData = await unifiedStorage.exportData();

// Importar dados
await unifiedStorage.importData(exportData);

// Limpar tudo
await unifiedStorage.clearAll();

// Manutenção automática
await unifiedStorage.performMaintenance();
```

## 2. Sync Service (`src/services/syncService.ts`)

### Descrição
Gerencia a sincronização automática entre IndexedDB e Supabase, com suporte a priorização e retry.

### Funcionalidades

#### Auto-Sync
```typescript
// Iniciar sincronização automática (30s intervalo padrão)
syncService.startAutoSync();

// Parar sincronização automática
syncService.stopAutoSync();

// Sincronização forçada
const result = await syncService.forceSync();
```

#### Priorização
As operações na fila são priorizadas:
1. **high**: Sincronizadas primeiro
2. **medium**: Sincronizadas em seguida
3. **low**: Sincronizadas por último

Dentro de cada prioridade, operações mais antigas são processadas primeiro.

#### Retry Logic
- Operações falhadas são automaticamente retentadas
- Máximo de 3 tentativas por padrão
- Após falhar todas as tentativas, a operação é removida da fila

#### Status Monitoring
```typescript
// Adicionar listener
const unsubscribe = syncService.addListener((status) => {
  console.log('Sync status:', status);
});

// Status possíveis:
// - 'idle': Aguardando
// - 'syncing': Sincronizando
// - 'success': Sucesso
// - 'partial': Sucesso parcial
// - 'error': Erro
// - 'offline': Dispositivo offline
```

## 3. Error Handler (`src/lib/errorHandler.ts`)

### Descrição
Sistema global de tratamento de erros com classificação automática e notificações ao usuário.

### Tipos de Erro

```typescript
enum ErrorType {
  NETWORK = 'NETWORK',          // Erros de rede
  VALIDATION = 'VALIDATION',     // Erros de validação
  AUTHORIZATION = 'AUTHORIZATION', // Erros de autorização
  NOT_FOUND = 'NOT_FOUND',       // Recurso não encontrado
  CONFLICT = 'CONFLICT',         // Conflito (duplicação)
  SERVER = 'SERVER',             // Erro no servidor
  CLIENT = 'CLIENT',             // Erro no cliente
  UNKNOWN = 'UNKNOWN',           // Erro desconhecido
}
```

### Uso Básico

```typescript
import { errorHandler, withErrorHandler } from '@/lib/errorHandler';

// Tratamento manual
try {
  await operation();
} catch (error) {
  const appError = errorHandler.handle(error, 'Context Name');
}

// Tratamento automático (async)
const result = await withErrorHandler(
  async () => await riskyOperation(),
  'Operação Arriscada',
  fallbackValue
);

// Tratamento automático (sync)
const value = withErrorHandlerSync(
  () => riskyOperation(),
  'Operação Síncrona',
  fallbackValue
);
```

### Funcionalidades

```typescript
// Obter log de erros
const errors = errorHandler.getErrorLog();

// Filtrar por tipo
const networkErrors = errorHandler.getErrorsByType(ErrorType.NETWORK);

// Erros recentes
const recent = errorHandler.getRecentErrors(10);

// Exportar para debug
const json = errorHandler.exportErrors();

// Limpar log
errorHandler.clearErrorLog();
```

## 4. React Hooks

### useUnifiedStorage

Hook para usar o storage unificado no React:

```typescript
import { useUnifiedStorage } from '@/hooks/useUnifiedStorage';

function MyComponent() {
  const {
    isInitialized,
    stats,
    refreshStats,
    setCache,
    getCache,
    deleteCache,
    addToQueue,
    getQueue,
    setPreference,
    getPreference,
    performMaintenance,
    clearAll,
  } = useUnifiedStorage();

  // Usar os métodos...
}
```

### useSync

Hook para gerenciar sincronização:

```typescript
import { useSync } from '@/hooks/useUnifiedStorage';

function MyComponent() {
  const {
    syncStatus,  // Status atual
    isActive,    // Se auto-sync está ativo
    startSync,   // Iniciar auto-sync
    stopSync,    // Parar auto-sync
    forceSync,   // Sincronização forçada
  } = useSync(true); // auto-start = true

  return (
    <div>
      Status: {syncStatus.status}
      {syncStatus.synced && <p>Sincronizados: {syncStatus.synced}</p>}
    </div>
  );
}
```

### useOfflineFirst

Hook para operações offline-first:

```typescript
import { useOfflineFirst } from '@/hooks/useUnifiedStorage';

function MyComponent() {
  const { executeOfflineFirst, forceSync } = useOfflineFirst();

  const handleSave = async () => {
    const result = await executeOfflineFirst(
      // Operação online
      () => supabase.from('skus').insert(data),
      // Fallback offline
      {
        action: 'create',
        table: 'skus',
        data: data,
        priority: 'high',
      }
    );

    if (result.queued) {
      console.log('Operação foi enfileirada para sincronização');
    } else {
      console.log('Operação executada online com sucesso');
    }
  };

  return <button onClick={handleSave}>Salvar</button>;
}
```

## 5. Componente Sync Monitor

### Descrição
Componente visual para monitorar e gerenciar a sincronização.

### Acesso
1. Abra o aplicativo
2. Vá para "Mais Opções"
3. Clique em "Monitor de Sincronização"

### Funcionalidades
- Visualizar status de sincronização em tempo real
- Iniciar/parar auto-sync
- Forçar sincronização imediata
- Visualizar estatísticas de armazenamento
- Ver fila de operações pendentes
- Executar manutenção (limpar cache expirado)

## Fluxo de Trabalho

### 1. Operação Online (Conexão Disponível)
```
User Action → Supabase API → Success → Update UI
```

### 2. Operação Offline (Sem Conexão)
```
User Action → Queue Operation → IndexedDB → Update UI
              ↓
         (quando online)
              ↓
         Auto Sync → Supabase API → Remove from Queue
```

### 3. Sincronização Automática
```
Every 30s → Check Queue → Sync Operations → Update Status
            ↓
     (on online event)
            ↓
     Immediate Sync
```

## Configuração

### Ajustar Intervalo de Sincronização

```typescript
// No Index.tsx ou componente raiz
useSync(true); // usa intervalo padrão (30s)

// Ou customizar
const { startSync } = useSync(false);
startSync(60000); // 60 segundos
```

### Prioridade de Operações

```typescript
// Alta prioridade (sincronizada primeiro)
await addToQueue('create', 'skus', data, 'high');

// Média prioridade (padrão)
await addToQueue('update', 'skus', data, 'medium');

// Baixa prioridade (sincronizada por último)
await addToQueue('delete', 'skus', data, 'low');
```

## Melhores Práticas

### 1. Sempre Use Offline-First
```typescript
// ✅ Bom
const result = await executeOfflineFirst(
  () => api.call(),
  { action: 'create', table: 'items', data }
);

// ❌ Evite
try {
  await api.call();
} catch (error) {
  // Tratamento manual
}
```

### 2. Cache com Expiração Apropriada
```typescript
// Dados que mudam frequentemente (1-5 minutos)
await setCache('stock', data, 5 * 60 * 1000);

// Dados relativamente estáveis (1 hora)
await setCache('suppliers', data, 60 * 60 * 1000);

// Dados raramente alterados (1 dia)
await setCache('config', data, 24 * 60 * 60 * 1000);
```

### 3. Manutenção Periódica
```typescript
// Executar manutenção diariamente
useEffect(() => {
  const interval = setInterval(async () => {
    await performMaintenance();
  }, 24 * 60 * 60 * 1000); // 24 horas

  return () => clearInterval(interval);
}, []);
```

### 4. Monitorar Tamanho do Storage
```typescript
const { stats } = useUnifiedStorage();

useEffect(() => {
  if (stats) {
    const usagePercent = (stats.totalSize / stats.quota) * 100;
    
    if (usagePercent > 80) {
      // Alerta ao usuário
      // Executar limpeza
      performMaintenance();
    }
  }
}, [stats]);
```

## Troubleshooting

### Sincronização não está funcionando
1. Verifique se auto-sync está ativo: `syncStatus.isActive`
2. Verifique conexão de internet
3. Verifique console para erros de Supabase
4. Force uma sincronização: `forceSync()`

### Storage cheio
1. Execute manutenção: `performMaintenance()`
2. Limpe cache antigo: `clearExpiredCache()`
3. Em último caso: `clearAll()` (perderá dados offline)

### Operações duplicadas
- O sistema previne duplicações usando IDs únicos
- Cada operação na fila tem ID único: `${table}_${action}_${timestamp}_${random}`

## Limitações

- **Quota do IndexedDB**: Varia por navegador (geralmente ~50% do espaço em disco disponível)
- **Tamanho de objetos**: Evite armazenar objetos muito grandes (> 10MB)
- **Sincronização em lote**: Máximo de 10 operações por lote
- **Tentativas de retry**: Máximo de 3 tentativas por operação

## Suporte a Navegadores

- ✅ Chrome/Edge 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Opera 74+
- ⚠️ Internet Explorer: Não suportado

## Segurança

- Dados sensíveis devem ser criptografados antes de armazenar
- IndexedDB é por origem (same-origin policy)
- Não armazene senhas ou tokens diretamente
- Use HTTPS em produção

## Performance

### Otimizações Implementadas
- Batch processing de sincronização
- Cache de respostas de API
- Lazy initialization do DB
- Transações otimizadas
- Índices no IndexedDB para queries rápidas

### Métricas Típicas
- Inicialização: < 100ms
- Operações de cache: < 10ms
- Sincronização (10 items): < 2s
- Manutenção: < 500ms

## Próximos Passos

1. Adicionar criptografia de dados sensíveis
2. Implementar sincronização incremental (delta sync)
3. Adicionar compressão de dados
4. Implementar conflict resolution estratégias
5. Adicionar métricas e analytics de uso

---

**Desenvolvido para SIGA Almoxarifado Manager**  
Versão 2.0.0 - Sistema de Sincronização Offline-Online
