/**
 * Legal Ontologies Foundry: voting on proposals through the website.
 *
 * A coordinator opens a decision by adding the label "decision: routine" or
 * "decision: substantive" to a pull request (that is not a draft). Every 15 minutes this script:
 *   - emails each voting member who has not yet had one a personal ballot link for that proposal;
 *   - counts the votes: website ballots (posted on the pull request by the bot) and approvals or
 *     "changes requested" reviews given directly on GitHub by voting members;
 *   - applies the rule in community/decision-rules.json and, if the proposal has passed, merges it,
 *     records the decision on the pull request, and tells the voters.
 *
 * Voting members are those marked "voting: true" in community/members.yml; Operations Committee
 * members are marked "committee: true". Their email addresses are kept privately, in the "voters"
 * tab of the private log spreadsheet, never in the repository.
 *
 * Requires Code.gs in the same project. Setup: run setupVoting() once (see README.md).
 */

var VOTE_LABELS = { approve: 'Approve', object: 'Object', abstain: 'Abstain' };


// ======================================================================== setup

function setupVoting() {
  ownerOnly_();
  var ss = SpreadsheetApp.openById(props().getProperty('LOG_SHEET_ID'));
  var voters = ss.getSheetByName('voters');
  if (!voters) {
    voters = ss.insertSheet('voters');
    voters.appendRow(['name (exactly as in members.yml)', 'email (private)']);
    voters.setFrozenRows(1);
  }
  var have = voters.getDataRange().getValues().slice(1).map(function (r) { return r[0]; });
  members_().filter(function (m) { return m.voting; }).forEach(function (m) {
    if (have.indexOf(m.name) < 0) voters.appendRow([m.name, '']);
  });
  if (!ss.getSheetByName('ballots')) {
    var b = ss.insertSheet('ballots');
    b.appendRow(['token', 'pull request', 'voter', 'email', 'sent', 'vote', 'reasons', 'voted', 'record']);
    b.setFrozenRows(1);
  }
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'decisionsTick') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('decisionsTick').timeBased().everyMinutes(15).create();
  Logger.log('Voting is set up. Fill in the email column of the "voters" tab: ' + ss.getUrl() + '#gid=' + voters.getSheetId());
}



// ======================================================================== the 15-minute check

function decisionsTick() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    var ctx = context_();
    gh_('GET', '/repos/' + REPO + '/pulls?state=open&per_page=100').forEach(function (pr) {
      try { processPr_(pr, ctx); } catch (err) { console.error('PR #' + pr.number + ': ' + (err.stack || err)); }
    });
  } finally {
    lock.releaseLock();
  }
}

function context_() {
  return { rules: JSON.parse(getFile_('community/decision-rules.json').text), members: members_() };
}

function kindOf_(pr, rules) {
  if (pr.draft || pr.state !== 'open') return null;
  var names = (pr.labels || []).map(function (l) { return l.name; });
  var kinds = Object.keys(rules.kinds).filter(function (k) { return names.indexOf(rules.kinds[k].label) >= 0; });
  // If both labels are present, the stricter rule applies.
  return kinds.indexOf('substantive') >= 0 ? 'substantive' : kinds[0] || null;
}

function processPr_(pr, ctx) {
  var kind = kindOf_(pr, ctx.rules);
  if (!kind) return;
  var opened = labelTime_(pr.number, ctx.rules.kinds[kind].label) || new Date(pr.created_at);
  sendBallots_(pr, kind, opened, ctx);
  var t = tally_(ctx.rules, kind, ctx.members, votes_(pr.number, ctx), opened, new Date());
  if (t.passed && ctx.rules.auto_merge) adopt_(pr, kind, t, ctx);
}

function labelTime_(n, label) {
  var at = null;
  gh_('GET', '/repos/' + REPO + '/issues/' + n + '/events?per_page=100').forEach(function (e) {
    if (e.event === 'labeled' && e.label && e.label.name === label) at = new Date(e.created_at);
  });
  return at;
}


// ======================================================================== ballots

function sendBallots_(pr, kind, opened, ctx) {
  var sh = sheet_('ballots');
  var rows = sh.getDataRange().getValues();
  var emails = voterEmails_();
  var rule = ctx.rules.kinds[kind];
  var closes = new Date(opened.getTime() + rule.comment_days * 864e5);
  ctx.members.filter(function (m) { return m.voting; }).forEach(function (m) {
    var email = emails[m.name];
    if (!email) return;
    var sent = rows.some(function (r) { return Number(r[1]) === pr.number && r[2] === m.name; });
    if (sent) return;
    var token = Utilities.getUuid();
    sh.appendRow([token, pr.number, m.name, email, new Date(), '', '', '', '']);
    rows.push([token, pr.number, m.name]);
    ballotMail_(m.name, email, pr, rule, closes, token);
  });
}

function ballotMail_(name, email, pr, rule, closes, token) {
  var link = webAppUrl_() + '?ballot=' + token;
  mail_(email, 'Your vote: ' + pr.title,
    '<p>Dear ' + esc_(name) + ',</p>' +
    '<p>A proposal is open for decision in the Legal Ontologies Foundry:</p>' +
    '<p style="font-size:1.1em"><b>' + esc_(pr.title) + '</b> (#' + pr.number + ')</p>' +
    '<p>' + esc_(rule.summary) + '</p>' +
    (rule.comment_days ? '<p>The comment period runs until <b>' + fmtDate_(closes) + '</b>.</p>' : '') +
    '<p><a href="' + link + '" style="background:#3f51b5;color:#fff;padding:.6em 1.2em;border-radius:4px;text-decoration:none">Read and vote</a></p>' +
    '<p>This link is your personal ballot: please do not forward it. You can change your vote until the decision ' +
    'is made. Your vote and any reasons you give are posted publicly on the proposal.</p>' +
    '<p style="color:#666">You can also vote on GitHub by approving the pull request or requesting changes: ' +
    '<a href="' + pr.html_url + '">' + pr.html_url + '</a></p>');
}

/** The "vote" page linked from the website: voting members ask for their ballot links by email. */
function votePage_() {
  var ctx = context_();
  var open = gh_('GET', '/repos/' + REPO + '/pulls?state=open&per_page=100').filter(function (pr) { return kindOf_(pr, ctx.rules); });
  var list = open.length
    ? '<ul>' + open.map(function (pr) {
        return '<li><a href="' + esc_(pr.html_url) + '">' + esc_(pr.title) + '</a> (#' + pr.number + ', ' + kindOf_(pr, ctx.rules) + ')</li>';
      }).join('') + '</ul>'
    : '<p>No proposals are open for decision right now.</p>';
  return { title: 'Vote on proposals',
    html: '<p>Proposals open for decision:</p>' + list +
      '<p>Voting members vote with a personal ballot link sent by email. Enter the address the Foundry has for you, ' +
      'and we will email your ballot links for every open proposal.</p>' +
      '<p><input id="e" type="email" placeholder="you@example.org" style="font:inherit;padding:.4em;width:20em;max-width:100%"> ' +
      '<button id="b" onclick="go()" style="font:inherit;padding:.4em 1em">Email my ballots</button></p><p id="m"></p>' +
      '<p style="color:#666">Only voting members receive ballots. See the <a href="' + SITE + 'about/governance/">Governance</a> ' +
      'page and the <a href="' + SITE + 'activity/members/">Members</a> page.</p>' +
      '<script>function go(){var b=document.getElementById("b");b.disabled=true;document.getElementById("m").textContent="Sending...";' +
      'google.script.run.withSuccessHandler(function(t){document.getElementById("m").textContent=t;})' +
      '.withFailureHandler(function(e){b.disabled=false;document.getElementById("m").textContent="Sorry, that did not work: "+e.message;})' +
      '.requestBallots(document.getElementById("e").value);}</script>' };
}

/** Called from the vote page. Says the same thing whether or not the address is a voter's. */
function requestBallots(email) {
  var reply = 'If that address belongs to a voting member, their ballot links are on the way. Check your inbox (and spam folder) in a minute or two.';
  email = String(email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+$/.test(email)) return 'Please enter an email address.';
  var cache = CacheService.getScriptCache(), key = 'req_' + email;
  var count = Number(cache.get(key) || 0);
  if (count >= 3) return reply;
  cache.put(key, String(count + 1), 3600);
  var emails = voterEmails_(), name = null;
  Object.keys(emails).forEach(function (n) { if (emails[n].toLowerCase() === email) name = n; });
  if (!name) return reply;
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var ctx = context_();
    if (!ctx.members.some(function (m) { return m.name === name && m.voting; })) return reply;
    var sh = sheet_('ballots');
    var rows = sh.getDataRange().getValues();
    gh_('GET', '/repos/' + REPO + '/pulls?state=open&per_page=100').forEach(function (pr) {
      var kind = kindOf_(pr, ctx.rules);
      if (!kind) return;
      var rule = ctx.rules.kinds[kind];
      var opened = labelTime_(pr.number, rule.label) || new Date(pr.created_at);
      var closes = new Date(opened.getTime() + rule.comment_days * 864e5);
      var row = rows.filter(function (r) { return Number(r[1]) === pr.number && r[2] === name; })[0];
      var token = row ? row[0] : Utilities.getUuid();
      if (!row) sh.appendRow([token, pr.number, name, emails[name], new Date(), '', '', '', '']);
      ballotMail_(name, emails[name], pr, rule, closes, token);
    });
  } finally {
    lock.releaseLock();
  }
  return reply;
}

function ballotRow_(token) {
  var sh = sheet_('ballots');
  var hit = sh.getRange('A:A').createTextFinder(String(token)).matchEntireCell(true).findNext();
  if (!hit) return null;
  return { sheet: sh, row: hit.getRow(), values: sh.getRange(hit.getRow(), 1, 1, 9).getValues()[0] };
}

/** The ballot page (called from doGet in Code.gs). */
function ballotPage_(token) {
  var b = ballotRow_(token);
  if (!b) return { title: 'Ballot not found', html: '<p>This ballot link is not valid.</p>' };
  var n = Number(b.values[1]), voter = b.values[2];
  var pr = gh_('GET', '/repos/' + REPO + '/pulls/' + n);
  var ctx = context_();
  var kind = kindOf_(pr, ctx.rules);
  var head = '<p><b><a href="' + esc_(pr.html_url) + '">' + esc_(pr.title) + '</a></b> (#' + n + ')</p>';
  if (!kind) {
    return { title: 'No longer open for decision',
      html: head + '<p>This proposal is ' + (pr.merged_at ? 'adopted' : pr.state === 'closed' ? 'closed' : 'not open for decision at the moment') +
            '. See the <a href="' + SITE + 'activity/decisions/">decision log</a>.</p>' };
  }
  var opened = labelTime_(n, ctx.rules.kinds[kind].label) || new Date(pr.created_at);
  var t = tally_(ctx.rules, kind, ctx.members, votes_(n, ctx), opened, new Date());
  var mine = t.byVoter[voter];
  var desc = String(pr.body || 'No description.');
  var html = head +
    '<p style="color:#555">Proposed by ' + esc_(pr.user.login) + ' · <a href="' + esc_(pr.html_url) + '/files">see the exact changes</a></p>' +
    '<div style="background:#f5f5f7;padding:1em;border-radius:6px;white-space:pre-wrap;max-height:22em;overflow:auto">' + esc_(desc.slice(0, 6000)) + '</div>' +
    '<h2 style="font-weight:400">The rule</h2><p>' + esc_(ctx.rules.kinds[kind].summary) + '</p>' +
    '<p><b>Status:</b> ' + esc_(t.status) + '</p>' +
    '<h2 style="font-weight:400">Your vote, ' + esc_(voter) + '</h2>' +
    (mine ? '<p>You have voted <b>' + VOTE_LABELS[mine.vote] + '</b>. You can change it below.</p>' : '') +
    '<p><textarea id="r" rows="4" style="width:100%;font:inherit" placeholder="Reasons (optional, posted publicly)"></textarea></p>' +
    '<p id="b">' + ['approve', 'object', 'abstain'].map(function (v) {
      return '<button onclick="vote(\'' + v + '\')" style="font:inherit;padding:.5em 1.2em;margin-right:.5em">' + VOTE_LABELS[v] + '</button>';
    }).join('') + '</p><p id="m"></p>' +
    '<script>function vote(v){document.getElementById("b").style.display="none";document.getElementById("m").textContent="Recording your vote...";' +
    'google.script.run.withSuccessHandler(function(t){document.getElementById("m").innerHTML=t;})' +
    '.withFailureHandler(function(e){document.getElementById("m").textContent="Sorry, that did not work: "+e.message;document.getElementById("b").style.display="block";})' +
    '.castVote(' + JSON.stringify(String(token)) + ',v,document.getElementById("r").value);}</script>';
  return { title: 'Vote: ' + pr.title, html: html };
}

/** Called from the ballot page. */
function castVote(token, choice, reasons) {
  var b = ballotRow_(token);
  if (!b) throw new Error('This ballot link is not valid.');
  var r = recordVote_(b.values[2], Number(b.values[1]), choice, reasons, 'a personal ballot');
  return 'Thank you. Your vote, <b>' + VOTE_LABELS[choice] + '</b>, is recorded: <a href="' + esc_(r.url) +
         '" target="_top">see it on the proposal</a>.';
}

/** Post a vote on the pull request, note it in the ballots tab, and adopt the proposal if this vote decides it. */
function recordVote_(voter, n, choice, reasons, how) {
  if (!VOTE_LABELS[choice]) throw new Error('Unknown choice.');
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var ctx = context_();
    var member = ctx.members.filter(function (m) { return m.name === voter && m.voting; })[0];
    if (!member) throw new Error('You are not currently listed as a voting member.');
    var pr = gh_('GET', '/repos/' + REPO + '/pulls/' + n);
    var kind = kindOf_(pr, ctx.rules);
    if (!kind) throw new Error('This proposal is no longer open for decision.');
    var opened = labelTime_(n, ctx.rules.kinds[kind].label) || new Date(pr.created_at);
    var before = tally_(ctx.rules, kind, ctx.members, votes_(n, ctx), opened, new Date());
    var changed = !!before.byVoter[voter];
    var role = member.committee ? 'Operations Committee' : 'voting member';
    var body = '**Vote: ' + VOTE_LABELS[choice] + '** by **' + voter + '** (' + role + '), cast with ' + how +
      ' on the [Foundry website](' + SITE + 'activity/proposals/).' +
      (reasons && String(reasons).trim() ? '\n\n' + tidy_(String(reasons).slice(0, 4000)) : '') +
      (changed ? '\n\n*This replaces ' + voter + '\'s earlier vote.*' : '') +
      '\n\n<!-- lof-vote ' + JSON.stringify({ voter: voter, vote: choice }) + ' -->';
    var c = gh_('POST', '/repos/' + REPO + '/issues/' + n + '/comments', { body: body });
    var sh = sheet_('ballots');
    var rows = sh.getDataRange().getValues();
    var at = -1;
    rows.forEach(function (r, i) { if (i && Number(r[1]) === n && r[2] === voter) at = i; });
    var rec = [choice, String(reasons || '').slice(0, 4000), new Date(), c.html_url];
    if (at > 0) sh.getRange(at + 1, 6, 1, 4).setValues([rec]);
    else sh.appendRow([Utilities.getUuid(), n, voter, voterEmails_()[voter] || '', ''].concat(rec));
    processPr_(pr, ctx);       // adopt at once if this vote decides it
    return { url: c.html_url };
  } finally {
    lock.releaseLock();
  }
}


// ======================================================================== signing in on the website

/**
 * The website (a static site) talks to this web app with POST requests whose body is JSON:
 *   { api: 'login',  email }            -> emails a one-time sign-in link to a voting member
 *   { api: 'redeem', code }             -> exchanges that link's code for a session token
 *   { api: 'me',     session }          -> who is signed in, and their vote on each open decision
 *   { api: 'vote',   session, pr, choice, reasons }
 *   { api: 'logout', session }
 * Sessions last SESSION_DAYS; sign-in links last 30 minutes and work once.
 * Only hashes of codes and tokens are stored, in the private "sessions" tab.
 */
var SESSION_DAYS = 60;

function doPost(e) {
  var out;
  try {
    var q = JSON.parse((e.postData && e.postData.contents) || '{}');
    var fn = { login: apiLogin_, redeem: apiRedeem_, me: apiMe_, vote: apiVote_, logout: apiLogout_ }[q.api];
    if (!fn) throw new Error('Unknown request.');
    out = fn(q);
  } catch (err) {
    console.error(err && err.stack || err);
    out = { error: String(err && err.message || err).slice(0, 300) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function apiLogin_(q) {
  var reply = { ok: true, message: 'If that address belongs to a voting member, a sign-in link is on its way. ' +
    'Check your inbox (and spam folder); the link works once, for 30 minutes.' };
  var email = String(q.email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+$/.test(email)) return { error: 'Please enter an email address.' };
  var cache = CacheService.getScriptCache(), key = 'login_' + email;
  var count = Number(cache.get(key) || 0);
  if (count >= 5) return reply;
  cache.put(key, String(count + 1), 3600);
  var emails = voterEmails_(), name = null;
  Object.keys(emails).forEach(function (n) { if (emails[n].toLowerCase() === email) name = n; });
  if (!name) return reply;
  var code = Utilities.getUuid() + Utilities.getUuid().slice(0, 8);
  sessions_().appendRow([hash_(code), 'link', name, new Date(), new Date(Date.now() + 30 * 6e4), '']);
  var link = SITE + 'activity/signin/?code=' + encodeURIComponent(code);
  mail_(emails[name], 'Sign in to the Legal Ontologies Foundry',
    '<p>Dear ' + esc_(name) + ',</p><p><a href="' + link + '" style="background:#3f51b5;color:#fff;padding:.6em 1.2em;' +
    'border-radius:4px;text-decoration:none">Sign in to the Foundry website</a></p>' +
    '<p>The link works once, for 30 minutes. You stay signed in on that browser for ' + SESSION_DAYS + ' days, or until ' +
    'you sign out. If you did not ask to sign in, ignore this email.</p>');
  return reply;
}

function apiRedeem_(q) {
  var row = findSession_(q.code, 'link');
  if (!row || row.values[5]) return { error: 'This sign-in link has already been used or is not valid. Please ask for a new one.' };
  if (new Date(row.values[4]) < new Date()) return { error: 'This sign-in link has expired. Please ask for a new one.' };
  row.sheet.getRange(row.row, 6).setValue(new Date());           // used
  var token = Utilities.getUuid() + Utilities.getUuid();
  sessions_().appendRow([hash_(token), 'session', row.values[2], new Date(), new Date(Date.now() + SESSION_DAYS * 864e5), '']);
  return { session: token, name: row.values[2] };
}

function apiMe_(q) {
  var who = sessionUser_(q.session);
  if (!who) return { signedIn: false };
  var ctx = context_();
  var m = ctx.members.filter(function (x) { return x.name === who; })[0] || {};
  var decisions = [];
  gh_('GET', '/repos/' + REPO + '/pulls?state=open&per_page=100').forEach(function (pr) {
    var kind = kindOf_(pr, ctx.rules);
    if (!kind) return;
    var opened = labelTime_(pr.number, ctx.rules.kinds[kind].label) || new Date(pr.created_at);
    var t = tally_(ctx.rules, kind, ctx.members, votes_(pr.number, ctx), opened, new Date());
    var mine = t.byVoter[who];
    decisions.push({ pr: pr.number, title: pr.title, url: pr.html_url, kind: kind, status: t.status,
      myVote: mine ? mine.vote : null, via: mine ? mine.via : null });
  });
  return { signedIn: true, name: who, voting: !!m.voting, committee: !!m.committee, decisions: decisions };
}

function apiVote_(q) {
  var who = sessionUser_(q.session);
  if (!who) return { error: 'Please sign in again.' };
  var r = recordVote_(who, Number(q.pr), String(q.choice), q.reasons, 'a signed-in vote');
  return { ok: true, url: r.url, me: apiMe_(q) };
}

function apiLogout_(q) {
  var row = findSession_(q.session, 'session');
  if (row) row.sheet.getRange(row.row, 5).setValue(new Date());     // expire now
  return { ok: true };
}

function sessionUser_(token) {
  var row = findSession_(token, 'session');
  if (!row || new Date(row.values[4]) < new Date()) return null;
  var name = row.values[2];
  return members_().some(function (m) { return m.name === name && m.voting; }) ? name : null;
}

function findSession_(secret, type) {
  if (!secret) return null;
  var sh = sessions_();
  var hit = sh.getRange('A:A').createTextFinder(hash_(String(secret))).matchEntireCell(true).findNext();
  if (!hit) return null;
  var values = sh.getRange(hit.getRow(), 1, 1, 6).getValues()[0];
  return values[1] === type ? { sheet: sh, row: hit.getRow(), values: values } : null;
}

function sessions_() {
  var ss = SpreadsheetApp.openById(props().getProperty('LOG_SHEET_ID'));
  var sh = ss.getSheetByName('sessions');
  if (!sh) {
    sh = ss.insertSheet('sessions');
    sh.appendRow(['hash', 'type', 'member', 'created', 'expires', 'used']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function hash_(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s), Utilities.Charset.UTF_8)
    .map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join('');
}


// ======================================================================== counting

/** All votes on a pull request: website ballots posted by the bot, and GitHub reviews by voting members. */
function votes_(n, ctx) {
  var out = [];
  var byLogin = {};
  ctx.members.forEach(function (m) { if (m.github) byLogin[String(m.github).toLowerCase()] = m.name; });
  gh_('GET', '/repos/' + REPO + '/pulls/' + n + '/reviews?per_page=100').forEach(function (r) {
    var who = r.user && byLogin[String(r.user.login).toLowerCase()];
    var v = r.state === 'APPROVED' ? 'approve' : r.state === 'CHANGES_REQUESTED' ? 'object' : null;
    if (who && v) out.push({ voter: who, vote: v, at: r.submitted_at, via: 'GitHub' });
  });
  gh_('GET', '/repos/' + REPO + '/issues/' + n + '/comments?per_page=100').forEach(function (c) {
    if (!isBot_(c, ctx.rules)) return;
    var m = String(c.body).match(/<!-- lof-vote (\{.*?\}) -->/);
    if (!m) return;
    var v = JSON.parse(m[1]);
    out.push({ voter: v.voter, vote: v.vote, at: c.created_at, via: 'website' });
  });
  return out;
}

function isBot_(c, rules) {
  return (c.performed_via_github_app && c.performed_via_github_app.slug === rules.bot) ||
         (c.user && c.user.login === rules.bot + '[bot]');
}

/**
 * Apply a rule. Kept identical to tally() in scripts/build_activity.py.
 * Returns { passed, status, byVoter, approve: [...], object: [...], abstain: [...] }.
 */
function tally_(rules, kind, members, votes, opened, now) {
  var rule = rules.kinds[kind];
  var voting = members.filter(function (m) { return m.voting; }).map(function (m) { return m.name; });
  var committee = members.filter(function (m) { return m.committee && m.voting; }).map(function (m) { return m.name; });
  var byVoter = {};
  votes.slice().sort(function (a, b) { return new Date(a.at) - new Date(b.at); }).forEach(function (v) {
    if (voting.indexOf(v.voter) >= 0 && VOTE_LABELS[v.vote]) byVoter[v.voter] = v;
  });
  var list = function (k) { return voting.filter(function (n) { return byVoter[n] && byVoter[n].vote === k; }); };
  var approve = list('approve'), object = list('object'), abstain = list('abstain');
  var committeeYes = committee.filter(function (n) { return approve.indexOf(n) >= 0; });
  var daysOpen = (now - opened) / 864e5;
  var daysLeft = Math.max(0, Math.ceil(rule.comment_days - daysOpen));
  var waiting = [];
  if (daysOpen < rule.comment_days) waiting.push('comment period: ' + daysLeft + ' day' + (daysLeft === 1 ? '' : 's') + ' left');
  if (rule.committee === 'all') {
    var missing = committee.filter(function (n) { return committeeYes.indexOf(n) < 0; });
    if (!committee.length || missing.length) waiting.push('approval from ' + (missing.join(', ') || 'the Operations Committee'));
  } else if (!committeeYes.length) {
    waiting.push('approval from an Operations Committee member');
  }
  if (rule.objection_blocks && object.length) waiting.push('objection from ' + object.join(', '));
  if (rule.majority && approve.length <= object.length) waiting.push('a majority of votes cast to approve');
  return {
    passed: waiting.length === 0, waiting: waiting, daysLeft: daysLeft,
    status: waiting.length ? 'Waiting for ' + waiting.join('; ') + '.' : 'Passed.',
    byVoter: byVoter, approve: approve, object: object, abstain: abstain
  };
}


// ======================================================================== adopting

function adopt_(pr, kind, t, ctx) {
  var full = gh_('GET', '/repos/' + REPO + '/pulls/' + pr.number);
  if (full.state !== 'open') return;
  var record = 'Approve: ' + (t.approve.join(', ') || 'none') + '. Object: ' + (t.object.join(', ') || 'none') +
               '. Abstain: ' + (t.abstain.join(', ') || 'none') + '.';
  if (full.mergeable === false) {
    var key = 'conflict_' + pr.number + '_' + full.head.sha;
    if (!props().getProperty(key)) {
      gh_('POST', '/repos/' + REPO + '/issues/' + pr.number + '/comments', { body:
        '**Decision passed, but the change cannot be merged automatically** because it conflicts with other changes. ' +
        'A coordinator needs to resolve the conflict; it will then be merged at the next check.\n\n' + record });
      props().setProperty(key, '1');
    }
    return;
  }
  if (full.mergeable !== true) return;       // GitHub is still computing; try at the next check
  gh_('PUT', '/repos/' + REPO + '/pulls/' + pr.number + '/merge', {
    merge_method: 'merge',
    sha: full.head.sha,
    commit_title: 'Adopt: ' + pr.title + ' (#' + pr.number + ')',
    commit_message: 'Adopted as a ' + kind + ' change under the Governance page. ' + record
  });
  gh_('POST', '/repos/' + REPO + '/issues/' + pr.number + '/comments', { body:
    '**Adopted** as a ' + kind + ' change. ' + ctx.rules.kinds[kind].summary + '\n\n' + record +
    '\n\nMerged automatically by the Foundry bot. The decision is recorded in the [decision log](' + SITE + 'activity/decisions/).' });
  var emails = voterEmails_();
  ctx.members.filter(function (m) { return m.voting && emails[m.name]; }).forEach(function (m) {
    mail_(emails[m.name], 'Adopted: ' + pr.title,
      '<p>The proposal <a href="' + pr.html_url + '"><b>' + esc_(pr.title) + '</b></a> has been adopted as a ' + kind +
      ' change and merged.</p><p>' + esc_(record) + '</p>');
  });
}


// ======================================================================== data

/** Parse community/members.yml (a list of flat "key: value" entries). */
function members_() {
  var text = getFile_('community/members.yml').text;
  var out = [], cur = null;
  text.split('\n').forEach(function (line) {
    if (/^\s*#/.test(line) || !line.trim()) return;
    var m = line.match(/^(-\s+|\s+)([A-Za-z_]+):\s*(.*)$/);
    if (!m) return;
    if (m[1].indexOf('-') === 0) { cur = {}; out.push(cur); }
    if (!cur) return;
    var v = m[3].replace(/\s+#.*$/, '').trim();
    if (/^".*"$/.test(v)) v = JSON.parse(v);
    else if (/^'.*'$/.test(v)) v = v.slice(1, -1).replace(/''/g, "'");
    else if (v === 'true') v = true;
    else if (v === 'false') v = false;
    cur[m[2]] = v;
  });
  return out;
}

function voterEmails_() {
  var out = {};
  var sh = sheet_('voters');
  if (!sh) return out;
  sh.getDataRange().getValues().slice(1).forEach(function (r) {
    if (r[0] && /@/.test(r[1])) out[String(r[0]).trim()] = String(r[1]).trim();
  });
  return out;
}

function sheet_(name) { return SpreadsheetApp.openById(props().getProperty('LOG_SHEET_ID')).getSheetByName(name); }

function fmtDate_(d) { return Utilities.formatDate(d, 'UTC', 'd MMMM yyyy'); }
