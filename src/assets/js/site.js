document.addEventListener('DOMContentLoaded', function () {
  // GA4: count WhatsApp clicks (floating button, hero phone, contact page)
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (typeof gtag === 'function') gtag('event', 'whatsapp_click', { page_path: window.location.pathname });
    });
  });
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
});
