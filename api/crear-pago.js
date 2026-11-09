module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { items, envio, siteUrl } = req.body || {};
  if (!items || !items.length) {
    return res.status(400).json({ error: "El carrito está vacío" });
  }

  const r = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      items: items.map(i => ({
        title: `${i.name} (Talle ${i.size})`,
        quantity: Number(i.qty),
        unit_price: Number(i.price),
        currency_id: "ARS",
      })),
      payer: { name: envio?.nombre || "Cliente" },
      metadata: envio,
      back_urls: { success: siteUrl, failure: siteUrl, pending: siteUrl },
      auto_return: "approved",
    }),
  });

  const data = await r.json();
  if (!r.ok) {
    console.error("Mercado Pago:", data);
    return res.status(500).json({ error: "No se pudo crear el pago" });
  }
  res.status(200).json({ url: data.init_point });
};
