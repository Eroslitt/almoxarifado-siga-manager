import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!accessToken) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN not found');
      return new Response('OK', { status: 200 });
    }

    const notification = await req.json();
    console.log('Webhook recebido:', notification);

    // Processar webhooks de pagamento
    if (notification.type === 'payment') {
      const paymentId = notification.data.id;
      
      // Buscar detalhes do pagamento
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (paymentResponse.ok) {
        const payment = await paymentResponse.json();
        console.log('Pagamento processado:', payment.id, payment.status);

        // Atualizar status da assinatura baseado no pagamento
        if (payment.external_reference) {
          const { error } = await supabaseClient
            .from('subscriptions')
            .update({
              status: payment.status === 'approved' ? 'active' : 'failed',
            })
            .eq('external_payment_id', payment.external_reference);

          if (error) {
            console.error('Erro ao atualizar status da assinatura:', error);
          }
        }
      }
    }

    // Processar webhooks de assinatura
    if (notification.type === 'preapproval') {
      const subscriptionId = notification.data.id;
      
      // Buscar detalhes da assinatura
      const subscriptionResponse = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (subscriptionResponse.ok) {
        const subscription = await subscriptionResponse.json();
        console.log('Assinatura atualizada:', subscription.id, subscription.status);

        // Atualizar status da assinatura no banco
        const { error } = await supabaseClient
          .from('subscriptions')
          .update({
            status: subscription.status,
          })
          .eq('external_payment_id', subscription.id);

        if (error) {
          console.error('Erro ao atualizar assinatura:', error);
        }

        // Atualizar perfil do usuário
        if (subscription.status === 'authorized') {
          const { data: subscriptionData } = await supabaseClient
            .from('subscriptions')
            .select('user_id')
            .eq('external_payment_id', subscription.id)
            .single();

          if (subscriptionData) {
            await supabaseClient
              .from('profiles')
              .update({
                subscription_status: 'active',
                subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              })
              .eq('user_id', subscriptionData.user_id);
          }
        } else if (subscription.status === 'cancelled' || subscription.status === 'finished') {
          const { data: subscriptionData } = await supabaseClient
            .from('subscriptions')
            .select('user_id')
            .eq('external_payment_id', subscription.id)
            .single();

          if (subscriptionData) {
            await supabaseClient
              .from('profiles')
              .update({
                subscription_status: 'inactive',
              })
              .eq('user_id', subscriptionData.user_id);
          }
        }
      }
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response('OK', { status: 200 });
  }
};

serve(handler);