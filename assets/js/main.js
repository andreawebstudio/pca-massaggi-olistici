/* PCA Massaggi Olistici — interazioni essenziali */
(function () {
  'use strict';

  var WA_NUMBER = '393926649905';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Anno nel footer ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());

  /* ---------- Header: ombra allo scroll ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('main-nav');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    nav.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 1280px)').addEventListener('change', function (mq) { if (mq.matches) setMenu(false); });

  /* ---------- Voce di menu attiva ---------- */
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]:not(.btn)'));
  var sectionIds = ['home', 'chi-siamo', 'per-chi', 'approccio', 'servizi', 'come-funziona', 'dove-siamo', 'faq', 'contatti'];
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var target = '#' + en.target.id;
        navLinks.forEach(function (a) {
          var on = a.getAttribute('href') === target;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sectionIds.forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Come funziona: percorso che si illumina allo scroll ---------- */
  var journey = document.querySelector('.journey-wrap');
  if (journey) {
    var steps = Array.prototype.slice.call(journey.querySelectorAll('.journey-step'));
    var ticking = false;
    var updateJourney = function () {
      ticking = false;
      var r = journey.getBoundingClientRect();
      var vh = window.innerHeight;
      // 0 quando il percorso entra al 80% dello schermo, 1 quando la sua fine arriva al 60%
      var start = vh * 0.8, end = vh * 0.6;
      var p = (start - r.top) / ((r.height + start - end) || 1);
      p = Math.max(0, Math.min(1, p));
      journey.style.setProperty('--progress', p.toFixed(3));
      steps.forEach(function (s, i) {
        var threshold = steps.length > 1 ? i / (steps.length - 1) : 0;
        s.classList.toggle('is-active', p >= threshold - 0.02);
      });
    };
    if (reduceMotion) {
      journey.style.setProperty('--progress', '1');
      steps.forEach(function (s) { s.classList.add('is-active'); });
    } else {
      var onJourneyScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(updateJourney); } };
      window.addEventListener('scroll', onJourneyScroll, { passive: true });
      window.addEventListener('resize', onJourneyScroll);
      updateJourney();
    }
  }

  /* ---------- Fade-in allo scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el, i) {
      // leggero sfalsamento tra elementi fratelli (es. card)
      var siblings = el.parentElement ? el.parentElement.querySelectorAll(':scope > .reveal') : [];
      var idx = Array.prototype.indexOf.call(siblings, el);
      if (idx > 0) el.style.transitionDelay = Math.min(idx, 5) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item button').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (open) {
        panel.classList.remove('is-open');
        var done = function () { if (btn.getAttribute('aria-expanded') === 'false') panel.hidden = true; };
        if (reduceMotion) done(); else setTimeout(done, 400);
      } else {
        panel.hidden = false;
        // forza il reflow per permettere la transizione
        void panel.offsetHeight;
        panel.classList.add('is-open');
      }
    });
  });

  /* ---------- Modulo contatti ---------- */
  var form = document.getElementById('contact-form');
  if (!form) return;
  var endpoint = (form.getAttribute('data-endpoint') || '').trim();
  var statusEl = document.getElementById('form-status');
  var helpEl = document.getElementById('form-help');
  var submitBtn = form.querySelector('button[type="submit"]');

  helpEl.textContent = endpoint
    ? 'Ti risponderò il prima possibile.'
    : 'La richiesta si aprirà già compilata su WhatsApp, pronta da inviare.';

  var rules = {
    nome: function (v) { return v.trim().length >= 2 ? '' : 'Inserisci il tuo nome.'; },
    email: function (v) {
      if (!v.trim()) return 'Inserisci il tuo indirizzo email.';
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Controlla l\'indirizzo email: sembra non essere corretto.';
    },
    telefono: function (v) { return !v.trim() || /^[+()\d\s.-]{6,20}$/.test(v.trim()) ? '' : 'Inserisci un numero di telefono valido oppure lascia il campo vuoto.'; },
    messaggio: function (v) { return v.trim().length >= 10 ? '' : 'Scrivi un breve messaggio (almeno 10 caratteri).'; },
    privacy: function (_, el) { return el.checked ? '' : 'Per inviare la richiesta è necessario accettare l\'informativa privacy.'; }
  };

  function validateField(el) {
    var rule = rules[el.name];
    if (!rule) return true;
    var msg = rule(el.value, el);
    var err = document.getElementById(el.id + '-err');
    var field = el.closest('.field');
    if (err) err.textContent = msg;
    field.classList.toggle('has-error', !!msg);
    if (msg) { el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', el.id + '-err'); }
    else { el.removeAttribute('aria-invalid'); }
    return !msg;
  }

  Array.prototype.forEach.call(form.elements, function (el) {
    if (!rules[el.name]) return;
    el.addEventListener('blur', function () { if (el.value || el.type === 'checkbox') validateField(el); });
    el.addEventListener('input', function () { if (el.closest('.field').classList.contains('has-error')) validateField(el); });
    el.addEventListener('change', function () { if (el.type === 'checkbox') validateField(el); });
  });

  function setStatus(type, html) {
    statusEl.className = 'form-status' + (type ? ' is-' + type : '');
    statusEl.innerHTML = html;
    if (html) statusEl.focus({ preventScroll: false });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    setStatus('', '');
    var firstInvalid = null;
    Array.prototype.forEach.call(form.elements, function (el) {
      if (rules[el.name] && !validateField(el) && !firstInvalid) firstInvalid = el;
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    var data = {
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
      telefono: form.telefono.value.trim(),
      trattamento: form.trattamento.value,
      messaggio: form.messaggio.value.trim()
    };

    if (endpoint) {
      submitBtn.disabled = true;
      var original = submitBtn.textContent;
      submitBtn.textContent = 'Invio in corso…';
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        setStatus('success', '<strong>Grazie, ' + escapeHtml(data.nome) + '!</strong> La tua richiesta è stata inviata. Ti risponderò il prima possibile.');
      }).catch(function () {
        setStatus('error', 'Non è stato possibile inviare il messaggio. Riprova tra poco oppure <a href="https://wa.me/' + WA_NUMBER + '" target="_blank" rel="noopener">scrivimi su WhatsApp</a>.');
      }).finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = original;
      });
      return;
    }

    // Recapito tramite WhatsApp: il messaggio viene precompilato e inviato dall'utente
    var lines = [
      'Ciao, sono ' + data.nome + '.',
      data.trattamento ? 'Trattamento di interesse: ' + data.trattamento : 'Vorrei un consiglio sul trattamento più adatto.',
      '',
      data.messaggio,
      '',
      'Email: ' + data.email + (data.telefono ? '\nTelefono: ' + data.telefono : '')
    ];
    var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
    window.open(url, '_blank', 'noopener');
    setStatus('success',
      'Abbiamo preparato la tua richiesta su WhatsApp: <strong>premi Invia nell\'app</strong> per completarla. ' +
      'Se WhatsApp non si è aperto, <a href="' + url + '" target="_blank" rel="noopener">apri il messaggio da qui</a>.');
  });

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; });
  }
})();
