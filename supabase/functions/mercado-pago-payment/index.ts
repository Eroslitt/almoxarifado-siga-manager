import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  cardToken: string;
  email: string;
  firstName: string;
  lastName: string;
  identificationType: string;
  identificationNumber: string;
}

interface SubscriptionRequest extends PaymentRequest {
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!accessToken) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN not found');
      return new Response(
        JSON.stringify({ error: 'Configuração de pagamento não encontrada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { 
      cardToken, 
      email, 
      firstName, 
      lastName, 
      identificationType, 
      identificationNumber, 
      userId 
    }: SubscriptionRequest = await req.json();

    console.log('Processando pagamento para:', email);

    // Criar customer no Mercado Pago
    const customerResponse = await fetch('https://api.mercadopago.com/v1/customers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: lastName,
        identification: {
          type: identificationType,
          number: identificationNumber,
        },
      }),
    });

    let customer;
    if (customerResponse.status === 201) {
      customer = await customerResponse.json();
      console.log('Customer criado:', customer.id);
    } else {
      const errorData = await customerResponse.json();
      console.error('Erro ao criar customer:', errorData);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar dados do cliente' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar cartão para o customer
    const cardResponse = await fetch(`https://api.mercadopago.com/v1/customers/${customer.id}/cards`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: cardToken,
      }),
    });

    let card;
    if (cardResponse.status === 201) {
      card = await cardResponse.json();
      console.log('Cartão criado:', card.id);
    } else {
      const errorData = await cardResponse.json();
      console.error('Erro ao criar cartão:', errorData);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar cartão de crédito' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar plano de assinatura mensal
    const planResponse = await fetch('https://api.mercadopago.com/preapproval_plan', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: 'Assinatura SGF Pro - Mensalidade',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 10.90,
          currency_id: 'BRL',
        },
      }),
    });

    let plan;
    if (planResponse.status === 201) {
      plan = await planResponse.json();
      console.log('Plano criado:', plan.id);
    } else {
      const errorData = await planResponse.json();
      console.error('Erro ao criar plano:', errorData);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar plano de assinatura' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Criar assinatura
    const subscriptionResponse = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preapproval_plan_id: plan.id,
        reason: 'Assinatura SGF Pro',
        payer_id: customer.id,
        card_token_id: cardToken,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          start_date: new Date().toISOString(),
          transaction_amount: 10.90,
          currency_id: 'BRL',
        },
        back_url: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/functions/v1/mercado-pago-webhook`,
        status: 'authorized',
      }),
    });

    let subscription;
    if (subscriptionResponse.status === 201) {
      subscription = await subscriptionResponse.json();
      console.log('Assinatura criada:', subscription.id);
    } else {
      const errorData = await subscriptionResponse.json();
      console.error('Erro ao criar assinatura:', errorData);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar assinatura' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Salvar assinatura no banco de dados
    const { error: dbError } = await supabaseClient
      .from('subscriptions')
      .insert({
        user_id: userId,
        external_payment_id: subscription.id,
        status: 'active',
        amount: 10.90,
        plan_name: 'SGF Pro',
        payment_method: 'mercado_pago',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
      });

    if (dbError) {
      console.error('Erro ao salvar assinatura no banco:', dbError);
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar assinatura' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Atualizar perfil do usuário
    await supabaseClient
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('user_id', userId);

    console.log('Pagamento processado com sucesso');

    return new Response(
      JSON.stringify({
        success: true,
        subscription_id: subscription.id,
        status: subscription.status,
        message: 'Assinatura criada com sucesso!',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro no processamento do pagamento:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);