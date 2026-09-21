/* ============================================================
   Upsell Page — seleção dos 3 itens + geração Pix
   ============================================================ */
(function () {
  'use strict';

  const MAX = 3;
  const items = document.querySelectorAll('.item-btn');
  const countEl = document.getElementById('countNow');
  const counterWrap = document.querySelector('.counter-value') || document.querySelector('.counter');
  const cta = document.getElementById('cta');
  const ctaLabel = cta.querySelector('.cta-label');

  const selected = new Set();

  function getSelectedItems() {
    return Array.from(selected).map(function(id) {
      const li = document.querySelector('.item[data-id="' + id + '"]');
      return {
        id: id,
        name: li ? (li.querySelector('.item-name')?.textContent || '') : '',
        category: li ? (li.querySelector('.item-cat')?.textContent || '') : ''
      };
    });
  }

  function updateUI() {
    countEl.textContent = String(selected.size);
    if (counterWrap) {
      counterWrap.classList.remove('pulse');
      void counterWrap.offsetWidth;
      counterWrap.classList.add('pulse');
    }

    if (selected.size === MAX) {
      cta.disabled = false;
      cta.classList.remove('cta-disabled');
      cta.classList.add('cta-enabled');
      ctaLabel.textContent = 'Gerar Pix com desconto';
    } else {
      cta.disabled = true;
      cta.classList.add('cta-disabled');
      cta.classList.remove('cta-enabled');
      ctaLabel.textContent = 'Selecione os 3 itens';
    }
  }

  items.forEach((btn) => {
    const id = btn.parentElement.dataset.id;
    btn.addEventListener('click', () => {
      if (selected.has(id)) {
        selected.delete(id);
        btn.classList.remove('is-selected');
        btn.setAttribute('aria-pressed', 'false');
      } else {
        if (selected.size >= MAX) return;
        selected.add(id);
        btn.classList.add('is-selected');
        btn.setAttribute('aria-pressed', 'true');
      }
      updateUI();
    });
  });

  cta.addEventListener('click', async () => {
    if (cta.disabled || selected.size !== MAX) return;

    const oldText = ctaLabel.textContent;
    cta.disabled = true;
    ctaLabel.textContent = 'Gerando Pix...';

    const utmData = (typeof window.getFFTrackingData === 'function') ? window.getFFTrackingData() : {};

    try {
      const response = await fetch('../../backend.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          selected_items: getSelectedItems(),
          nome: localStorage.getItem('ff_nome') || 'Cliente Free Fire',
          email: localStorage.getItem('ff_email') || 'cliente@exemplo.com',
          telefone: localStorage.getItem('ff_telefone') || null,
          cpf: '00000000000',
          utm_source: utmData.utm_source || null,
          utm_medium: utmData.utm_medium || null,
          utm_campaign: utmData.utm_campaign || null,
          utm_content: utmData.utm_content || null,
          utm_term: utmData.utm_term || null,
          src: utmData.src || null,
          sck: utmData.sck || null,
          fbclid: utmData.fbclid || null,
          fbc: utmData.fbc || null,
          fbp: utmData.fbp || null
        })
      });

      const data = await response.json();

      if (data.pix && data.pix.qrcode && data.id) {
        sessionStorage.setItem('skins_txid', data.id);
        sessionStorage.setItem('skins_pix_code', data.pix.qrcode);
        showPixModal(data.pix.qrcode, data.id);
        return;
      }

      console.error('Erro backend:', data);
      alert(data.error || 'Erro ao gerar Pix. Tente novamente.');
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar Pix. Verifique sua conexão.');
    } finally {
      cta.disabled = selected.size !== MAX;
      ctaLabel.textContent = oldText;
    }
  });

  updateUI();
})();


// ===== Modal PIX + confirmacao de pagamento (upsell 3) =====
var pixPollingInterval;

function buildPixModal() {
  var existing = document.getElementById('pix-modal');
  if (existing) return existing;
  var wrap = document.createElement('div');
  wrap.id = 'pix-modal';
  wrap.style.cssText = 'display:none;position:fixed;inset:0;z-index:99999;align-items:center;justify-content:center;background:rgba(0,0,0,.85);';
  wrap.innerHTML =
    '<div style="background:#fff;border-radius:12px;padding:24px;max-width:340px;width:90%;position:relative;text-align:center;font-family:sans-serif;">' +
      '<button id="pix-close" style="position:absolute;right:14px;top:10px;background:none;border:none;font-size:24px;cursor:pointer;color:#333;">&times;</button>' +
      '<h3 style="margin:0 0 12px;color:#a10904;">Pague com PIX</h3>' +
      '<img id="pix-qrcode-img" alt="QR Code PIX" style="width:200px;height:200px;margin:0 auto 16px;display:block;border:1px solid #eee;padding:8px;border-radius:8px;">' +
      '<div style="display:flex;gap:8px;margin-bottom:12px;">' +
        '<input type="text" id="pix-copy-text" readonly style="flex:1;padding:10px;border:1px solid #ddd;border-radius:6px;font-size:12px;color:#555;background:#f9f9f9;">' +
        '<button id="pix-copy-btn" style="background:#f00000;color:#fff;border:none;padding:0 16px;border-radius:6px;font-weight:bold;cursor:pointer;">Copiar</button>' +
      '</div>' +
      '<p style="font-size:13px;color:#666;margin:0;">Aguardando confirmacao do pagamento...</p>' +
    '</div>';
  document.body.appendChild(wrap);
  wrap.querySelector('#pix-close').addEventListener('click', closePixModal);
  wrap.querySelector('#pix-copy-btn').addEventListener('click', function () {
    var t = document.getElementById('pix-copy-text');
    t.select(); t.setSelectionRange(0, 99999);
    document.execCommand('copy');
    alert('Codigo PIX copiado com sucesso!');
  });
  return wrap;
}

function closePixModal() {
  if (pixPollingInterval) clearInterval(pixPollingInterval);
  var m = document.getElementById('pix-modal');
  if (m) m.style.display = 'none';
}

function showPixModal(pixCode, transactionId) {
  var modal = buildPixModal();
  document.getElementById('pix-qrcode-img').src =
    'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodeURIComponent(pixCode);
  document.getElementById('pix-copy-text').value = pixCode;
  modal.style.display = 'flex';
  pixPollingInterval = setInterval(function () {
    fetch('../../check_status.php?id=' + encodeURIComponent(transactionId), { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var status = String(data.status || '').toLowerCase();
        if (data.paid === true || status === 'paid' || status === 'approved' || status === 'completed') {
          clearInterval(pixPollingInterval);
          window.location.href = '/roleta/';
        }
      })
      .catch(function (e) { console.error(e); });
  }, 3000);
}
window.showPixModal = showPixModal;
