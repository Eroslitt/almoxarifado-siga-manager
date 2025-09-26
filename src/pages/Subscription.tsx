import React from 'react';
import { AuthProvider } from '@/components/AuthProvider';
import { SubscriptionManager } from '@/components/subscription/SubscriptionManager';
import { AppHeader } from '@/components/layout/AppHeader';
import { Toaster } from '@/components/ui/toaster';

const Subscription = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Assinatura</h1>
              <p className="text-muted-foreground">
                Gerencie sua assinatura do SGF Pro
              </p>
            </div>
            <SubscriptionManager />
          </div>
        </main>
        <Toaster />
      </div>
    </AuthProvider>
  );
};

export default Subscription;