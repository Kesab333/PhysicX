(function () {
  const app = window.APP_CONTEXT;
  const auth = window.APP_AUTH;
  const orderKey = `${app.id}_last_order_id`;

  function setMessage(target, type, message) {
    auth.setMessage(target, type, message);
  }

  function setBusyState(plan, busy) {
    document.querySelectorAll('[data-buy-plan]').forEach((button) => {
      button.disabled = busy;
      if (button.getAttribute('data-buy-plan') === plan) {
        button.dataset.originalText = button.dataset.originalText || button.textContent;
        button.textContent = busy ? 'Preparing checkout...' : button.dataset.originalText;
      }
    });
  }

  async function buyPlan(plan) {
    const target = document.getElementById('pricing-message');
    if (!auth.getToken()) {
      window.location.href = app.route('login.html');
      return;
    }
    try {
      setBusyState(plan, true);
      setMessage(target, 'info', 'Creating your secure Razorpay order...');
      const result = await auth.apiRequest('/create-order', {
        method: 'POST', token: auth.getToken(), body: { plan }
      });
      if (!result.success) throw new Error(result.message);
      const order = result.data;
      if (!order.key_id || !order.order_id) throw new Error('Checkout configuration is incomplete. Please contact support.');
      if (typeof window.Razorpay !== 'function') throw new Error('Razorpay Checkout could not load. Please try again.');
      const checkout = new window.Razorpay({
        key: order.key_id,
        order_id: order.order_id,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: app.name,
        description: `${plan === 'yearly' ? 'Yearly' : 'Monthly'} software license`,
        prefill: { email: auth.getStoredEmail() },
        theme: { color: window.CONFIG.BRAND_COLOR },
        handler: function (response) {
          if (response.razorpay_order_id !== order.order_id) {
            setMessage(target, 'error', 'The checkout response did not match this order. Please contact support.');
            return;
          }
          sessionStorage.setItem(orderKey, order.order_id);
          window.location.href = app.route('success.html');
        },
        modal: { ondismiss: () => setMessage(target, 'info', 'Checkout closed. No payment has been confirmed here.') }
      });
      checkout.on('payment.failed', (event) => {
        setMessage(target, 'error', event?.error?.description || 'Payment could not be completed.');
      });
      checkout.open();
      setMessage(target, 'info', 'Complete payment in the checkout window.');
    } catch (error) {
      setMessage(target, 'error', error.message || 'Unable to start checkout.');
    } finally {
      setBusyState(plan, false);
    }
  }

  async function pollPayment(orderId, options = {}) {
    const { attempts = 12, delayMs = 2500 } = options;
    for (let index = 0; index < attempts; index += 1) {
      const result = await auth.apiRequest(`/payments/${encodeURIComponent(orderId)}`, { token: auth.getToken() });
      if (result.success) {
        const status = String(result.data?.status || '').toLowerCase();
        if (['captured', 'paid', 'success', 'successful', 'completed'].includes(status)) return 'confirmed';
        if (['failed', 'refunded', 'cancelled'].includes(status)) return status;
      } else if ([401, 403, 404].includes(result.status)) {
        return result.status === 401 ? 'unauthorized' : 'unavailable';
      }
      if (index < attempts - 1) await new Promise((resolve) => window.setTimeout(resolve, delayMs));
    }
    return 'pending';
  }

  async function runSuccessFlow() {
    const message = document.getElementById('success-message');
    const detail = document.getElementById('success-detail');
    if (!message || !detail) return;
    const orderId = sessionStorage.getItem(orderKey);
    if (!auth.getToken() || !orderId) {
      setMessage(message, 'warning', 'No payment is available to verify in this session.');
      detail.textContent = 'Sign in and check your dashboard for your current license. This page does not confirm a payment by itself.';
      return;
    }
    setMessage(message, 'info', 'Checking payment confirmation...');
    detail.textContent = `Order ${orderId}. Waiting for the payment provider to confirm this order with PhysicX.`;
    const status = await pollPayment(orderId);
    if (status === 'confirmed') {
      setMessage(message, 'success', 'Payment confirmed by the server.');
      detail.textContent = 'Your payment has been recorded. Open the dashboard to view your updated license.';
      document.querySelector('[data-payment-badge]')?.replaceChildren(document.createTextNode('Payment confirmed'));
    } else if (status === 'pending') {
      setMessage(message, 'warning', 'Payment confirmation is still pending.');
      detail.textContent = `We could not yet confirm order ${orderId}. Refresh this page to check again, or contact support with this order ID. Avoid paying again while confirmation is pending.`;
    } else {
      setMessage(message, 'error', `Payment could not be confirmed (${status}).`);
      detail.textContent = 'Sign in to review your license or contact support with your order ID.';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const email = document.getElementById('pricing-email');
    if (email) email.textContent = auth.getStoredEmail() || 'Not signed in';
    if (document.body.dataset.page === 'payment-success') void runSuccessFlow();
  });
  window.buyPlan = buyPlan;
  window.APP_PAYMENTS = { buyPlan, pollPayment };
  window.PhysicXPayments = window.APP_PAYMENTS;
})();
