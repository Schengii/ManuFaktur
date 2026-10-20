(function () {
  try {
    var t = localStorage.getItem('manufaktur_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', t);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m && t === 'dark') m.setAttribute('content', '#0a101e');
    var l = localStorage.getItem('manufaktur_lang') || 'de';
    document.documentElement.setAttribute('lang', l);
  } catch (e) { }
})();
