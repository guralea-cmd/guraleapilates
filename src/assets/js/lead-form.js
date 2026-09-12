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

  function utm() {
    var p = new URLSearchParams(window.location.search);
    return { utmSource: p.get('utm_source'), utmMedium: p.get('utm_medium'), utmCampaign: p.get('utm_campaign') };
  }

  document.querySelectorAll('[data-lead-form]').forEach(function (form) {
    var status = form.querySelector('.form-status');
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
        callbackTime: form.callbackTime.value,
        utmSource: u.utmSource,
        utmMedium: u.utmMedium,
        utmCampaign: u.utmCampaign,
        site: 'guraleapilates.com',
        page: window.location.pathname,
        status: 'new',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function () {
        status.textContent = 'הפרטים נשלחו, תודה.';
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
