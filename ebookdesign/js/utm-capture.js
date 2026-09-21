(function () {
  var TRACKING_KEYS = ['utm_source','utm_campaign','utm_medium','utm_content','utm_term','src','sck','fbclid','fbc','fbp'];

  function readCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()\[\]\\/+^]/g, '\\$&') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function saveTracking() {
    try {
      var params = new URLSearchParams(window.location.search);
      var current = {};
      try { current = JSON.parse(localStorage.getItem('ff_utm_data') || '{}') || {}; } catch (e) { current = {}; }

      TRACKING_KEYS.forEach(function (key) {
        var value = params.get(key);
        if (value) current[key] = value;
      });

      var fbp = readCookie('_fbp');
      var fbc = readCookie('_fbc');
      if (fbp) current.fbp = fbp;
      if (fbc) current.fbc = fbc;
      if (!current.fbc && current.fbclid) {
        current.fbc = 'fb.1.' + Math.floor(Date.now() / 1000) + '.' + current.fbclid;
      }

      localStorage.setItem('ff_utm_data', JSON.stringify(current));
      localStorage.setItem('ff_fb_cookies', JSON.stringify({ fbc: current.fbc || null, fbp: current.fbp || null }));
    } catch (e) {
      console.warn('UTM capture error:', e);
    }
  }

  window.getFFTrackingData = function () {
    saveTracking();
    try { return JSON.parse(localStorage.getItem('ff_utm_data') || '{}') || {}; } catch (e) { return {}; }
  };

  saveTracking();
})();
