/*
 * Signing in and voting on the Foundry website.
 * The site is static; sign-in, sessions, and votes are handled by the Foundry's Apps Script
 * web app (website-forms/Voting.gs), whose address is in a data-lof-webapp attribute on the page.
 * The session token is kept in this browser's localStorage under "lof_session".
 */
(function () {
  var host = document.querySelector('[data-lof-webapp]');
  if (!host) return;
  var WEBAPP = host.getAttribute('data-lof-webapp');
  var KEY = 'lof_session';
  var LABEL = { approve: 'Approve', object: 'Object', abstain: 'Abstain' };
  var base = document.querySelector('link[rel="canonical"]');
  var SITE = base ? base.href.replace(/activity\/.*$/, '') : '/';
  var signinUrl = SITE + 'activity/signin/';

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) { /* private mode */ } }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function api(body) {
    return fetch(WEBAPP, { method: 'POST', body: JSON.stringify(body) })   // text/plain: no preflight
      .then(function (r) { return r.json(); })
      .then(function (j) { if (j.error) throw new Error(j.error); return j; });
  }

  var mePromise = null;
  function me(force) {
    if (!get(KEY)) return Promise.resolve({ signedIn: false });
    if (!mePromise || force) {
      mePromise = api({ api: 'me', session: get(KEY) }).then(function (m) {
        if (!m.signedIn) set(KEY, null);
        return m;
      });
    }
    return mePromise;
  }

  function signOut() {
    var s = get(KEY);
    set(KEY, null);
    (s ? api({ api: 'logout', session: s }) : Promise.resolve()).catch(function () {}).then(function () { location.reload(); });
  }

  // ---------------------------------------------------------------- the bar at the top of Activity pages
  document.querySelectorAll('.lof-userbar').forEach(function (bar) {
    if (!get(KEY)) {
      bar.innerHTML = 'Voting member? <a href="' + signinUrl + '">Sign in</a> to read and vote on proposals here.';
      return;
    }
    bar.textContent = 'Checking sign-in...';
    me().then(function (m) {
      if (!m.signedIn) { bar.innerHTML = 'Your sign-in has expired. <a href="' + signinUrl + '">Sign in again</a>.'; return; }
      var open = m.decisions.filter(function (d) { return !d.myVote; }).length;
      bar.innerHTML = 'Signed in as <b>' + esc(m.name) + '</b>' + (m.committee ? ' (Operations Committee)' : '') +
        (m.decisions.length ? ' · ' + (open ? open + ' proposal' + (open === 1 ? '' : 's') + ' awaiting your vote' : 'you have voted on every open proposal') +
          ' (<a href="' + SITE + 'activity/proposals/#open-for-decision">open for decision</a>)' : '') +
        ' · <a href="#" class="lof-signout">Sign out</a>';
      bar.querySelector('.lof-signout').onclick = function (e) { e.preventDefault(); signOut(); };
    }).catch(function (e) { bar.textContent = 'Could not check sign-in: ' + e.message; });
  });

  // ---------------------------------------------------------------- the sign-in page
  var box = document.getElementById('lof-signin');
  if (box) {
    var code = new URLSearchParams(location.search).get('code');
    if (code) {
      box.textContent = 'Signing you in...';
      api({ api: 'redeem', code: code }).then(function (r) {
        set(KEY, r.session);
        history.replaceState(null, '', location.pathname);
        box.innerHTML = '<p>Welcome, <b>' + esc(r.name) + '</b>. You are signed in on this browser.</p>' +
          '<p><a class="md-button md-button--primary" href="' + SITE + 'activity/proposals/#open-for-decision">Go to proposals open for decision</a></p>';
      }).catch(function (e) { box.innerHTML = '<p>' + esc(e.message) + '</p>'; showForm(); });
    } else if (get(KEY)) {
      me().then(function (m) {
        if (!m.signedIn) return showForm();
        box.innerHTML = '<p>You are signed in as <b>' + esc(m.name) + '</b>.</p>' +
          '<p><a class="md-button md-button--primary" href="' + SITE + 'activity/proposals/#open-for-decision">Proposals open for decision</a> ' +
          '<a class="md-button" href="#" id="lof-out">Sign out</a></p>';
        document.getElementById('lof-out').onclick = function (e) { e.preventDefault(); signOut(); };
      }).catch(function () { showForm(); });
    } else {
      showForm();
    }
  }
  function showForm() {
    var f = document.createElement('div');
    f.innerHTML = '<p><label>Your email address<br><input id="lof-email" type="email" autocomplete="email" ' +
      'placeholder="you@example.org" class="lof-input"></label></p>' +
      '<p><button id="lof-send" class="md-button md-button--primary">Email me a sign-in link</button></p><p id="lof-msg"></p>';
    box.appendChild(f);
    document.getElementById('lof-send').onclick = function () {
      var b = this, msg = document.getElementById('lof-msg');
      b.disabled = true; msg.textContent = 'Sending...';
      api({ api: 'login', email: document.getElementById('lof-email').value })
        .then(function (r) { msg.textContent = r.message; })
        .catch(function (e) { msg.textContent = e.message; b.disabled = false; });
    };
  }

  // ---------------------------------------------------------------- the weekly digest sign-up
  document.querySelectorAll('.lof-subscribe').forEach(function (box) {
    box.innerHTML = '<p><b>Weekly digest.</b> One email a week with everything new: proposals, decisions, ' +
      'questions and conversations, with links. Skipped in quiet weeks.</p>' +
      '<p><input type="text" class="lof-input lof-sub-name" placeholder="Your name (optional)" style="max-width:14em"> ' +
      '<input type="email" class="lof-input lof-sub-email" placeholder="you@example.org" style="max-width:18em"> ' +
      '<button class="md-button md-button--primary lof-sub-go">Subscribe</button></p><p class="lof-sub-msg"></p>';
    box.querySelector('.lof-sub-go').onclick = function () {
      var b = this, msg = box.querySelector('.lof-sub-msg');
      b.disabled = true; msg.textContent = 'Sending...';
      api({ api: 'subscribe', email: box.querySelector('.lof-sub-email').value, name: box.querySelector('.lof-sub-name').value })
        .then(function (r) { msg.textContent = r.message; })
        .catch(function (e) { msg.textContent = e.message; b.disabled = false; });
    };
  });

  // ---------------------------------------------------------------- voting panels on proposals
  var panels = document.querySelectorAll('.lof-vote[data-pr]');
  if (!panels.length) return;
  if (!get(KEY)) {
    panels.forEach(function (p) {
      p.innerHTML = '<b>Voting members:</b> <a href="' + signinUrl + '">sign in</a> to vote here, or use the ballot link in your email.';
    });
    return;
  }
  me().then(function (m) { panels.forEach(function (p) { render(p, m); }); })
      .catch(function (e) { panels.forEach(function (p) { p.textContent = 'Could not load your vote: ' + e.message; }); });

  function render(p, m) {
    var n = Number(p.getAttribute('data-pr'));
    if (!m.signedIn) { p.innerHTML = 'Your sign-in has expired. <a href="' + signinUrl + '">Sign in again</a> to vote.'; return; }
    if (!m.voting) { p.textContent = 'Signed in as ' + m.name + '. Only voting members vote on proposals.'; return; }
    var d = m.decisions.filter(function (x) { return x.pr === n; })[0];
    if (!d) { p.textContent = 'This proposal is no longer open for decision.'; return; }
    p.innerHTML = '<p><b>Your vote, ' + esc(m.name) + ':</b> ' +
      (d.myVote ? '<b>' + LABEL[d.myVote] + '</b> (cast on ' + esc(d.via) + '). You can change it until the decision is made.' : 'not yet cast.') + '</p>' +
      '<p class="lof-status">' + esc(d.status) + '</p>' +
      '<p><textarea rows="3" class="lof-input" placeholder="Reasons (optional, posted publicly on the proposal)"></textarea></p>' +
      '<p class="lof-buttons">' + ['approve', 'object', 'abstain'].map(function (v) {
        return '<button class="md-button' + (v === 'approve' ? ' md-button--primary' : '') + '" data-v="' + v + '">' + LABEL[v] + '</button>';
      }).join(' ') + '</p><p class="lof-msg"></p>';
    p.querySelectorAll('button[data-v]').forEach(function (btn) {
      btn.onclick = function () {
        var v = btn.getAttribute('data-v'), msg = p.querySelector('.lof-msg');
        if (!confirm('Cast your vote "' + LABEL[v] + '" on #' + n + '? It is posted publicly under your name.')) return;
        p.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
        msg.textContent = 'Recording your vote...';
        api({ api: 'vote', session: get(KEY), pr: n, choice: v, reasons: p.querySelector('textarea').value })
          .then(function (r) {
            render(p, r.me);
            p.querySelector('.lof-msg').innerHTML = 'Thank you. Your vote is recorded: <a href="' + esc(r.url) + '">see it on the proposal</a>.';
          })
          .catch(function (e) {
            msg.textContent = 'Sorry, that did not work: ' + e.message;
            p.querySelectorAll('button').forEach(function (x) { x.disabled = false; });
          });
      };
    });
  }
})();
