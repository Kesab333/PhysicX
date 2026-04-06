(function () {
  const app = window.APP_CONTEXT || { name: 'PhysicX', route: (path) => `/PhysicX/${String(path || '').replace(/^\/+/, '')}` };
  const route = app.route;

  function sanitizeOtp(value) {
    return String(value || '').replace(/\D/g, '').slice(0, 6);
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!window.APP_AUTH) return;

    window.APP_AUTH.hydratePendingEmail();

    const form = document.getElementById('verify-otp-form');
    const message = document.getElementById('verify-otp-message');
    if (!form) return;

    const otpInput = form.querySelector("input[name='otpCode']");
    if (otpInput) {
      otpInput.addEventListener('input', () => {
        otpInput.value = sanitizeOtp(otpInput.value);
      });
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = String(form.email.value || window.APP_AUTH.getPendingEmail() || '').trim().toLowerCase();
      const otpCode = sanitizeOtp(form.otpCode.value);

      if (!email) {
        window.APP_AUTH.setMessage(message, 'error', 'We could not find the account email. Enter it and try again.');
        return;
      }

      if (otpCode.length !== 6) {
        window.APP_AUTH.setMessage(message, 'error', 'Enter the full 6-digit verification code.');
        return;
      }

      const submit = form.querySelector("button[type='submit']");
      submit.disabled = true;
      submit.dataset.originalText = submit.dataset.originalText || submit.textContent;
      submit.textContent = 'Verifying...';

      const result = await window.APP_AUTH.apiRequest('/verify-otp', {
        method: 'POST',
        body: {
          email,
          otp_code: otpCode
        }
      });

      submit.disabled = false;
      submit.textContent = submit.dataset.originalText;

      if (!result.success) {
        window.APP_AUTH.setMessage(message, 'error', result.message);
        return;
      }

      window.APP_AUTH.clearPendingEmail();
      window.APP_AUTH.setMessage(message, 'success', result.message);
      window.setTimeout(() => {
        window.location.href = route('login.html');
      }, 900);
    });
  });
})();
