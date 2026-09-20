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
        var val = params.get(key);
        if (val) current[key] = val;
      });

      var fbc = readCookie('_fbc');
      var fbp = readCookie('_fbp');
      if (fbc) current.fbc = fbc;
      if (fbp) current.fbp = fbp;

      localStorage.setItem('ff_utm_data', JSON.stringify(current));
    } catch (e) {}
  }

  window.getFFTrackingData = function () {
    saveTracking();
    try { return JSON.parse(localStorage.getItem('ff_utm_data') || '{}') || {}; } catch (e) { return {}; }
  };

  saveTracking();
})();
