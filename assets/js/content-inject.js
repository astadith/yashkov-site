// content-inject.js — подставляет значения из content-data.json в элементы [data-editable]
(async function () {
  try {
    const res = await fetch('content-data.json', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    if (!data || typeof data !== 'object') return;
    document.querySelectorAll('[data-editable]').forEach(function (el) {
      var key = el.getAttribute('data-editable');
      if (data[key] != null && data[key] !== '') {
        el.textContent = String(data[key]);
      }
    });
  } catch (e) { /* молча игнорируем */ }
})();
