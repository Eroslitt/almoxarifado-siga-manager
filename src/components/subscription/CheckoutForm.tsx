import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CreditCard, Shield, Check } from 'lucide-react';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export const CheckoutForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mp, setMp] = useState<any>(null);
  const [cardToken, setCardToken] = useState('');
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    identificationType: 'CPF',
    identificationNumber: '',
    cardNumber: '',
    expirationMonth: '',
    expirationYear: '',
    securityCode: '',
    cardholderName: '',
  });

  useEffect(() => {
    // Carregar SDK do Mercado Pago
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => {
      const mercadoPago = new window.MercadoPago('APP_USR-1234567890abcdef-123456-1234567890abcdef-123456789', {
        locale: 'pt-BR'
      });
      setMp(mercadoPago);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const createCardToken = async () => {
    if (!mp) {
      throw new Error('Mercado Pago não inicializado');
    }

    const cardData = {
      cardNumber: formData.cardNumber.replace(/\s/g, ''),
      cardholderName: formData.cardholderName,
      cardExpirationMonth: formData.expirationMonth,
      cardExpirationYear: formData.expirationYear,
      securityCode: formData.securityCode,
      identificationType: formData.identificationType,
      identificationNumber: formData.identificationNumber,
    };

    const response = await mp.createCardToken(cardData);
    
    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para assinar',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Criar token do cartão
      const token = await createCardToken();
      setCardToken(token);

      // Processar pagamento
      const { data, error } = await supabase.functions.invoke('mercado-pago-payment', {
        body: {
          cardToken: token,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          identificationType: formData.identificationType,
          identificationNumber: formData.identificationNumber,
          userId: user.id,
        },
      });

      if (error) {
        console.error('Erro na função:', error);
        throw new Error('Erro ao processar pagamento');
      }

      if (data.success) {
        toast({
          title: 'Sucesso!',
          description: 'Assinatura ativada com sucesso!',
        });
        
        // Recarregar página para atualizar status
        window.location.reload();
      } else {
        throw new Error(data.error || 'Erro ao processar pagamento');
      }

    } catch (error: any) {
      console.error('Erro no checkout:', error);
      toast({
        title: 'Erro no pagamento',
        description: error.message || 'Erro ao processar pagamento',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim()
      .slice(0, 19);
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14);
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <CreditCard className="h-6 w-6" />
            SGF Pro
          </CardTitle>
          <CardDescription>
            Assinatura mensal por apenas R$ 10,90
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-600" />
              Acesso completo a todos os módulos
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-600" />
              Suporte técnico prioritário
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-600" />
              Backup automático dos dados
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-green-600" />
              Pagamento seguro com Mercado Pago
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="identificationType">Tipo de documento</Label>
                <Select
                  value={formData.identificationType}
                  onValueChange={(value) => setFormData({ ...formData, identificationType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPF">CPF</SelectItem>
                    <SelectItem value="CNPJ">CNPJ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="identificationNumber">
                  {formData.identificationType === 'CPF' ? 'CPF' : 'CNPJ'}
                </Label>
                <Input
                  id="identificationNumber"
                  type="text"
                  value={formData.identificationNumber}
                  onChange={(e) => 
                    setFormData({ 
                      ...formData, 
                      identificationNumber: formData.identificationType === 'CPF' 
                        ? formatCPF(e.target.value) 
                        : e.target.value.replace(/\D/g, '').slice(0, 14)
                    })
                  }
                  placeholder={formData.identificationType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cardholderName">Nome no cartão</Label>
              <Input
                id="cardholderName"
                type="text"
                value={formData.cardholderName}
                onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="cardNumber">Número do cartão</Label>
              <Input
                id="cardNumber"
                type="text"
                value={formData.cardNumber}
                onChange={(e) => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="expirationMonth">Mês</Label>
                <Select
                  value={formData.expirationMonth}
                  onValueChange={(value) => setFormData({ ...formData, expirationMonth: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                        {month.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expirationYear">Ano</Label>
                <Select
                  value={formData.expirationYear}
                  onValueChange={(value) => setFormData({ ...formData, expirationYear: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="AAAA" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="securityCode">CVV</Label>
                <Input
                  id="securityCode"
                  type="text"
                  value={formData.securityCode}
                  onChange={(e) => setFormData({ ...formData, securityCode: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  placeholder="000"
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !mp}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                `Assinar por R$ 10,90/mês`
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Ao clicar em "Assinar", você concorda com nossos termos de uso.
              Pagamento seguro processado pelo Mercado Pago.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};