export default {
  async email(message, env, ctx) {
    const forwardTo = env.FORWARD_TO_EMAIL;
    const webhookUrl = env.INQUIRY_WEBHOOK_URL;
    const webhookSecret = env.INQUIRY_WEBHOOK_SECRET;

    if (!forwardTo || !webhookUrl || !webhookSecret) {
      message.setReject("Inbound email worker is not fully configured.");
      return;
    }

    const rawBase64 = arrayBufferToBase64(await new Response(message.raw).arrayBuffer());

    ctx.waitUntil(
      fetch(webhookUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-inquiry-webhook-secret": webhookSecret,
          "x-inquiry-envelope-from": message.from,
          "x-inquiry-envelope-to": message.to,
        },
        body: JSON.stringify({
          provider: "cloudflare-email-routing",
          from: message.from,
          to: message.to,
          subject: message.headers.get("subject") || null,
          messageId: message.headers.get("message-id") || null,
          rawBase64,
        }),
      }).then(async (response) => {
        if (!response.ok) {
          const text = await response.text().catch(() => "");
          throw new Error(`Webhook failed: ${response.status} ${text}`.trim());
        }
      })
    );

    await message.forward(forwardTo, new Headers({
      "X-DirectStay-Inbound-Route": "cloudflare-email-worker",
    }));
  },
};

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}
