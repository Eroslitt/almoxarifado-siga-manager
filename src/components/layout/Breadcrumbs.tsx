
import { ChevronRight, Home } from 'lucide-react';
import { useNavigation } from '@/contexts/NavigationContext';

export const Breadcrumbs = () => {
  const { breadcrumbs, setActiveModule } = useNavigation();

  const handleHomeClick = () => {
    setActiveModule('dashboard');
  };

  if (breadcrumbs.length === 0) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Home className="h-4 w-4" />
        <span>Dashboard</span>
      </div>
    );
  }

  return (
    <nav className="flex items-center space-x-2 text-sm">
      <button
        onClick={handleHomeClick}
        className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
      >
        <Home className="h-4 w-4" />
      </button>
      
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span
            className={index === breadcrumbs.length - 1 
              ? "text-gray-900 font-medium" 
              : "text-gray-600 hover:text-blue-600 cursor-pointer"
            }
          >
            {crumb.label}
          </span>
        </div>
      ))}
    </nav>
  );
};
