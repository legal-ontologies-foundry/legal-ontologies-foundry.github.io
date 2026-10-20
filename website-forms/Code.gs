/**
 * Legal Ontologies Foundry: take part without a GitHub account.
 *
 * One Google Form, owned by a coordinator's Google account, lets anyone:
 *   - ask a question or make a suggestion          -> GitHub issue
 *   - comment on an open proposal or discussion    -> issue, pull request, or Discussion comment
 *   - start a discussion                           -> GitHub Discussion
 *   - propose an edit to a page                    -> pull request (or an issue, if the text is not found)
 *   - join the Foundry                             -> pull request adding them to community/members.yml
 *
 * Nothing is posted until the person confirms their email address by clicking a link.
 * Everything is posted by the Foundry's GitHub App (the "bot"), labeled "via website",
 * under the person's name. Email addresses are never published.
 *
 * Setup: see README.md in this folder. In short: paste this file into a new Apps Script
 * project, set the Script properties GITHUB_APP_ID and GITHUB_APP_KEY, deploy as a web app,
 * then run setup() once.
 */

var REPO = 'legal-ontologies-foundry/legal-ontologies-foundry.github.io';
var SITE = 'https://legal-ontologies-foundry.github.io/';
var BASE_BRANCH = 'main';
var MAX_PER_DAY = 5;             // submissions per email address per 24 hours
var CONFIRM_HOURS = 72;          // confirmation links expire after this
var DISCUSSION_CATEGORIES = ['General', 'Ideas', 'Q&A'];

var A = {                        // the five actions, as shown on the form
  ask: 'Ask a question or make a suggestion',
  comment: 'Comment on an open proposal or discussion',
  discuss: 'Start a discussion',
  edit: 'Propose an edit to a page of the website',
  join: 'Join the Foundry'
};

var KINDS = {                    // issue kinds -> labels
  'A question': 'question',
  'A suggestion or idea': 'enhancement',
  'An ontology or vocabulary for the registry': 'registry',
  'A worked example from my jurisdiction or practice': 'worked example',
  'A proposal about how the Foundry is run (governance)': 'governance',
  'A problem with the website': 'website'
};

var Q = {                        // question titles: the form is read back by these
  name: 'Your name',
  email: 'Your email address',
  affiliation: 'Affiliation (optional)',
  action: 'What would you like to do?',
  kind: 'What is it?',
  title: 'Title',
  details: 'Details',
  link: 'Link to the proposal or discussion',
  comment: 'Your comment',
  dTitle: 'Discussion title',
  dCategory: 'Kind of discussion',
  dBody: 'What would you like to discuss?',
  page: 'Link to the page',
  oldText: 'The exact text to change',
  newText: 'Your replacement text',
  why: 'Why (optional)',
  interests: 'Your interests or expertise (optional)',
  github: 'GitHub username (optional)',
  conduct: 'Code of conduct'
};

var PRIVACY =
  'Privacy: your name, affiliation, and what you write will be posted publicly on the Foundry\'s ' +
  'GitHub and website, marked "via website". Your email address is used only to confirm that the ' +
  'submission is yours and to tell you where it was posted; it is never published, and it is ' +
  'stored only in a private log kept by the Foundry\'s coordinators. Nothing is posted until you ' +
  'click the confirmation link we email you.';

function props() { return PropertiesService.getScriptProperties(); }

/**
 * Any public function in an Apps Script web app can be called from its pages, so admin
 * functions check that they are being run from the editor by the project's owner.
 */
function ownerOnly_() {
  var active = Session.getActiveUser().getEmail();
  if (!active || active !== Session.getEffectiveUser().getEmail()) throw new Error('Only the project owner can run this.');
}


// ======================================================================== setup

/** Run once from the editor. Safe to run again: it reuses what already exists. */
function setup() {
  ownerOnly_();
  var p = props();
  if (!p.getProperty('GITHUB_APP_ID') || !p.getProperty('GITHUB_APP_KEY')) {
    throw new Error('First set the Script properties GITHUB_APP_ID and GITHUB_APP_KEY (see README).');
  }
  var form = p.getProperty('FORM_ID') ? FormApp.openById(p.getProperty('FORM_ID')) : buildForm_();
  p.setProperty('FORM_ID', form.getId());

  if (!p.getProperty('LOG_SHEET_ID')) {
    var ss = SpreadsheetApp.create('LOF website submissions (private log)');
    var sh = ss.getSheets()[0];
    sh.setName('log');
    sh.appendRow(['received', 'token', 'email', 'name', 'action', 'payload', 'status', 'result', 'updated']);
    sh.setFrozenRows(1);
    p.setProperty('LOG_SHEET_ID', ss.getId());
  }
  if (!p.getProperty('REVIEW_KEY')) p.setProperty('REVIEW_KEY', Utilities.getUuid());
  if (!p.getProperty('MODERATOR_EMAIL')) p.setProperty('MODERATOR_EMAIL', Session.getEffectiveUser().getEmail());

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'onFormSubmit') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('onFormSubmit').forForm(form).onFormSubmit().create();

  var url = webAppUrl_();
  if (!url) throw new Error('Deploy the project as a web app first (Deploy > New deployment), then run setup() again.');

  // Check the bot can reach the repository, then publish the form links to the site.
  var forms = formsYaml_(form);
  var pr = proposeFile_('community/forms.yml', forms, 'Connect the website participation form',
    'Adds the link to the participation form, so the website can offer "take part without GitHub" links.\n\n' +
    'Opened automatically by setup() in the Apps Script project.', 'setup');
  Logger.log('Form (share this): ' + form.getPublishedUrl());
  Logger.log('Form editor: ' + form.getEditUrl());
  Logger.log('Private log: ' + SpreadsheetApp.openById(p.getProperty('LOG_SHEET_ID')).getUrl());
  Logger.log('Web app: ' + url);
  Logger.log('Pull request to merge: ' + pr);
}

function buildForm_() {
  var f = FormApp.create('Take part in the Legal Ontologies Foundry');
  f.setDescription(
    'Use this form to take part in the Legal Ontologies Foundry without a GitHub account. ' +
    'You can ask a question, comment on a proposal, start a discussion, suggest an edit, or join.\n\n' + PRIVACY);
  f.setConfirmationMessage('Thank you. Check your email (and spam folder) for a confirmation link. ' +
    'Nothing is posted until you click it.');
  f.setAllowResponseEdits(false);
  f.setProgressBar(false);

  f.addTextItem().setTitle(Q.name).setHelpText('Shown publicly with your contribution.').setRequired(true);
  f.addTextItem().setTitle(Q.email).setRequired(true)
    .setHelpText('Private. We send you a confirmation link; it is never published.')
    .setValidation(FormApp.createTextValidation().requireTextIsEmail().build());
  f.addTextItem().setTitle(Q.affiliation).setHelpText('Shown publicly, for example a university, firm, or agency.');
  var action = f.addMultipleChoiceItem().setTitle(Q.action).setRequired(true);

  // Sections. A page break's "go to" applies to the section before it.
  var pAsk = f.addPageBreakItem().setTitle(A.ask);
  f.addMultipleChoiceItem().setTitle(Q.kind).setChoiceValues(Object.keys(KINDS)).setRequired(true);
  f.addTextItem().setTitle(Q.title).setHelpText('One line, for example "Should ODP-002 cover powers of attorney?"').setRequired(true);
  f.addParagraphTextItem().setTitle(Q.details).setRequired(true)
    .setHelpText('Plain language is best. Links are welcome.');

  var pComment = f.addPageBreakItem().setTitle(A.comment);
  f.addTextItem().setTitle(Q.link).setRequired(true)
    .setHelpText('Copy the link from the Activity pages of the website (it begins https://github.com/legal-ontologies-foundry/).');
  f.addParagraphTextItem().setTitle(Q.comment).setRequired(true);

  var pDiscuss = f.addPageBreakItem().setTitle(A.discuss);
  f.addTextItem().setTitle(Q.dTitle).setRequired(true);
  f.addMultipleChoiceItem().setTitle(Q.dCategory).setChoiceValues(DISCUSSION_CATEGORIES).setRequired(true)
    .setHelpText('Q&A for a question you want answered, Ideas for a proposal, General for anything else.');
  f.addParagraphTextItem().setTitle(Q.dBody).setRequired(true);

  var pEdit = f.addPageBreakItem().setTitle(A.edit)
    .setHelpText('Your edit becomes a proposed change that a coordinator reviews before it is adopted.');
  f.addTextItem().setTitle(Q.page).setRequired(true)
    .setHelpText('Copy it from your browser, for example ' + SITE + 'odp/odp-001/');
  f.addParagraphTextItem().setTitle(Q.oldText).setRequired(true)
    .setHelpText('Copy a sentence or paragraph from the page exactly as it appears.');
  f.addParagraphTextItem().setTitle(Q.newText).setRequired(true);
  f.addParagraphTextItem().setTitle(Q.why);

  var pJoin = f.addPageBreakItem().setTitle(A.join)
    .setHelpText('Members are listed on the website. A coordinator confirms new members, usually within a week.');
  f.addParagraphTextItem().setTitle(Q.interests);
  f.addTextItem().setTitle(Q.github).setHelpText('Only if you have one. Not needed.');
  f.addCheckboxItem().setTitle(Q.conduct).setRequired(true)
    .setChoiceValues(['I agree to follow the Foundry\'s code of conduct (' + SITE + 'about/code-of-conduct/)']);

  action.setChoices([
    action.createChoice(A.ask, pAsk),
    action.createChoice(A.comment, pComment),
    action.createChoice(A.discuss, pDiscuss),
    action.createChoice(A.edit, pEdit),
    action.createChoice(A.join, pJoin)
  ]);
  var submit = FormApp.PageNavigationType.SUBMIT;
  pComment.setGoToPage(submit);   // end of "ask"
  pDiscuss.setGoToPage(submit);   // end of "comment"
  pEdit.setGoToPage(submit);      // end of "discuss"
  pJoin.setGoToPage(submit);      // end of "edit"; "join" is last and ends the form
  return f;
}

/** The form link plus prefill field ids, so the site can link straight to the right section. */
function formsYaml_(form) {
  var byTitle = {};
  form.getItems().forEach(function (it) { byTitle[it.getTitle()] = it; });
  var r = form.createResponse()
    .withItemResponse(byTitle[Q.action].asMultipleChoiceItem().createResponse(A.comment))
    .withItemResponse(byTitle[Q.link].asTextItem().createResponse('LINKVALUE'));
  var pre = r.toPrefilledUrl();
  var ids = pre.match(/entry\.\d+/g);
  var actionId = pre.match(/(entry\.\d+)=Comment/)[1];
  var linkId = pre.match(/(entry\.\d+)=LINKVALUE/)[1];
  if (!ids || !actionId || !linkId) throw new Error('Could not read prefill ids from ' + pre);
  return [
    '# Written by setup() in the Apps Script project (website-forms/Code.gs). Edit only if the form changes.',
    'form_url: ' + JSON.stringify(form.getPublishedUrl()),
    'prefill:',
    '  action: ' + JSON.stringify(actionId),
    '  link: ' + JSON.stringify(linkId),
    'actions:',
    '  ask: ' + JSON.stringify(A.ask),
    '  comment: ' + JSON.stringify(A.comment),
    '  discuss: ' + JSON.stringify(A.discuss),
    '  edit: ' + JSON.stringify(A.edit),
    '  join: ' + JSON.stringify(A.join),
    ''
  ].join('\n');
}

function webAppUrl_() {
  return props().getProperty('WEBAPP_URL') || (ScriptApp.getService().isEnabled() ? ScriptApp.getService().getUrl() : '');
}


// ======================================================================== intake

function onFormSubmit(e) {
  var v = {};
  e.response.getItemResponses().forEach(function (ir) {
    var x = ir.getResponse();
    v[ir.getItem().getTitle()] = Array.isArray(x) ? x.join(', ') : String(x || '').trim();
  });
  var email = (v[Q.email] || '').toLowerCase();
  var name = clip_(v[Q.name], 100);
  var actionKey = Object.keys(A).filter(function (k) { return A[k] === v[Q.action]; })[0];
  if (!email || !name || !actionKey) return;

  var sh = log_();
  if (recentCount_(sh, email) >= MAX_PER_DAY) {
    mail_(email, 'Your Legal Ontologies Foundry submission was not posted',
      '<p>Hello ' + esc_(name) + ',</p><p>We received more than ' + MAX_PER_DAY + ' submissions from this ' +
      'address in a day, so this one was not posted. Please try again tomorrow, or write to the ' +
      'coordinators by replying to this email.</p>');
    return;
  }
  var payload = {
    name: name, affiliation: clip_(v[Q.affiliation], 150),
    kind: v[Q.kind], title: clip_(v[Q.title], 200), details: v[Q.details],
    link: v[Q.link], comment: v[Q.comment],
    dTitle: clip_(v[Q.dTitle], 200), dCategory: v[Q.dCategory], dBody: v[Q.dBody],
    page: v[Q.page], oldText: v[Q.oldText], newText: v[Q.newText], why: v[Q.why],
    interests: v[Q.interests], github: (v[Q.github] || '').replace(/^@/, '').replace(/[^A-Za-z0-9-]/g, '')
  };
  var token = Utilities.getUuid();
  sh.appendRow([new Date(), token, email, name, actionKey, JSON.stringify(payload), 'awaiting confirmation', '', new Date()]);

  var link = webAppUrl_() + '?confirm=' + token;
  mail_(email, 'Please confirm your Legal Ontologies Foundry submission',
    '<p>Hello ' + esc_(name) + ',</p>' +
    '<p>Thank you for your submission to the Legal Ontologies Foundry: <b>' + esc_(A[actionKey]) + '</b>.</p>' +
    '<p><a href="' + link + '">Confirm and post it</a></p>' +
    '<p>Nothing is posted until you click the link. It expires in ' + CONFIRM_HOURS + ' hours. ' +
    'If you did not submit anything, ignore this email.</p>' +
    '<p style="color:#666">' + esc_(PRIVACY) + '</p>');
}


// ======================================================================== confirmation and review

function doGet(e) {
  var q = e.parameter || {};
  try {
    if (q.confirm) return page_(confirm_(q.confirm));
    if (q.ballot) return page_(ballotPage_(q.ballot));
    if (q.vote !== undefined || /(^|&)vote(=|&|$)/.test(e.queryString || '')) return page_(votePage_());
    if (q.approve && q.key === props().getProperty('REVIEW_KEY')) return page_(approve_(q.approve));
    return page_({ title: 'Legal Ontologies Foundry', html: '<p><a href="' + SITE + '">Go to the Foundry website</a>.</p>' });
  } catch (err) {
    console.error(err && err.stack || err);
    var what = q.confirm ? 'Your submission could not be posted just now. You do not need to submit it again: ' +
               'try this link again in a few minutes, or reply to the confirmation email.'
             : 'This page could not be loaded just now. Please try again in a few minutes.';
    return page_({ title: 'Something went wrong',
      html: '<p>' + what + '</p><p style="color:#666;font-size:.9em">Details for the coordinators: ' +
            esc_(String(err && err.message || err)).slice(0, 300) + '</p>' });
  }
}

function confirm_(token) {
  var row = findRow_(token);
  if (!row) return { title: 'Link not recognized', html: '<p>This confirmation link is not valid.</p>' };
  var r = row.values;
  if (r[6] === 'posted') return done_(r[7]);
  if (r[6] === 'awaiting review') return { title: 'Thank you', html: '<p>Your submission is confirmed and waiting for a coordinator to review it. We will email you when it is posted.</p>' };
  if (r[6] !== 'awaiting confirmation') return { title: 'Not posted', html: '<p>This submission was not posted (' + esc_(r[6]) + ').</p>' };
  if ((new Date() - new Date(r[0])) / 36e5 > CONFIRM_HOURS) {
    setStatus_(row, 'expired', '');
    return { title: 'Link expired', html: '<p>This link has expired. Please <a href="' + SITE + 'activity/participate/">submit again</a>.</p>' };
  }
  if (props().getProperty('HOLD_FOR_REVIEW') === 'true') {
    setStatus_(row, 'awaiting review', '');
    var mod = props().getProperty('MODERATOR_EMAIL');
    var url = webAppUrl_() + '?approve=' + token + '&key=' + props().getProperty('REVIEW_KEY');
    mail_(mod, 'LOF website submission to review: ' + A[r[4]],
      '<p>From ' + esc_(r[3]) + ' (' + esc_(r[2]) + ')</p><pre style="white-space:pre-wrap">' +
      esc_(JSON.stringify(JSON.parse(r[5]), null, 2)) + '</pre><p><a href="' + url + '">Approve and post</a></p>' +
      '<p>To decline, do nothing, or mark the row "declined" in the log.</p>');
    return { title: 'Thank you', html: '<p>Your submission is confirmed. A coordinator will review it shortly, and we will email you when it is posted.</p>' };
  }
  return publish_(row);
}

function approve_(token) {
  var row = findRow_(token);
  if (!row) return { title: 'Not found', html: '<p>No such submission.</p>' };
  if (row.values[6] === 'posted') return done_(row.values[7]);
  if (row.values[6] !== 'awaiting review') return { title: 'Not posted', html: '<p>Status: ' + esc_(row.values[6]) + '</p>' };
  var res = publish_(row);
  mail_(row.values[2], 'Your Legal Ontologies Foundry submission is posted',
    '<p>Hello ' + esc_(row.values[3]) + ',</p><p>Your submission has been posted: <a href="' + setUrl_(row) + '">' + setUrl_(row) + '</a></p>');
  return res;
}

function publish_(row) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var fresh = findRow_(row.values[1]);
    if (fresh.values[6] === 'posted') return done_(fresh.values[7]);
    var url = post_(fresh.values[4], JSON.parse(fresh.values[5]));
    setStatus_(fresh, 'posted', url);
    return done_(url);
  } finally {
    lock.releaseLock();
  }
}

function setUrl_(row) { return findRow_(row.values[1]).values[7]; }

function done_(url) {
  return { title: 'Posted. Thank you!',
    html: '<p>Your contribution is now public: <a href="' + esc_(url) + '">' + esc_(url) + '</a></p>' +
          '<p>It will also appear on the website\'s <a href="' + SITE + 'activity/">Activity pages</a> within the hour.</p>' };
}

function page_(p) {
  return HtmlService.createHtmlOutput(
    '<base target="_top"><div style="font-family:system-ui,sans-serif;max-width:40rem;margin:3rem auto;padding:0 1rem;line-height:1.5">' +
    '<p style="color:#3f51b5;font-weight:600">Legal Ontologies Foundry</p><h1 style="font-weight:400">' + esc_(p.title) + '</h1>' +
    p.html + '</div>').setTitle(p.title);
}


// ======================================================================== posting to GitHub

function post_(action, p) {
  var by = '**' + p.name + '**' + (p.affiliation ? ' (' + p.affiliation + ')' : '');
  var sig = '\n\n---\n*Submitted through the [Foundry website](' + SITE + 'activity/participate/) by ' + by +
            '. Email address confirmed and kept private.*';

  if (action === 'ask') {
    var label = KINDS[p.kind] || 'question';
    return gh_('POST', '/repos/' + REPO + '/issues', {
      title: p.title, body: tidy_(p.details) + sig, labels: ['via website', label]
    }).html_url;
  }

  if (action === 'comment') {
    var m = String(p.link).match(/github\.com\/legal-ontologies-foundry\/legal-ontologies-foundry\.github\.io\/(issues|pull|discussions)\/(\d+)/);
    var bare = String(p.link).match(/^\s*#?(\d+)\s*$/);
    if (!m && bare) m = [null, 'issues', bare[1]];
    if (!m) throw new Error('Unrecognized link: ' + p.link);
    var body = tidy_(p.comment) + sig;
    if (m[1] === 'discussions') {
      var d = gql_('query($o:String!,$n:String!,$num:Int!){repository(owner:$o,name:$n){discussion(number:$num){id url}}}',
        { o: owner_(), n: name_(), num: Number(m[2]) }).repository.discussion;
      var c = gql_('mutation($id:ID!,$b:String!){addDiscussionComment(input:{discussionId:$id,body:$b}){comment{url}}}',
        { id: d.id, b: body });
      return c.addDiscussionComment.comment.url;
    }
    return gh_('POST', '/repos/' + REPO + '/issues/' + m[2] + '/comments', { body: body }).html_url;
  }

  if (action === 'discuss') {
    var r = gql_('query($o:String!,$n:String!){repository(owner:$o,name:$n){id discussionCategories(first:25){nodes{id name}}}}',
      { o: owner_(), n: name_() }).repository;
    var cats = r.discussionCategories.nodes;
    var cat = cats.filter(function (x) { return x.name === p.dCategory; })[0] ||
              cats.filter(function (x) { return x.name === 'General'; })[0] || cats[0];
    var out = gql_('mutation($r:ID!,$c:ID!,$t:String!,$b:String!){createDiscussion(input:{repositoryId:$r,categoryId:$c,title:$t,body:$b}){discussion{url}}}',
      { r: r.id, c: cat.id, t: p.dTitle, b: tidy_(p.dBody) + sig });
    return out.createDiscussion.discussion.url;
  }

  if (action === 'edit') return proposeEdit_(p, sig);

  if (action === 'join') {
    var file = getFile_('community/members.yml');
    var entry = '- name: ' + JSON.stringify(p.name) + '\n' +
      (p.affiliation ? '  affiliation: ' + JSON.stringify(p.affiliation) + '\n' : '') +
      '  role: member\n' +
      (p.github ? '  github: ' + p.github + '\n' : '') +
      '  joined: ' + Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM') + '\n';
    var text = file.text.replace(/\s*$/, '\n') + entry;
    var body2 = by + ' asks to join the Foundry.' +
      (p.interests ? '\n\n**Interests or expertise**\n\n' + tidy_(p.interests) : '') +
      '\n\nThey agreed to the code of conduct. Merging this adds them to the Members page.' + sig;
    return commitAndPropose_('community/members.yml', file.sha, text, 'Add ' + p.name + ' as a member', body2,
      'join', ['via website', 'membership']);
  }
  throw new Error('Unknown action ' + action);
}

/** Replace the quoted text in the page's source and open a pull request; fall back to an issue. */
function proposeEdit_(p, sig) {
  var path = sourcePath_(p.page);
  var why = p.why ? '\n\n**Why**\n\n' + tidy_(p.why) : '';
  var quoted = '\n\n**Current text**\n\n' + quote_(p.oldText) + '\n\n**Suggested text**\n\n' + quote_(p.newText);
  if (path) {
    var file = getFile_(path);
    var h1 = file.text.match(/^# (.+)$/m);
    var label = h1 ? h1[1].trim() : pageName_(p.page);
    var src = file.text, old = p.oldText.replace(/\r\n/g, '\n').trim();
    var at = src.indexOf(old);
    if (at < 0) {                               // tolerate differences in spacing and line breaks
      var re = new RegExp(old.split(/\s+/).map(reEsc_).join('\\s+'));
      var mm = src.match(re);
      if (mm && src.split(mm[0]).length === 2) { old = mm[0]; at = mm.index; }
    }
    if (at >= 0 && src.split(old).length === 2) {
      var text = src.slice(0, at) + p.newText.replace(/\r\n/g, '\n').trim() + src.slice(at + old.length);
      return commitAndPropose_(path, file.sha, text, 'Suggested edit to ' + label,
        by_(p) + ' suggests this edit to [' + label + '](' + p.page + ').' + why + quoted + sig,
        'edit', ['via website', 'suggested edit']);
    }
  }
  return gh_('POST', '/repos/' + REPO + '/issues', {
    title: 'Suggested edit to ' + pageName_(p.page),
    body: by_(p) + ' suggests an edit to [' + pageName_(p.page) + '](' + p.page + '). The text could not be matched ' +
          'automatically, so a coordinator will apply it by hand.' + why + quoted + sig,
    labels: ['via website', 'suggested edit']
  }).html_url;
}

function commitAndPropose_(path, sha, text, title, body, slug, labels) {
  var base = gh_('GET', '/repos/' + REPO + '/git/ref/heads/' + BASE_BRANCH).object.sha;
  var branch = 'website/' + slug + '-' + Utilities.formatDate(new Date(), 'UTC', 'yyyyMMdd-HHmmss');
  gh_('POST', '/repos/' + REPO + '/git/refs', { ref: 'refs/heads/' + branch, sha: base });
  gh_('PUT', '/repos/' + REPO + '/contents/' + encodePath_(path), {
    message: title, branch: branch, sha: sha,
    content: Utilities.base64Encode(text, Utilities.Charset.UTF_8)
  });
  var pr = gh_('POST', '/repos/' + REPO + '/pulls', { title: title, head: branch, base: BASE_BRANCH, body: body });
  if (labels) gh_('POST', '/repos/' + REPO + '/issues/' + pr.number + '/labels', { labels: labels });
  return pr.html_url;
}

function proposeFile_(path, text, title, body, slug) {
  var sha;
  try { var f = getFile_(path); if (f.text === text) return '(no change needed)'; sha = f.sha; } catch (err) { sha = undefined; }
  var base = gh_('GET', '/repos/' + REPO + '/git/ref/heads/' + BASE_BRANCH).object.sha;
  var branch = 'website/' + slug + '-' + Utilities.formatDate(new Date(), 'UTC', 'yyyyMMdd-HHmmss');
  gh_('POST', '/repos/' + REPO + '/git/refs', { ref: 'refs/heads/' + branch, sha: base });
  var put = { message: title, branch: branch, content: Utilities.base64Encode(text, Utilities.Charset.UTF_8) };
  if (sha) put.sha = sha;
  gh_('PUT', '/repos/' + REPO + '/contents/' + encodePath_(path), put);
  return gh_('POST', '/repos/' + REPO + '/pulls', { title: title, head: branch, base: BASE_BRANCH, body: body }).html_url;
}

function getFile_(path) {
  var f = gh_('GET', '/repos/' + REPO + '/contents/' + encodePath_(path) + '?ref=' + BASE_BRANCH);
  var bytes = Utilities.base64Decode(f.content.replace(/\s/g, ''));
  return { sha: f.sha, text: Utilities.newBlob(bytes).getDataAsString('UTF-8') };
}

/** Site page URL -> its Markdown source in docs/. */
function sourcePath_(url) {
  var m = String(url).trim().match(/^https?:\/\/legal-ontologies-foundry\.github\.io\/([^?#]*)/);
  if (!m) return null;
  var stem = m[1].replace(/index\.html$/, '').replace(/\/+$/, '');
  var tries = stem ? ['docs/' + stem + '.md', 'docs/' + stem + '/index.md'] : ['docs/index.md'];
  for (var i = 0; i < tries.length; i++) {
    try { getFile_(tries[i]); return tries[i]; } catch (err) { /* try next */ }
  }
  return null;
}

function pageName_(url) {
  var m = String(url).match(/github\.io\/([^?#]*)/);
  return m && m[1].replace(/\/+$/, '') ? m[1].replace(/\/+$/, '') : 'the home page';
}
function by_(p) { return '**' + p.name + '**' + (p.affiliation ? ' (' + p.affiliation + ')' : ''); }


// ======================================================================== GitHub App authentication

function gh_(method, path, body) {
  var opt = { method: method.toLowerCase(), muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + installationToken_(), Accept: 'application/vnd.github+json',
               'X-GitHub-Api-Version': '2022-11-28' } };
  if (body) { opt.contentType = 'application/json'; opt.payload = JSON.stringify(body); }
  var res = UrlFetchApp.fetch('https://api.github.com' + path, opt);
  var code = res.getResponseCode();
  if (code >= 300) throw new Error('GitHub ' + method + ' ' + path + ' -> ' + code + ': ' + res.getContentText().slice(0, 400));
  return code === 204 ? {} : JSON.parse(res.getContentText());
}

function gql_(query, variables) {
  var out = gh_('POST', '/graphql', { query: query, variables: variables });
  if (out.errors) throw new Error('GitHub GraphQL: ' + JSON.stringify(out.errors).slice(0, 400));
  return out.data;
}

function installationToken_() {
  var cache = CacheService.getScriptCache();
  var t = cache.get('gh_token');
  if (t) return t;
  var jwt = appJwt_();
  var hdr = { Authorization: 'Bearer ' + jwt, Accept: 'application/vnd.github+json' };
  var get = function (url, method) {
    var res = UrlFetchApp.fetch(url, { method: method || 'get', headers: hdr, muteHttpExceptions: true });
    if (res.getResponseCode() >= 300) {
      throw new Error('GitHub App sign-in failed (' + res.getResponseCode() + ' from ' + url + '): ' +
        res.getContentText().slice(0, 300) + '. Check GITHUB_APP_ID, GITHUB_APP_KEY, and that the app is installed on the repository.');
    }
    return JSON.parse(res.getContentText());
  };
  var inst = get('https://api.github.com/repos/' + REPO + '/installation');
  var tok = get('https://api.github.com/app/installations/' + inst.id + '/access_tokens', 'post');
  cache.put('gh_token', tok.token, 50 * 60);       // tokens last 60 minutes
  return tok.token;
}

function appJwt_() {
  var now = Math.floor(Date.now() / 1000);
  var enc = function (o) { return b64url_(Utilities.base64EncodeWebSafe(JSON.stringify(o), Utilities.Charset.UTF_8)); };
  var input = enc({ alg: 'RS256', typ: 'JWT' }) + '.' +
              enc({ iat: now - 60, exp: now + 540, iss: String(props().getProperty('GITHUB_APP_ID')).trim() });
  var sig = Utilities.computeRsaSha256Signature(input, pkcs8Pem_(props().getProperty('GITHUB_APP_KEY')));
  return input + '.' + b64url_(Utilities.base64EncodeWebSafe(sig));
}

function b64url_(s) { return s.replace(/=+$/, ''); }

/**
 * GitHub issues "BEGIN RSA PRIVATE KEY" (PKCS#1) keys; Apps Script needs "BEGIN PRIVATE KEY" (PKCS#8).
 * This accepts either, even if line breaks were lost when pasting, and returns PKCS#8 PEM.
 */
function pkcs8Pem_(pem) {
  pem = String(pem || '');
  var isPkcs1 = /BEGIN RSA PRIVATE KEY/.test(pem);
  var b64 = pem.replace(/-----(BEGIN|END)[A-Z ]*-----/g, '').replace(/[^A-Za-z0-9+\/=]/g, '');
  if (!b64) throw new Error('GITHUB_APP_KEY is empty or not a PEM key.');
  if (isPkcs1) {
    var der = Utilities.base64Decode(b64).map(function (b) { return b & 255; });
    var algo = [0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00];
    var octet = [0x04].concat(derLen_(der.length), der);
    var inner = [0x02, 0x01, 0x00].concat(algo, octet);
    var all = [0x30].concat(derLen_(inner.length), inner);
    b64 = Utilities.base64Encode(all.map(function (b) { return b > 127 ? b - 256 : b; }));
  }
  return '-----BEGIN PRIVATE KEY-----\n' + b64.match(/.{1,64}/g).join('\n') + '\n-----END PRIVATE KEY-----\n';
}

function derLen_(n) {
  if (n < 128) return [n];
  if (n < 256) return [0x81, n];
  if (n < 65536) return [0x82, n >> 8, n & 255];
  return [0x83, n >> 16, (n >> 8) & 255, n & 255];
}


// ======================================================================== helpers

function log_() { return SpreadsheetApp.openById(props().getProperty('LOG_SHEET_ID')).getSheetByName('log'); }

function findRow_(token) {
  var sh = log_();
  var hit = sh.getRange('B:B').createTextFinder(token).matchEntireCell(true).findNext();
  if (!hit) return null;
  var r = hit.getRow();
  return { sheet: sh, row: r, values: sh.getRange(r, 1, 1, 9).getValues()[0] };
}

function setStatus_(row, status, result) {
  row.sheet.getRange(row.row, 7, 1, 3).setValues([[status, result, new Date()]]);
  row.values[6] = status; row.values[7] = result;
}

function recentCount_(sh, email) {
  var n = sh.getLastRow();
  if (n < 2) return 0;
  var since = Date.now() - 24 * 36e5;
  return sh.getRange(2, 1, n - 1, 3).getValues().filter(function (r) {
    return r[2] === email && new Date(r[0]).getTime() > since;
  }).length;
}

function mail_(to, subject, html) {
  MailApp.sendEmail({ to: to, subject: subject, htmlBody: html, name: 'Legal Ontologies Foundry' });
}

/** Neutralize @mentions (so submissions cannot ping people) and raw HTML. */
function tidy_(s) {
  return String(s || '').replace(/\r\n/g, '\n').trim()
    .replace(/@(?=[A-Za-z0-9])/g, '@⁠')
    .replace(/</g, '&lt;');
}
function quote_(s) { return tidy_(s).split('\n').map(function (l) { return '> ' + l; }).join('\n'); }
function clip_(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n) : s; }
function esc_(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function reEsc_(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function encodePath_(p) { return p.split('/').map(encodeURIComponent).join('/'); }
function owner_() { return REPO.split('/')[0]; }
function name_() { return REPO.split('/')[1]; }

/** Run after changing the app's permissions on GitHub, so the next call picks them up. */
function resetToken() {
  ownerOnly_();
  CacheService.getScriptCache().remove('gh_token');
  Logger.log('Cleared. The next call signs in again with the app\'s current permissions.');
}

/** Optional: run from the editor to check the bot can reach the repository. */
function testConnection() {
  var r = gh_('GET', '/repos/' + REPO);
  Logger.log('Connected to ' + r.full_name + ' as the Foundry bot.');
}
