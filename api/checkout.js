const resolveCheckoutUrl = (dodoData) => (
  dodoData?.checkout_url ||
  dodoData?.checkoutUrl ||
  dodoData?.url ||
  dodoData?.payment_link ||
  dodoData?.payment_link?.payment_link ||
  dodoData?.payment_link?.url ||
  dodoData?.payment_link?.checkout_url ||
  dodoData?.payment_url ||
  dodoData?.hosted_url ||
  dodoData?.data?.checkout_url ||
  dodoData?.data?.checkoutUrl ||
  dodoData?.data?.url ||
  dodoData?.data?.payment_link ||
  dodoData?.data?.payment_link?.payment_link ||
  dodoData?.data?.payment_link?.url ||
  dodoData?.data?.payment_link?.checkout_url ||
  dodoData?.data?.payment_url ||
  dodoData?.data?.hosted_url ||
  null
);

const normalizeEndpoint = (value) => value.trim().replace(/\/+$/, "").replace(/\/payments\/payments$/i, "/payments");
const toPaymentsEndpoint = (value) => (/\/payments$/i.test(value) ? value : `${value}/payments`);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const dodoApiKey = process.env.DODO_PAYMENTS_API_KEY || process.env.DODO_API_KEY;
    const dodoProductId = process.env.DODO_PRODUCT_ID_BASIC || process.env.DODO_PRODUCT_ID;

    if (!dodoApiKey) {
      return res.status(500).json({ error: "DODO_PAYMENTS_API_KEY is not set" });
    }
    if (!dodoProductId) {
      return res.status(500).json({ error: "DODO_PRODUCT_ID_BASIC is not set" });
    }

    const {
      itemName,
      quantity,
      successUrl,
      cancelUrl,
      customer,
    } = req.body || {};

    const resolvedSuccessUrl =
      typeof successUrl === "string" && successUrl.startsWith("http")
        ? successUrl
        : "https://aj-studioz-project-hub.vercel.app";

    const resolvedCancelUrl =
      typeof cancelUrl === "string" && cancelUrl.startsWith("http")
        ? cancelUrl
        : "https://aj-studioz-project-hub.vercel.app";

    const configuredBaseRaw = process.env.DODO_PAYMENTS_BASE_URL || process.env.DODO_API_BASE_URL || "";
    const configuredBase = configuredBaseRaw ? normalizeEndpoint(configuredBaseRaw) : "";
    const customEndpointRaw = process.env.DODO_CHECKOUT_ENDPOINT || "";
    const customEndpoint = customEndpointRaw ? normalizeEndpoint(customEndpointRaw) : "";

    const mode = String(process.env.DODO_PAYMENTS_ENVIRONMENT || "test_mode").trim();
    const defaultBase = mode === "live_mode" ? "https://live.dodopayments.com" : "https://test.dodopayments.com";

    const endpointCandidates = [
      customEndpoint,
      configuredBase ? toPaymentsEndpoint(configuredBase) : "",
      `${defaultBase}/payments`,
      "https://api.dodopayments.com/payments",
    ].filter((v) => typeof v === "string" && v.length > 0);

    const uniqueEndpoints = [...new Set(endpointCandidates)];

    const parsedQuantity = Number(quantity) || 1;

    const payload = {
      billing: {
        city: "Salem",
        country: "IN",
        state: "Tamil Nadu",
        street: "Sona College of Technology",
        zipcode: 636005,
      },
      payment_link: true,
      product_cart: [{ product_id: dodoProductId, quantity: parsedQuantity }],
      metadata: {
        item_name: itemName || "Hardware Component",
      },
      return_url: resolvedSuccessUrl,
      success_url: resolvedSuccessUrl,
      cancel_url: resolvedCancelUrl,
      ...(customer ? { customer } : {}),
      customer_email: customer?.email,
      product_id: dodoProductId,
      quantity: parsedQuantity,
      line_items: [{ product_id: dodoProductId, quantity: parsedQuantity }],
    };

    let lastError = "Failed to create Dodo checkout";

    for (const endpoint of uniqueEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${dodoApiKey}`,
            "x-api-key": dodoApiKey,
          },
          body: JSON.stringify(payload),
        });

        const rawText = await response.text();
        let dodoData = {};
        try {
          dodoData = rawText ? JSON.parse(rawText) : {};
        } catch {
          dodoData = { message: rawText || "Unexpected Dodo response" };
        }

        if (!response.ok) {
          lastError = dodoData?.message || dodoData?.error || `Dodo error ${response.status}`;
          if (response.status !== 404) {
            return res.status(response.status).json({ error: lastError });
          }
          continue;
        }

        const checkoutUrl = resolveCheckoutUrl(dodoData);
        if (!checkoutUrl || typeof checkoutUrl !== "string") {
          return res.status(502).json({
            error: "Dodo response missing checkout URL",
            details: {
              topLevelKeys: Object.keys(dodoData || {}),
              dataKeys: dodoData?.data && typeof dodoData.data === "object" ? Object.keys(dodoData.data) : [],
            },
          });
        }

        return res.status(200).json({ ...dodoData, url: checkoutUrl });
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
      }
    }

    return res.status(500).json({ error: lastError });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Checkout failed" });
  }
}
