
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { KPICards } from '@/components/dashboard/KPICards';
import { StatusCards } from '@/components/dashboard/StatusCards';
import { ChartsSection } from '@/components/dashboard/ChartsSection';
import { OperationalStatus } from '@/components/dashboard/OperationalStatus';
import { PageContainer } from '@/components/layout/PageContainer';

export const Dashboard = () => {
  return (
    <PageContainer>
      <DashboardHeader />
      <KPICards />
      <StatusCards />
      <ChartsSection />
      <OperationalStatus />
    </PageContainer>
  );
};
