
import React from 'react';
import { GlobalProvider } from '@/contexts/GlobalContext';
import { ToolsProvider } from '@/contexts/ToolsContext';
import { ToolsServiceInitializer } from '@/components/tools/ToolsServiceInitializer';
import { ToolsHeader } from '@/components/tools/ToolsHeader';
import { ToolsStats } from '@/components/tools/ToolsStats';
import { ToolsTabsContainer } from '@/components/tools/ToolsTabsContainer';
import { PageContainer } from '@/components/layout/PageContainer';
import { useToolsStats } from '@/hooks/useToolsStats';

const ToolsContent: React.FC = () => {
  const { stats } = useToolsStats();

  return (
    <PageContainer>
      <ToolsHeader />
      <ToolsStats stats={stats} />
      <ToolsTabsContainer />
    </PageContainer>
  );
};

export const ToolsQRModule = () => {
  return (
    <GlobalProvider>
      <ToolsProvider>
        <ToolsServiceInitializer>
          <ToolsContent />
        </ToolsServiceInitializer>
      </ToolsProvider>
    </GlobalProvider>
  );
};
