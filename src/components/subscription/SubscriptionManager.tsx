import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CheckoutForm } from './CheckoutForm';
import { Calendar, CreditCard, User, AlertTriangle } from 'lucide-react';

interface Subscription {
  id: string;
  status: string;
  plan_name: string;
  amount: number;
  start_date: string;
  end_date: string;
  external_payment_id: string;
}

export const SubscriptionManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Erro ao carregar assinatura:', error);
        return;
      }

      if (data && data.length > 0) {
        setSubscription(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar assinatura:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'pending':
        return 'Pendente';
      case 'failed':
        return 'Falhou';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Acesso Restrito
          </CardTitle>
          <CardDescription>
            Você precisa estar logado para gerenciar sua assinatura.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (showCheckout) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setShowCheckout(false)}
        >
          ← Voltar
        </Button>
        <CheckoutForm />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Bem-vindo ao SGF Pro</CardTitle>
            <CardDescription>
              Desbloqueie todos os recursos com nossa assinatura mensal
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <div className="text-3xl font-bold text-primary">
                R$ 10,90<span className="text-lg font-normal">/mês</span>
              </div>
              <Button 
                size="lg" 
                onClick={() => setShowCheckout(true)}
                className="w-full"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Assinar Agora
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Minha Assinatura
          </CardTitle>
          <CardDescription>
            Gerencie sua assinatura do SGF Pro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{subscription.plan_name}</h3>
              <p className="text-sm text-muted-foreground">
                R$ {subscription.amount.toFixed(2)}/mês
              </p>
            </div>
            <Badge className={getStatusColor(subscription.status)}>
              {getStatusText(subscription.status)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Início</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(subscription.start_date)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Próximo pagamento</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(subscription.end_date)}
                </p>
              </div>
            </div>
          </div>

          {subscription.status === 'active' && (
            <div className="pt-4 border-t">
              <p className="text-sm text-green-600 font-medium">
                ✓ Assinatura ativa - Acesso completo liberado
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>
            Visualize o histórico de suas cobranças
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Pagamento de {formatDate(subscription.start_date)}</p>
                <p className="text-sm text-muted-foreground">SGF Pro - Mensalidade</p>
              </div>
              <div className="text-right">
                <p className="font-medium">R$ {subscription.amount.toFixed(2)}</p>
                <Badge className={getStatusColor(subscription.status)} variant="secondary">
                  {getStatusText(subscription.status)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};