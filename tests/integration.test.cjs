const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const source = (name) => readFileSync(path.join(__dirname, '..', 'js', `${name}.js`), 'utf8');
function storage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) };
}
function browser(fetch = async () => { throw new Error('offline'); }) {
  const context = {
    localStorage: storage(), sessionStorage: storage(), AbortController,
    document: { addEventListener() {}, querySelectorAll: () => [], getElementById: () => null },
    fetch, setTimeout, clearTimeout,
    location: { pathname: '/', href: 'https://example.test/' }
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(source('config'), context);
  vm.runInContext(source('auth'), context);
  return context;
}

test('website and application share session keys with opt-in persistent login', () => {
  const context = browser();
  context.APP_AUTH.persistSession('access-token', 'Person@Example.Test', 3600);
  assert.equal(context.sessionStorage.getItem('physicx_jwt'), 'access-token');
  assert.equal(context.localStorage.getItem('physicx_jwt'), null);
  assert.equal(context.APP_AUTH.getStoredEmail(), 'person@example.test');
  context.APP_AUTH.persistSession('remember-token', 'Person@Example.Test', 3600, true);
  assert.equal(context.sessionStorage.getItem('physicx_jwt'), null);
  assert.equal(context.APP_AUTH.getToken(), 'remember-token');
  context.APP_AUTH.clearSession();
  assert.equal(context.APP_AUTH.getToken(), '');
  assert.equal(context.localStorage.getItem('physicx_token_expires_at'), null);
});

test('requests use the same-origin API and preserve flat response bodies', async () => {
  let request;
  const context = browser(async (url, options) => {
    request = { url, options };
    return { ok: true, status: 200, headers: { get: () => 'application/json' }, json: async () => ({ email: 'user@example.test' }) };
  });
  const result = await context.APP_AUTH.apiRequest('/me', { token: 'test-token' });
  assert.equal(request.url, '/api/me');
  assert.equal(request.options.headers.Authorization, 'Bearer test-token');
  assert.equal(result.data.email, 'user@example.test');
  assert.equal(context.CONFIG.APP_URL, '/app/');
  assert.equal(context.APP_CONTEXT.route('login.html'), '/login.html');
});

test('API validation errors and unavailable servers never return success', async () => {
  const context = browser(async () => ({
    ok: false, status: 422, headers: { get: () => 'application/json' },
    json: async () => ({ detail: [{ msg: 'Password is too short' }] })
  }));
  assert.equal((await context.APP_AUTH.apiRequest('/register')).message, 'Password is too short');
  const offline = browser();
  const result = await offline.APP_AUTH.apiRequest('/login');
  assert.equal(result.success, false);
  assert.equal(result.status, 0);
});

test('payment confirmation checks the current server-owned order', async () => {
  const context = browser();
  const paths = [];
  context.APP_AUTH.apiRequest = async (route) => {
    paths.push(route);
    return { success: true, data: { status: 'pending' } };
  };
  vm.runInContext(source('payment'), context);
  assert.equal(await context.APP_PAYMENTS.pollPayment('order_123', { attempts: 1 }), 'pending');
  assert.deepEqual(paths, ['/payments/order_123']);
  context.APP_AUTH.apiRequest = async () => ({ success: true, data: { status: 'successful' } });
  assert.equal(await context.APP_PAYMENTS.pollPayment('order_123', { attempts: 1 }), 'confirmed');
  context.APP_AUTH.apiRequest = async () => ({ success: false, status: 404 });
  assert.equal(await context.APP_PAYMENTS.pollPayment('someone-elses-order', { attempts: 1 }), 'unavailable');
});
