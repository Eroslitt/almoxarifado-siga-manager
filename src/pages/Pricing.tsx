import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Shield, FileText, Users, Smartphone, Cloud, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import pricingBg from '@/assets/pricing-bg.jpg';
import epiHero from '@/assets/epi-control-hero.jpg';
import materialHero from '@/assets/material-verification-hero.jpg';

const Pricing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    try {
      // Create subscription record
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_name: 'Premium',
          amount: 10.90,
          status: 'pending'
        });

      if (error) throw error;

      // Update user profile
      await supabase
        .from('profiles')
        .update({ subscription_status: 'active' })
        .eq('user_id', user.id);

      toast({
        title: "Assinatura Ativada!",
        description: "Bem-vindo ao SIGA Premium! Redirecionando para o dashboard...",
      });

      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao processar assinatura. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Shield,
      title: "Controle de EPIs",
      description: "Sistema digitalizado com assinaturas em dispositivos móveis"
    },
    {
      icon: FileText,
      title: "Verificação de Materiais",
      description: "Fichas digitais para controle de qualidade"
    },
    {
      icon: Users,
      title: "Gestão de Funcionários",
      description: "Controle completo de distribuição de equipamentos"
    },
    {
      icon: Smartphone,
      title: "Aplicativo Mobile",
      description: "Acesso via smartphones e tablets"
    },
    {
      icon: Cloud,
      title: "Armazenamento em Nuvem",
      description: "Dados seguros e acessíveis de qualquer lugar"
    },
    {
      icon: Star,
      title: "Suporte Premium",
      description: "Atendimento especializado e atualizações prioritárias"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Hero Section */}
      <div 
        className="relative py-20 px-4 text-center bg-cover bg-center"
        style={{ backgroundImage: `url(${pricingBg})` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            SIGA Almoxarifado
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Controle profissional de EPIs e materiais para sua empresa
          </p>
          <Badge variant="secondary" className="text-lg px-6 py-2">
            Solução Completa • R$ 10,90/mês
          </Badge>
        </div>
      </div>

      {/* Features Preview */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            O que você terá acesso
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              <img 
                src={epiHero} 
                alt="Controle de EPIs" 
                className="w-full rounded-lg shadow-lg"
              />
              <div>
                <h3 className="text-2xl font-bold mb-4">Controle de EPIs</h3>
                <p className="text-muted-foreground mb-4">
                  Sistema digitalizado que permite assinaturas diretamente na tela de smartphones e tablets. 
                  Garanta conformidade e segurança em qualquer lugar.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Assinatura digital em dispositivos móveis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Controle de vencimento de equipamentos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Histórico completo de distribuições</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <img 
                src={materialHero} 
                alt="Verificação de Materiais" 
                className="w-full rounded-lg shadow-lg"
              />
              <div>
                <h3 className="text-2xl font-bold mb-4">Ficha de Verificação de Materiais</h3>
                <p className="text-muted-foreground mb-4">
                  Sistema digital para verificação da qualidade de materiais na chegada à obra. 
                  Modernize o controle e assegure a conformidade com facilidade e eficiência.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Verificação digital de qualidade</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Fotos e documentação integrada</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Relatórios de conformidade</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pricing Card */}
          <div className="max-w-md mx-auto">
            <Card className="border-primary shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">Plano Premium</CardTitle>
                <div className="text-4xl font-bold text-primary">
                  R$ 10,90
                  <span className="text-lg font-normal text-muted-foreground">/mês</span>
                </div>
                <CardDescription>
                  Acesso completo a todas as funcionalidades
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Controle ilimitado de EPIs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Verificação de materiais</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Assinaturas digitais</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Relatórios e analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Suporte via WhatsApp</span>
                  </li>
                </ul>
                
                <Button 
                  onClick={handleSubscribe}
                  className="w-full text-lg py-6"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processando...' : 'Assinar Agora'}
                </Button>
                
                <p className="text-center text-sm text-muted-foreground">
                  Pagamento via Mercado Pago • Cancele quando quiser
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;