(function () {
  // Public overrides may be defined before this script; keep secrets on the server.
  const settings = window.PHYSICX_CONFIG || {};
  const base = String(settings.WEBSITE_BASE || '').replace(/\/+$/, '');
  const route = (path) => `${base}/${String(path || '').replace(/^\/+/, '')}`;
  const appContext = Object.freeze({
    id: 'physicx', name: 'PhysicX', science: 'Physics', base,
    accent: '#2563eb', brandHtml: 'Physic<span>X</span>', initials: 'PX',
    relativeRoot: `${base}/`, logoPath: route('assets/icon/logo.png'), route,
    asset: route
  });
  window.APP_CONTEXT = appContext;
  window.CONFIG = Object.freeze({
    API_URL: String(settings.API_URL || '/api').replace(/\/+$/, ''),
    APP_URL: settings.APP_URL || '/app/',
    APP_NAME: appContext.name, APP_BASE: base, STORAGE_PREFIX: appContext.id,
    SUPPORT_EMAIL: settings.SUPPORT_EMAIL || 'physicx.support@gmail.com',
    OTP_EXPIRY_MINUTES: 10, BRAND_COLOR: appContext.accent
  });
  window.AppRoute = route;
  window.PhysicXRoute = route;
})();
