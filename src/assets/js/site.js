// Where this visit came from, saved once per visit (on the first page) so a lead left on a later page
// still carries it. Written to column D "מקור" of the leads sheet (21.9.2026). Values must match
// SITE_SOURCES in Hagil-lo-hasipor/.claude/skills/leads-sheet/apps-script-webhook.gs.
(function () {
  try {
    if (sessionStorage.getItem('lead_source')) return;
    var p = new URLSearchParams(window.location.search);
    var s = (p.get('utm_source') || '').toLowerCase();
    var m = (p.get('utm_medium') || '').toLowerCase();
    var h = '';
    try { h = new URL(document.referrer).hostname.toLowerCase(); } catch (e) {}
    var paid = /paid|cpc|ads?$/.test(m);
    var net = /facebook|^fb/.test(s) || /(^|\.)facebook\.com$|^fb\.me$/.test(h) ? 'פייסבוק'
      : /instagram|^ig/.test(s) || /(^|\.)instagram\.com$/.test(h) ? 'אינסטגרם'
      : /tiktok/.test(s) || /(^|\.)tiktok\.com$/.test(h) ? 'טיקטוק' : '';
    var src = net ? (paid ? 'מודעה - ' : 'פוסט - ') + net
      : /google/.test(s) || /(^|\.)google\./.test(h) ? 'גוגל'
      : /(^|\.)guralea\.com$/.test(h) ? 'אתר הקהילה'
      : 'אתר - ישיר';
    sessionStorage.setItem('lead_source', src);
  } catch (e) {}
})();

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
