import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthButton } from '@/components/AuthButton';
import { User, AlertTriangle } from 'lucide-react';

interface AuthBannerProps {
  user: any;
  onAuthChange: () => void;
}

export const AuthBanner: React.FC<AuthBannerProps> = ({ user, onAuthChange }) => {
  if (user) return null;

  return (
    <Alert className="border-blue-200 bg-blue-50 mb-6">
      <AlertTriangle className="h-4 w-4 text-blue-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Para usar todas as funcionalidades do sistema, você precisa fazer login.</span>
        </div>
        <AuthButton user={user} onAuthChange={onAuthChange} />
      </AlertDescription>
    </Alert>
  );
};