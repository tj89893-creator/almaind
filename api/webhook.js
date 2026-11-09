const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  const id = req.body?.data?.id || req.query?.["data.id"] || req.query?.id;
  if (!id) return res.status(200).end();

  const r = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  });
  const pago = await r.json();
  if (pago.status !== "approved") return res.status(200).end();

  const m = pago.metadata || {};
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    subject: `Nuevo pedido pagado - ${m.nombre || pago.payer?.email || ""}`,
    text:
`Pedido pagado en Mercado Pago (ID ${pago.id})

Productos: ${m.pedido}
Total: $${m.total}

Comprador: ${pago.payer?.email || m.email}
Provincia: ${m.provincia}
Localidad: ${m.localidad}
Dirección: ${m.direccion}
Código postal: ${m.codigo_postal}`,
  });

  res.status(200).end();
};
