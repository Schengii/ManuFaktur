(function () {
  try {
    var t = localStorage.getItem('manufaktur_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', t);
    if (t === 'dark') document.documentElement.classList.add('dark-mode');
    var l = localStorage.getItem('manufaktur_lang') || 'de';
    document.documentElement.setAttribute('lang', l);
  } catch (e) { }
})();
