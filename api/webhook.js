// Recebe os avisos de pagamento (postback) da FreePay Brasil
// POST /api/webhook

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks).toString('utf8');
    console.log('freepay webhook:', raw.slice(0, 2000));
  } catch (e) {
    console.log('freepay webhook error:', String(e && e.message));
  }
  return res.status(200).json({ received: true });
};
