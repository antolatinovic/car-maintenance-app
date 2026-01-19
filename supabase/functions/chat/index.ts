/**
 * Supabase Edge Function - AI Chat with Claude Streaming
 *
 * Deploy with: supabase functions deploy chat
 * Required secret: ANTHROPIC_API_KEY
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VehicleContext {
  vehicle?: {
    brand: string;
    model: string;
    year?: number;
    fuel_type?: string;
    current_mileage?: number;
  } | null;
  maintenanceHistory?: Array<{
    category: string;
    date: string;
    mileage?: number;
    description?: string;
  }>;
  upcomingMaintenance?: Array<{
    category: string;
    date: string;
    description?: string;
  }>;
}

interface ChatRequest {
  conversationId: string;
  message: string;
  vehicleContext?: VehicleContext | null;
}

function buildSystemPrompt(vehicleContext?: VehicleContext | null): string {
  let systemPrompt = `Tu es un assistant expert en maintenance automobile. Tu aides les utilisateurs a entretenir leur vehicule, comprendre les problemes mecaniques et planifier leurs maintenances.

Regles:
- Reponds toujours en francais
- Sois concis mais precis
- Si tu n'es pas sur, dis-le clairement
- Pour les problemes graves, recommande de consulter un professionnel
- Utilise des termes simples accessibles a tous`;

  if (vehicleContext?.vehicle) {
    const v = vehicleContext.vehicle;
    systemPrompt += `\n\nVehicule de l'utilisateur:
- Marque: ${v.brand}
- Modele: ${v.model}`;
    if (v.year) systemPrompt += `\n- Annee: ${v.year}`;
    if (v.fuel_type) systemPrompt += `\n- Carburant: ${v.fuel_type}`;
    if (v.current_mileage) systemPrompt += `\n- Kilometrage actuel: ${v.current_mileage} km`;
  }

  if (vehicleContext?.maintenanceHistory && vehicleContext.maintenanceHistory.length > 0) {
    systemPrompt += '\n\nHistorique de maintenance recent:';
    for (const m of vehicleContext.maintenanceHistory.slice(0, 5)) {
      systemPrompt += `\n- ${m.category} (${m.date})`;
      if (m.mileage) systemPrompt += ` a ${m.mileage} km`;
      if (m.description) systemPrompt += `: ${m.description}`;
    }
  }

  if (vehicleContext?.upcomingMaintenance && vehicleContext.upcomingMaintenance.length > 0) {
    systemPrompt += '\n\nMaintenances a venir:';
    for (const m of vehicleContext.upcomingMaintenance.slice(0, 3)) {
      systemPrompt += `\n- ${m.category} prevu le ${m.date}`;
      if (m.description) systemPrompt += `: ${m.description}`;
    }
  }

  return systemPrompt;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user token
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const { conversationId, message, vehicleContext }: ChatRequest = await req.json();

    if (!conversationId || !message) {
      return new Response(
        JSON.stringify({ error: 'conversationId and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check quota
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('ai_requests_count, ai_requests_reset_at, is_premium')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isPremium = profile.is_premium || false;
    const limit = isPremium ? 100 : 10;
    const resetAt = new Date(profile.ai_requests_reset_at);
    const now = new Date();

    let currentCount = profile.ai_requests_count || 0;
    if (resetAt < now) {
      currentCount = 0;
    }

    if (currentCount >= limit) {
      return new Response(
        JSON.stringify({ error: 'Quota depasse. Attendez le mois prochain ou passez Premium.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get conversation history (last 10 messages)
    const { data: historyMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(10);

    const conversationHistory = (historyMessages || [])
      .reverse()
      .map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    // Save user message
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: message,
    });

    // Build Claude messages
    const systemPrompt = buildSystemPrompt(vehicleContext);
    const claudeMessages = [
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    // Call Claude API with streaming
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: claudeMessages,
        stream: true,
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Erreur API Claude' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Stream response back to client
    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        const reader = claudeResponse.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);

                  if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                    const text = parsed.delta.text;
                    fullResponse += text;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
                  }

                  if (parsed.type === 'message_stop') {
                    // Save assistant response
                    await supabase.from('messages').insert({
                      conversation_id: conversationId,
                      role: 'assistant',
                      content: fullResponse,
                    });

                    // Update quota
                    const newCount = resetAt < now ? 1 : currentCount + 1;
                    const newResetAt = resetAt < now
                      ? new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
                      : profile.ai_requests_reset_at;

                    await supabase
                      .from('profiles')
                      .update({
                        ai_requests_count: newCount,
                        ai_requests_reset_at: newResetAt,
                      })
                      .eq('id', user.id);

                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  }
                } catch {
                  // Ignore parse errors for non-JSON lines
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Erreur de streaming' })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
