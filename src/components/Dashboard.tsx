
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { KPICards } from '@/components/dashboard/KPICards';
import { StatusCards } from '@/components/dashboard/StatusCards';
import { ChartsSection } from '@/components/dashboard/ChartsSection';
import { OperationalStatus } from '@/components/dashboard/OperationalStatus';

export const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <DashboardHeader />

      <KPICards />

      <StatusCards />

      <ChartsSection />

      <OperationalStatus />
    </div>
  );
};
