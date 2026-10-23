/**
 * Legal Ontologies Foundry: the weekly email digest.
 *
 * Once a week (Monday morning, in the project's time zone) every active subscriber gets one email
 * summarizing what happened since the last digest, with links:
 *   - proposals open for decision, their status and closing dates, and (for voting members)
 *     which ones still await their vote;
 *   - decisions made: changes adopted, withdrawn, or declined;
 *   - new proposals and new questions, questions resolved;
 *   - conversations with new replies, on issues, proposals, and Discussions;
 *   - new members.
 * Nothing is sent in a week with no activity.
 *
 * Subscribers are kept in the private log's "subscribers" tab: voting members and people who join
 * through the website are added automatically; anyone can subscribe from the website (with email
 * confirmation). Every email has an unsubscribe link.
 *
 * Requires Code.gs and Voting.gs in the same project. Setup: run setupDigest() once (see README.md).
 */

var DIGEST_DAY = ScriptApp.WeekDay ? ScriptApp.WeekDay.MONDAY : 'MONDAY';
var DIGEST_HOUR = 8;


// ======================================================================== setup and sending

function setupDigest() {
  ownerOnly_();
  var sh = subscribers_();
  var emails = voterEmails_();
  Object.keys(emails).forEach(function (name) { addSubscriber_(emails[name], name, 'voting member', true); });
  // People who joined through the website form.
  log_().getDataRange().getValues().slice(1).forEach(function (r) {
    if (r[4] === 'join' && r[6] === 'posted') addSubscriber_(r[2], r[3], 'member', true);
  });
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'weeklyDigest') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('weeklyDigest').timeBased().onWeekDay(DIGEST_DAY).atHour(DIGEST_HOUR).create();
  Logger.log('Digest set up: ' + activeSubscribers_().length + ' active subscribers, sent Mondays around ' + DIGEST_HOUR +
             ':00 (' + Session.getScriptTimeZone() + '). Subscribers: ' + sh.getParent().getUrl() + '#gid=' + sh.getSheetId());
}

/** Run from the editor: emails this week's digest to you only, to see what it looks like. */
function previewDigest() {
  ownerOnly_();
  var d = digestData_(lastDigest_(), new Date());
  var me = Session.getEffectiveUser().getEmail();
  var name = nameForEmail_(me) || 'coordinator';
  mail_(me, '[Preview] ' + digestSubject_(d), digestHtml_(d, { name: name, email: me, token: 'preview' }));
  Logger.log('Preview sent to ' + me + (d.empty ? ' (nothing happened in this period; the real digest would be skipped)' : ''));
}

/** Run by the weekly trigger. Also safe to run by hand from the editor. */
function weeklyDigest() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    var since = lastDigest_(), now = new Date();
    if (now - since < 6 * 864e5) return;      // at most one digest a week, however this is called
    var d = digestData_(since, now);
    props().setProperty('DIGEST_LAST', now.toISOString());
    if (d.empty) { console.log('Digest skipped: no activity since ' + since.toISOString()); return; }
    var subject = digestSubject_(d), sent = 0;
    activeSubscribers_().forEach(function (s) {
      if (MailApp.getRemainingDailyQuota() < 2) { console.warn('Daily email quota reached; ' + s.email + ' not sent.'); return; }
      try { mail_(s.email, subject, digestHtml_(d, s)); sent++; } catch (err) { console.error('Digest to ' + s.email + ': ' + err); }
    });
    console.log('Digest sent to ' + sent + ' subscribers.');
  } finally {
    lock.releaseLock();
  }
}

function lastDigest_() {
  var v = props().getProperty('DIGEST_LAST');
  return v ? new Date(v) : new Date(Date.now() - 7 * 864e5);
}


// ======================================================================== gathering the week's activity

function digestData_(since, now) {
  var R = '/repos/' + REPO;
  var iso = since.toISOString();
  var after = function (ts) { return ts && new Date(ts) > since; };
  var items = gh_('GET', R + '/issues?state=all&sort=updated&direction=desc&per_page=100&since=' + iso);
  var comments = gh_('GET', R + '/issues/comments?sort=created&direction=asc&per_page=100&since=' + iso)
    .filter(function (c) { return after(c.created_at); });
  var ctx = context_();

  var d = { since: since, now: now, decisions: [], adopted: [], closedChanges: [], newChanges: [], newQuestions: [],
            resolved: [], active: [], newDiscussions: [], activeDiscussions: [], newMembers: [] };
  var isNew = {};

  items.forEach(function (it) {
    var pr = !!it.pull_request, merged = pr && it.pull_request.merged_at;
    var labels = (it.labels || []).map(function (l) { return l.name; });
    if (pr && after(merged)) {
      (labels.indexOf('membership') >= 0 ? d.newMembers : d.adopted).push(it);
    } else if (pr && it.state === 'closed' && after(it.closed_at)) {
      d.closedChanges.push(it);
    } else if (!pr && it.state === 'closed' && after(it.closed_at)) {
      d.resolved.push(it);
    }
    if (after(it.created_at) && it.state === 'open') {
      (pr ? d.newChanges : d.newQuestions).push(it);
      isNew[it.number] = true;
    }
  });

  // Conversations with new replies (not counting the bot's own vote records, which are counted as votes).
  var byItem = {};
  comments.forEach(function (c) {
    var n = Number(String(c.issue_url).split('/').pop());
    var e = byItem[n] || (byItem[n] = { replies: 0, votes: 0, people: {} });
    if (/<!-- lof-vote /.test(c.body || '') && isBot_(c, ctx.rules)) { e.votes++; return; }
    if (isBot_(c, ctx.rules) && /^\*\*(Adopted|Decision passed|Opened for decision)/.test(c.body || '')) return;
    e.replies++;
    e.people[displayName_(c)] = true;
  });
  items.forEach(function (it) {
    var e = byItem[it.number];
    if (e && (e.replies || e.votes) && !isNew[it.number]) {
      d.active.push({ item: it, replies: e.replies, votes: e.votes, people: Object.keys(e.people) });
    }
  });

  // Proposals open for decision, with this week's state of the count.
  gh_('GET', R + '/pulls?state=open&per_page=100').forEach(function (pr) {
    var kind = kindOf_(pr, ctx.rules);
    if (!kind) return;
    var rule = ctx.rules.kinds[kind];
    var opened = labelTime_(pr.number, rule.label) || new Date(pr.created_at);
    var t = tally_(ctx.rules, kind, ctx.members, votes_(pr.number, ctx), opened, now);
    d.decisions.push({ pr: pr, kind: kind, opened: opened, closes: new Date(opened.getTime() + rule.comment_days * 864e5), t: t });
  });

  // Discussions.
  try {
    var q = 'query($o:String!,$n:String!){repository(owner:$o,name:$n){discussions(first:30,orderBy:{field:UPDATED_AT,direction:DESC})' +
            '{nodes{number title url createdAt author{login} category{name} comments(last:30){totalCount nodes{createdAt author{login}}}}}}}';
    gql_(q, { o: owner_(), n: name_() }).repository.discussions.nodes.forEach(function (x) {
      if (after(x.createdAt)) { d.newDiscussions.push(x); return; }
      var fresh = x.comments.nodes.filter(function (c) { return after(c.createdAt); });
      if (fresh.length) d.activeDiscussions.push({ disc: x, replies: fresh.length });
    });
  } catch (err) {
    console.warn('Discussions not included: ' + err);
  }

  d.empty = !(d.decisions.length || d.adopted.length || d.closedChanges.length || d.newChanges.length || d.newQuestions.length ||
              d.resolved.length || d.active.length || d.newDiscussions.length || d.activeDiscussions.length || d.newMembers.length);
  d.form = formLinks_();
  return d;
}

function displayName_(c) {
  if (c.performed_via_github_app || /\[bot\]$/.test((c.user || {}).login || '')) {
    var m = String(c.body || '').match(/by \*\*([^*]+)\*\*/);
    return m ? m[1] : 'via website';
  }
  return (c.user || {}).login || 'someone';
}

/** The website form's prefill settings, from community/forms.yml, for "comment without GitHub" links. */
function formLinks_() {
  try {
    var t = getFile_('community/forms.yml').text;
    var g = function (k) { var m = t.match(new RegExp('^\\s*' + k + ':\\s*"([^"]*)"', 'm')); return m ? m[1] : ''; };
    return { url: g('form_url'), action: g('action'), link: g('link'), comment: g('comment') };
  } catch (err) {
    return null;
  }
}


// ======================================================================== the email

function digestSubject_(d) {
  var bits = [];
  if (d.decisions.length) bits.push(d.decisions.length + ' open for decision');
  if (d.adopted.length) bits.push(d.adopted.length + ' adopted');
  var news = d.newChanges.length + d.newQuestions.length + d.newDiscussions.length;
  if (news) bits.push(news + ' new');
  return 'Legal Ontologies Foundry: the week to ' + fmtDate_(d.now) + (bits.length ? ' (' + bits.join(', ') + ')' : '');
}

function digestHtml_(d, s) {
  var A = 'color:#3f51b5';
  var link = function (url, text) { return '<a href="' + esc_(url) + '" style="' + A + '">' + esc_(text) + '</a>'; };
  var reply = function (url) {
    if (!d.form || !d.form.url) return '';
    var u = d.form.url + '?usp=pp_url&' + d.form.action + '=' + encodeURIComponent(d.form.comment || 'Comment on an open proposal or discussion') +
            '&' + d.form.link + '=' + encodeURIComponent(url);
    return ' · ' + link(u, 'comment');
  };
  var section = function (title, rows) {
    return rows.length ? '<h2 style="font-size:17px;font-weight:600;margin:28px 0 8px;border-bottom:1px solid #ddd;padding-bottom:4px">' +
      esc_(title) + '</h2><ul style="padding-left:18px;margin:0">' + rows.map(function (r) { return '<li style="margin:0 0 10px">' + r + '</li>'; }).join('') + '</ul>' : '';
  };
  var who = function (it) { return esc_((it.user || {}).login || ''); };
  var voterName = nameForEmail_(s.email);
  var isVoter = voterName && ctxMembersVoting_(voterName);

  var h = '<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:640px;margin:0 auto;color:#222;line-height:1.5;font-size:15px">' +
    '<p style="color:#3f51b5;font-weight:600;margin:0">Legal Ontologies Foundry</p>' +
    '<h1 style="font-size:22px;font-weight:400;margin:4px 0 4px">What happened, ' + fmtDate_(d.since) + ' to ' + fmtDate_(d.now) + '</h1>' +
    '<p style="color:#666;margin:0 0 8px">Hello ' + esc_(s.name || 'there') + '. Everything below links to the full record; ' +
    'you can comment on any of it without a GitHub account.</p>';

  if (isVoter) {
    var waiting = d.decisions.filter(function (x) { return !x.t.byVoter[voterName]; });
    if (waiting.length) {
      h += '<div style="background:#eef0fb;border-left:4px solid #3f51b5;padding:10px 14px;margin:16px 0">' +
        '<b>Awaiting your vote:</b> ' + waiting.map(function (x) { return esc_(x.pr.title) + ' (#' + x.pr.number + ')'; }).join('; ') +
        '. ' + link(SITE + 'activity/signin/', 'Sign in and vote') + '.</div>';
    }
  }

  h += section('Open for decision', d.decisions.map(function (x) {
    var mine = isVoter && x.t.byVoter[voterName];
    return '<b>' + link(x.pr.html_url, x.pr.title) + '</b> (#' + x.pr.number + ', ' + x.kind + ')<br>' +
      '<span style="color:#555">' + esc_(x.t.status) + (x.t.daysLeft ? ' Comment period ends ' + fmtDate_(x.closes) + '.' : '') + '</span>' +
      (mine ? '<br><span style="color:#555">Your vote: ' + VOTE_LABELS[mine.vote] + '.</span>' : '') +
      '<br>' + link(SITE + 'activity/proposals/#decision-' + x.pr.number, 'read and vote') + reply(x.pr.html_url);
  }));
  h += section('Decided', d.adopted.map(function (it) {
    return '<b>Adopted:</b> ' + link(it.html_url, it.title) + ' (#' + it.number + ')';
  }).concat(d.closedChanges.map(function (it) {
    return '<b>Withdrawn or declined:</b> ' + link(it.html_url, it.title) + ' (#' + it.number + ')';
  })));
  h += section('New proposals', d.newChanges.map(function (it) {
    return link(it.html_url, it.title) + ' (#' + it.number + '), by ' + who(it) + reply(it.html_url);
  }));
  h += section('New questions and ideas', d.newQuestions.map(function (it) {
    return link(it.html_url, it.title) + ' (#' + it.number + '), by ' + who(it) + reply(it.html_url);
  }).concat(d.newDiscussions.map(function (x) {
    return link(x.url, x.title) + ' (discussion, ' + esc_(x.category.name) + '), by ' + esc_((x.author || {}).login || '') + reply(x.url);
  })));
  h += section('Active conversations', d.active.map(function (a) {
    var parts = [];
    if (a.replies) parts.push(a.replies + ' new repl' + (a.replies === 1 ? 'y' : 'ies') + (a.people.length ? ' from ' + esc_(a.people.join(', ')) : ''));
    if (a.votes) parts.push(a.votes + ' vote' + (a.votes === 1 ? '' : 's') + ' cast');
    return link(a.item.html_url, a.item.title) + ' (#' + a.item.number + '): ' + parts.join('; ') + reply(a.item.html_url);
  }).concat(d.activeDiscussions.map(function (a) {
    return link(a.disc.url, a.disc.title) + ' (discussion): ' + a.replies + ' new repl' + (a.replies === 1 ? 'y' : 'ies') + reply(a.disc.url);
  })));
  h += section('Questions resolved', d.resolved.map(function (it) {
    return link(it.html_url, it.title) + ' (#' + it.number + ')' + (it.state_reason === 'not_planned' ? ', not pursued' : '');
  }));
  h += section('New members', d.newMembers.map(function (it) {
    return esc_(String(it.title).replace(/^Add (.*) as a member$/, '$1'));
  }));

  h += '<p style="margin:28px 0 0">' + link(SITE + 'activity/', 'All activity') + ' · ' +
    link(SITE + 'activity/participate/', 'Take part without GitHub') + ' · ' + link(SITE + 'activity/decisions/', 'Decision log') + '</p>' +
    '<p style="color:#888;font-size:12px;margin-top:24px">You receive this weekly digest as a ' + esc_(s.source || 'subscriber') +
    ' of the Legal Ontologies Foundry. Weeks with no activity are skipped. ' +
    link(webAppUrl_() + '?unsubscribe=' + encodeURIComponent(s.token || ''), 'Unsubscribe') + '.</p></div>';
  return h;
}

function ctxMembersVoting_(name) {
  return members_().some(function (m) { return m.name === name && m.voting; });
}

function nameForEmail_(email) {
  var emails = voterEmails_(), out = null;
  Object.keys(emails).forEach(function (n) { if (emails[n].toLowerCase() === String(email).toLowerCase()) out = n; });
  return out;
}


// ======================================================================== subscribers

function subscribers_() {
  var ss = SpreadsheetApp.openById(props().getProperty('LOG_SHEET_ID'));
  var sh = ss.getSheetByName('subscribers');
  if (!sh) {
    sh = ss.insertSheet('subscribers');
    sh.appendRow(['email', 'name', 'source', 'status', 'token', 'added', 'changed']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function activeSubscribers_() {
  return subscribers_().getDataRange().getValues().slice(1)
    .filter(function (r) { return r[3] === 'active' && /@/.test(r[0]); })
    .map(function (r) { return { email: r[0], name: r[1], source: r[2], token: r[4] }; });
}

/** Add someone (active at once if confirmed, else pending email confirmation). Returns the row's token. */
function addSubscriber_(email, name, source, confirmed) {
  email = String(email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+$/.test(email)) return null;
  var sh = subscribers_();
  var rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toLowerCase() === email) {
      if (confirmed && rows[i][3] === 'pending') sh.getRange(i + 1, 4).setValue('active');
      return rows[i][4];
    }
  }
  var token = Utilities.getUuid();
  sh.appendRow([email, name || '', source, confirmed ? 'active' : 'pending', token, new Date(), new Date()]);
  return token;
}

function subscriberRow_(token) {
  if (!token) return null;
  var sh = subscribers_();
  var hit = sh.getRange('E:E').createTextFinder(String(token)).matchEntireCell(true).findNext();
  if (!hit) return null;
  return { sheet: sh, row: hit.getRow(), values: sh.getRange(hit.getRow(), 1, 1, 7).getValues()[0] };
}

/** Website request (doPost api "subscribe"): emails a confirmation link. Same reply for every address. */
function apiSubscribe_(q) {
  var reply = { ok: true, message: 'Thank you. Check your inbox for a link to confirm your subscription.' };
  var email = String(q.email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+$/.test(email)) return { error: 'Please enter an email address.' };
  var cache = CacheService.getScriptCache(), key = 'sub_' + email;
  if (cache.get(key)) return reply;
  cache.put(key, '1', 3600);
  var existing = subscribers_().getDataRange().getValues().slice(1).filter(function (r) { return String(r[0]).toLowerCase() === email; })[0];
  if (existing && existing[3] === 'active') return reply;
  var token = existing ? existing[4] : addSubscriber_(email, clip_(q.name, 100), 'website subscriber', false);
  if (existing && existing[3] === 'unsubscribed') {
    var row = subscriberRow_(token);
    row.sheet.getRange(row.row, 4, 1, 4).setValues([['pending', token, row.values[5], new Date()]]);
  }
  mail_(email, 'Confirm: weekly digest of the Legal Ontologies Foundry',
    '<p>Please confirm that you would like a weekly email summarizing the Legal Ontologies Foundry\'s activity:</p>' +
    '<p><a href="' + webAppUrl_() + '?subscribe=' + encodeURIComponent(token) + '">Confirm my subscription</a></p>' +
    '<p>If you did not ask for this, ignore this email; you will not be subscribed.</p>');
  return reply;
}

/** The confirm and unsubscribe pages (called from doGet in Code.gs). Each asks for one click. */
function subscriptionPage_(token, unsubscribe) {
  var row = subscriberRow_(token);
  if (!row) return { title: 'Link not recognized', html: '<p>This link is not valid.</p>' };
  var verb = unsubscribe ? 'Unsubscribe' : 'Confirm my subscription';
  var done = unsubscribe ? row.values[3] === 'unsubscribed' : row.values[3] === 'active';
  if (done) {
    return { title: unsubscribe ? 'Unsubscribed' : 'Subscribed',
      html: '<p>' + (unsubscribe ? 'You will not receive the weekly digest.' : 'You will receive the weekly digest.') + '</p>' };
  }
  return { title: unsubscribe ? 'Unsubscribe from the weekly digest' : 'Confirm your subscription',
    html: '<p>' + esc_(row.values[0]) + '</p><p><button id="b" onclick="go()" style="font:inherit;padding:.5em 1.2em">' + verb +
      '</button></p><p id="m"></p><script>function go(){document.getElementById("b").disabled=true;' +
      'google.script.run.withSuccessHandler(function(t){document.getElementById("m").textContent=t;})' +
      '.withFailureHandler(function(e){document.getElementById("m").textContent=e.message;})' +
      '.setSubscription(' + JSON.stringify(String(token)) + ',' + (unsubscribe ? 'false' : 'true') + ');}</script>' };
}

/** Called from the confirm and unsubscribe pages. */
function setSubscription(token, on) {
  var row = subscriberRow_(token);
  if (!row) throw new Error('This link is not valid.');
  row.sheet.getRange(row.row, 4).setValue(on ? 'active' : 'unsubscribed');
  row.sheet.getRange(row.row, 7).setValue(new Date());
  return on ? 'Thank you. You will receive the weekly digest.' : 'Done. You will not receive the weekly digest any more.';
}
