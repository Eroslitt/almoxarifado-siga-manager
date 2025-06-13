
import React from 'react';
import { ToolsProvider } from '@/contexts/ToolsContext';
import { ToolsServiceInitializer } from '@/components/tools/ToolsServiceInitializer';
import { ToolsHeader } from '@/components/tools/ToolsHeader';
import { ToolsStats } from '@/components/tools/ToolsStats';
import { ToolsTabsContainer } from '@/components/tools/ToolsTabsContainer';
import { useToolsStats } from '@/hooks/useToolsStats';

const ToolsContent: React.FC = () => {
  const { stats } = useToolsStats();

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 min-h-screen">
      <ToolsHeader />
      <ToolsStats stats={stats} />
      <ToolsTabsContainer />
    </div>
  );
};

export const ToolsQRModule = () => {
  return (
    <ToolsProvider>
      <ToolsServiceInitializer>
        <ToolsContent />
      </ToolsServiceInitializer>
    </ToolsProvider>
  );
};
