import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { itemName, quantity, successUrl, cancelUrl } = await req.json();

    const dodoApiKey = Deno.env.get("DODO_API_KEY");
    if (!dodoApiKey) throw new Error("Missing DODO_API_KEY");

    const dodoProductId = Deno.env.get("DODO_PRODUCT_ID");
    if (!dodoProductId) throw new Error("Missing DODO_PRODUCT_ID");

    const dodoApiBaseUrl = Deno.env.get("DODO_API_BASE_URL") || "https://api.dodopayments.com";
    const customCheckoutEndpoint = Deno.env.get("DODO_CHECKOUT_ENDPOINT");

    const resolvedSuccessUrl =
      typeof successUrl === "string" && successUrl.startsWith("http")
        ? successUrl
        : "https://www.sonatech.ac.in";

    const resolvedCancelUrl =
      typeof cancelUrl === "string" && cancelUrl.startsWith("http")
        ? cancelUrl
        : "https://www.sonatech.ac.in";

    const endpointCandidates = [
      customCheckoutEndpoint,
      `${dodoApiBaseUrl}/v1/checkouts`,
      `${dodoApiBaseUrl}/v1/checkout-sessions`,
    ].filter((v): v is string => typeof v === "string" && v.length > 0);

    const payload = {
      customer: {
        email: user.email,
      },
      customer_email: user.email,
      product_id: dodoProductId,
      quantity: Number(quantity) || 1,
      items: [
        {
          product_id: dodoProductId,
          quantity: Number(quantity) || 1,
          name: itemName || "Hardware Component",
        },
      ],
      line_items: [
        {
          product_id: dodoProductId,
          quantity: Number(quantity) || 1,
        },
      ],
      success_url: resolvedSuccessUrl,
      cancel_url: resolvedCancelUrl,
      metadata: {
        item_name: itemName || "Hardware Component",
        user_id: user.id,
      },
    };

    let lastError = "Unable to create Dodo checkout session";
    let checkoutUrl: string | undefined;

    for (const endpoint of endpointCandidates) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${dodoApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let parsed: any = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = null;
      }

      if (response.ok) {
        checkoutUrl =
          parsed?.url ||
          parsed?.checkout_url ||
          parsed?.payment_url ||
          parsed?.data?.url ||
          parsed?.data?.checkout_url ||
          parsed?.session?.url;
        if (checkoutUrl) break;
        lastError = `Dodo checkout endpoint ${endpoint} did not return a checkout URL`;
        continue;
      }

      lastError = `Dodo checkout error (${response.status}) on ${endpoint}: ${text || response.statusText}`;
      if (response.status !== 404) {
        break;
      }
    }

    if (!checkoutUrl) {
      throw new Error(lastError);
    }

    return new Response(JSON.stringify({ url: checkoutUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
