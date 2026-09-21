// Saves studio leads to the same Firestore collection guralea.com uses (pilates_leads),
// so they keep appearing in the 08:08 daily report.
document.addEventListener('DOMContentLoaded', function () {
  if (typeof firebase === 'undefined') return;
  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: 'AIzaSyDpIyfmtt5rSJ10tkXrqURup6iE4utfTig',
      authDomain: 'hagil-lo-hasipor.firebaseapp.com',
      projectId: 'hagil-lo-hasipor',
      storageBucket: 'hagil-lo-hasipor.firebasestorage.app',
      messagingSenderId: '617409966023',
      appId: '1:617409966023:web:5f9785bfbf8059e21df3e2'
    });
  }
  var db = firebase.firestore();

  // Copy of each lead to Leah's Google Sheet "לידים 2026 – סטודיו לאה גורא" (tab פייסבוק, מקור = where the visit came from, see site.js),
  // through the Apps Script web app kept in the Hagil-lo-hasipor repo: .claude/skills/leads-sheet/apps-script-webhook.gs.
  // Sent only after the Firestore save succeeded; fire-and-forget - never throws, never waits.
  // Web app deployed 14.9.2026 13:57 (version 1, runs as guralea@gmail.com, access: anyone).
  var LEADS_SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbxgFHRnAYFq68nK-5l0nOi46WbUiCn0L2QUjaV_U4Z6oZ1w45odyjPzmt2u0dGmRytE/exec';
  function sendLeadToSheet(lead) {
    try {
      if (LEADS_SHEET_WEBAPP_URL.indexOf('https://script.google.com/macros/s/') !== 0) return;
      fetch(LEADS_SHEET_WEBAPP_URL, {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ form: 'pilates', id: lead.id || '', name: lead.name, phone: lead.phone, source: leadSource() })
      }).catch(function () {});
    } catch (e) {}
  }

  // Saved by site.js on the visit's first page; 'אתר - ישיר' if storage is blocked.
  function leadSource() {
    try { return sessionStorage.getItem('lead_source') || 'אתר - ישיר'; } catch (e) { return 'אתר - ישיר'; }
  }

  function utm() {
    var p = new URLSearchParams(window.location.search);
    return { utmSource: p.get('utm_source'), utmMedium: p.get('utm_medium'), utmCampaign: p.get('utm_campaign') };
  }

  document.querySelectorAll('[data-lead-form]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    form.addEventListener('input', function () {
      if (typeof gtag === 'function') gtag('event', 'form_start', { form_name: 'pilates_lead' });
    }, { once: true });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      status.textContent = 'שולח...';
      status.classList.remove('error');
      var u = utm();
      db.collection('pilates_leads').add({
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        utmSource: u.utmSource,
        utmMedium: u.utmMedium,
        utmCampaign: u.utmCampaign,
        site: 'guraleapilates.com',
        page: window.location.pathname,
        status: 'new',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function (ref) {
        sendLeadToSheet({ id: ref && ref.id, name: form.name.value.trim(), phone: form.phone.value.trim() });
        status.textContent = 'הפרטים נשלחו, תודה.';
        if (typeof gtag === 'function') gtag('event', 'generate_lead', { form_name: 'pilates_lead', page_path: window.location.pathname });
        form.reset();
      }).catch(function (err) {
        console.error(err);
        status.textContent = 'משהו השתבש בשליחת הטופס. נסה/י שוב.';
        status.classList.add('error');
      }).finally(function () {
        btn.disabled = false;
      });
    });
  });
});
