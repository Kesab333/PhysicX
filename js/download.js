(function () {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-download-latest]').forEach((button) => {
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        const auth = window.APP_AUTH;
        if (!auth.getToken()) {
          window.location.href = window.APP_CONTEXT.route('login.html');
          return;
        }
        let message = document.getElementById('download-message');
        if (!message) {
          message = document.createElement('p');
          message.id = 'download-message';
          message.setAttribute('role', 'status');
        }
        button.parentElement.appendChild(message);
        if (button.dataset.busy === 'true') return;
        button.dataset.busy = 'true';
        button.setAttribute('aria-disabled', 'true');
        message.textContent = 'Checking the latest release...';
        try {
          const result = await auth.apiRequest('/download/latest', { token: auth.getToken() });
          if (!result.success) throw new Error(result.message);
          const release = result.data;
          const url = new URL(release.download_url);
          if (!['https:', 'http:'].includes(url.protocol)) throw new Error('The download URL is not valid. Please contact support.');
          message.textContent = `Downloading PhysicX ${release.version}. SHA-256: ${release.checksum}`;
          window.location.assign(url.href);
        } catch (error) {
          message.textContent = error.message || 'The download is currently unavailable.';
        } finally {
          delete button.dataset.busy;
          button.removeAttribute('aria-disabled');
        }
      });
    });
  });
})();
