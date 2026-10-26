(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const submit = document.getElementById('btn-submit');
  const success = document.getElementById('form-success');
  const error = document.getElementById('form-error');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    success.classList.remove('visible');
    error.classList.remove('visible');
    if (!form.reportValidity()) return;
    submit.disabled = true;
    submit.classList.add('loading');
    submit.setAttribute('aria-busy', 'true');
    try {
      const values = new FormData(form);
      const result = await window.APP_AUTH.apiRequest('/contact', {
        method: 'POST',
        body: {
          name: String(values.get('name') || '').trim(),
          email: String(values.get('email') || '').trim(),
          subject: String(values.get('subject') || ''),
          message: String(values.get('message') || '').trim()
        }
      });
      if (!result.success) throw new Error(result.message);
      success.querySelector('span').textContent = result.message;
      success.classList.add('visible');
      form.reset();
    } catch (problem) {
      error.querySelector('span').textContent = problem.message || 'Unable to send your message. Please try again.';
      error.classList.add('visible');
    } finally {
      submit.disabled = false;
      submit.classList.remove('loading');
      submit.setAttribute('aria-busy', 'false');
    }
  });
})();
