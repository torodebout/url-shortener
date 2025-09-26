const form = document.getElementById('shorten-form');
const longUrlInput = document.getElementById('longUrl');
const result = document.getElementById('result');
const shortLink = document.getElementById('shortLink');
const copyBtn = document.getElementById('copyBtn');
const submitBtn = document.getElementById('submitBtn');
const btnLabel = document.querySelector('.btn-label');
const spinner = document.querySelector('.spinner');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const longUrl = longUrlInput.value.trim();
  if (!longUrl) return;
  try {
    submitBtn.disabled = true;
    spinner.style.display = 'inline-block';
    btnLabel.textContent = 'Please wait…';
    const res = await fetch('/api/urls/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ longUrl }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(`Failed to shorten${data?.error ? ' : ' + data.error : ''}`);
      return;
    }
    const data = await res.json();
    shortLink.href = data.shortUrl;
    shortLink.textContent = data.shortUrl;
    result.hidden = false;
  } catch (err) {
    console.error(err);
    alert('Unexpected error');
  } finally {
    submitBtn.disabled = false;
    spinner.style.display = 'none';
    btnLabel.textContent = 'Shorten';
  }
});

copyBtn.addEventListener('click', async () => {
  const text = shortLink.textContent;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => (copyBtn.textContent = 'Copy'), 1200);
  } catch {}
});
