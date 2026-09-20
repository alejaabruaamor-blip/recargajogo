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
      const response = await fetch('backend.php', {
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
        window.location.href = 'pix.html?id=' + encodeURIComponent(data.id);
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
