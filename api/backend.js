// Gera cobranca PIX na FreePay Brasil
// POST /backend.php  (rewrite -> /api/backend)

const API_URL = 'https://api.freepaybrasil.com/v1/payment-transaction/create';

function authHeader() {
  const pub = process.env.FREEPAY_PUBLIC_KEY || '';
  const sec = process.env.FREEPAY_SECRET_KEY || '';
  return 'Basic ' + Buffer.from(pub + ':' + sec).toString('base64');
}

function onlyDigits(v) {
  return String(v || '').replace(/\D/g, '');
}

function parseCents(value) {
  const n = parseFloat(String(value || '0').replace(/\./g, '').replace(',', '.'));
  return Math.round((isNaN(n) ? 0 : n) * 100);
}

const PANEL_URL = 'https://project--7c03b59b-e25a-4e4d-a993-28fd75044ba6.lovable.app/api/public/ingest';
const PANEL_TOKEN = '8082d4bbd11dea94c7ea0815844c30f8137c619a';

function utmsFrom(req, body) {
  const out = {
    utm_source: body.utm_source || '',
    utm_medium: body.utm_medium || '',
    utm_campaign: body.utm_campaign || '',
    utm_content: body.utm_content || '',
    utm_term: body.utm_term || '',
  };
  try {
    const ref = req.headers.referer || req.headers.referrer || '';
    if (ref) {
      const q = new URL(ref).searchParams;
      Object.keys(out).forEach(function (k) {
        if (!out[k] && q.get(k)) out[k] = q.get(k);
      });
    }
  } catch (e) {}
  return out;
}

function stageFrom(req, body, amountCents) {
  if (body.stage) return String(body.stage);
  const ref = String(req.headers.referer || '');
  if (ref.indexOf('/rec/up1') !== -1) return 'up1';
  if (cmUlFake) return 'checkout';
  return 'checkout';
}
