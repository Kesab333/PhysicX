(function () {
  const contexts = {
    physicx: {
      id: 'physicx',
      name: 'PhysicX',
      science: 'Physics',
      base: '/PhysicX',
      accent: '#2563eb',
      brandHtml: 'Physic<span>X</span>',
      initials: 'PX'
    },
    chemistry: {
      id: 'chemistry',
      name: 'ChemistrY',
      science: 'Chemistry',
      base: '/ChemistrY',
      accent: '#059669',
      brandHtml: 'Chemistr<span>Y</span>',
      initials: 'CY'
    },
    mathematicx: {
      id: 'mathematicx',
      name: 'MathematicX',
      science: 'Mathematics',
      base: '/MathematicX',
      accent: '#7c3aed',
      brandHtml: 'Mathematic<span>X</span>',
      initials: 'MX'
    }
  };

  function detectContext() {
    const path = String(window.location.pathname || '').toLowerCase();
    if (path.includes('mathematicx')) return contexts.mathematicx;
    if (path.includes('chemistry')) return contexts.chemistry;
    return contexts.physicx;
  }

  const current = detectContext();
  const nested = /\/(about|contacts|docs|gallery)\//.test(String(window.location.pathname || '').toLowerCase());
  const relativeRoot = nested ? '../' : '';

  function route(path) {
    const normalized = String(path || '').replace(/^\/+/, '');
    return normalized ? `${current.base}/${normalized}` : `${current.base}/`;
  }

  const appContext = Object.freeze({
    ...current,
    relativeRoot,
    logoPath: `${relativeRoot}assets/icon/logo.png`,
    route,
    asset(path) {
      return `${relativeRoot}${String(path || '').replace(/^\/+/, '')}`;
    }
  });

  const CONFIG = Object.freeze({
    API_URL: 'https://physicx-api.onrender.com',
    APP_NAME: appContext.name,
    APP_BASE: appContext.base,
    STORAGE_PREFIX: appContext.id,
    RAZORPAY_KEY_ID: 'rzp_test_dummy_key',
    SUPPORT_EMAIL: 'support@physicx.in',
    OTP_EXPIRY_MINUTES: 10,
    HEARTBEAT_INTERVAL: 86400,
    OFFLINE_GRACE_HOURS: 168,
    BRAND_COLOR: appContext.accent
  });

  window.APP_CONTEXT = appContext;
  window.CONFIG = CONFIG;
  window.AppRoute = route;
  window[`${appContext.name}Route`] = route;
})();
