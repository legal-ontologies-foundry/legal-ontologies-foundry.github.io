# Website participation form

Lets anyone take part in the Foundry without a GitHub account. A Google Form collects the
contribution; this Apps Script emails the person a confirmation link and, once they click it, posts the
contribution to GitHub through the Foundry's GitHub App (the bot), labeled `via website`.

| On the form | Becomes on GitHub |
|---|---|
| Ask a question or make a suggestion | an issue, labeled by kind (question, registry, governance, ...) |
| Comment on an open proposal or discussion | a comment on that issue, pull request, or Discussion |
| Start a discussion | a Discussion (General, Ideas, or Q&A) |
| Propose an edit to a page | a pull request changing the page, or an issue if the text cannot be matched |
| Join the Foundry | a pull request adding the person to `community/members.yml` |

Nothing is adopted automatically: pull requests still need a coordinator to merge them.

## Setting it up (about 15 minutes, once)

You need the GitHub App's **App ID** and its **private key** (`.pem` file), and the app installed on this
repository.

1. **Create the project.** Signed in to the Google account that will own the form, go to
   <https://script.google.com>, click **New project**, and name it *LOF website form*.
   Delete the sample code and paste in all of [`Code.gs`](Code.gs). Click **Save**.

2. **Add the bot's credentials.** Click the gear icon (**Project Settings**), scroll to
   **Script properties**, and add:

    | Property | Value |
    |---|---|
    | `GITHUB_APP_ID` | the App ID, for example `5357909` |
    | `GITHUB_APP_KEY` | the whole contents of the `.pem` file: open it in a text editor, select all, copy, paste |

    The key can be pasted as is; it does not matter if the line breaks are lost.
    Click **Save script properties**.

3. **Publish the confirmation page.** Click **Deploy > New deployment**, choose the type **Web app**,
   set *Execute as* to **Me** and *Who has access* to **Anyone**, and click **Deploy**.
   Google asks you to authorize the project: choose your account, then **Advanced >
   Go to LOF website form (unsafe)** (this warning appears for any script that is not published
   on Google's marketplace), then **Allow**. Copy the **Web app URL** it shows.
   Back in **Project Settings > Script properties**, add `WEBAPP_URL` with that URL.

4. **Run setup.** In the editor, choose the function **setup** in the toolbar and click **Run**.
   It creates the form and a private log spreadsheet in your Google Drive, connects them to the
   script, checks that the bot can reach GitHub, and opens a pull request that adds the form's link
   to the website (`community/forms.yml`). The execution log lists the form, the log, and the pull request.

5. **Merge the pull request.** Within the hour the website shows *Take part without GitHub*
   links on every proposal and discussion.

To check the connection alone at any time, run **testConnection**.

## Voting on proposals

[`Voting.gs`](Voting.gs) lets voting members decide proposals from a personal ballot link, without GitHub.

**Opening a decision.** A coordinator adds the label `decision: routine` or `decision: substantive` to a
pull request that is ready (not a draft). Within 15 minutes each voting member is emailed a ballot link.
The ballot page shows the proposal, the rule, and the count so far, with Approve, Object, and Abstain
buttons and a box for reasons. Each vote is posted on the pull request under the voter's name.

**Signing in on the website.** Voting members can also sign in on the website (*Activity > Sign in*)
with their email address: they get a one-time link, then stay signed in on that browser for 60 days.
Signed in, each proposal under *Open for decision* shows the full text, their current vote, and
Approve / Object / Abstain buttons. Sign-ins are kept, as hashes only, in the private log's
`sessions` tab (created automatically). The site talks to the web app through `doPost` in `Voting.gs`.

**Counting.** Votes cast with a ballot and approvals or "changes requested" reviews given on GitHub by
voting members both count; a member's latest vote is the one that counts. The rules are in
[`community/decision-rules.json`](../community/decision-rules.json); the website shows the count under
*Open for decision* on the Open proposals page.

**Adopting.** When the rule is satisfied, the bot merges the pull request, records the decision on it,
and emails the voters. Set `"auto_merge": false` in the rules file to have it stop at recording the
result instead. If the change conflicts with other changes, the bot says so and waits for a coordinator.

**Who votes.** Members marked `voting: true` in `community/members.yml`; Operations Committee members are
also marked `committee: true`. To add a voter, add those markers (by pull request) and their email address
in the private log's `voters` tab.

**Setup, once.**

1. In the Apps Script project, replace `Code.gs` with the new version, and add a second script file
   (**+** next to *Files*, then **Script**) named `Voting`, containing [`Voting.gs`](Voting.gs). Save.
2. Choose **setupVoting** in the toolbar and click **Run**. It adds `voters` and `ballots` tabs to the
   private log and starts the 15-minute check.
3. In the `voters` tab, fill in each voting member's email address.
4. **Deploy > Manage deployments > Edit (pencil) > Version: New version > Deploy**, so the web app serves
   ballot pages.

## Weekly digest

[`Digest.gs`](Digest.gs) emails subscribers a weekly summary of the Foundry's activity, with links:
proposals open for decision (with a reminder to voting members who have not yet voted), decisions made,
new proposals, questions and discussions, conversations with new replies, questions resolved, and new
members. Weeks with no activity are skipped. It goes out on Monday mornings, in the project's time zone.

**Who receives it.** Voting members, people who join through the website (added automatically), and
anyone who subscribes on the website (after confirming by email). Subscribers are kept in the private
log's `subscribers` tab; every digest has an unsubscribe link.

**Setup, once.**

1. Add a script file named `Digest` containing [`Digest.gs`](Digest.gs), and update `Code.gs` and
   `Voting.gs` to their latest versions. Save.
2. Run **setupDigest**. It creates the `subscribers` tab, adds the voting members and website joiners,
   and schedules the Monday digest.
3. Run **previewDigest** to email yourself this week's digest.
4. **Deploy > Manage deployments > Edit > Version: New version > Deploy.**

A free Gmail account can send about 100 emails a day, which bounds the number of subscribers
the digest can reach.

## Running it

- **Private log.** Every submission is a row in the spreadsheet *LOF website submissions (private log)*,
  with its status: awaiting confirmation, posted (with the link), expired, or awaiting review.
  Share it only with coordinators: it holds email addresses.
- **Hold for review.** To approve each submission before it is posted, add the Script property
  `HOLD_FOR_REVIEW` = `true`. Confirmed submissions are then emailed to `MODERATOR_EMAIL`
  (by default the owner's address) with an *Approve and post* link.
- **Limits.** Five submissions per email address per day. Confirmation links expire after 72 hours.
  A free Gmail account can send about 100 emails a day.
- **Changing the form.** Edit `Code.gs` and the form together: the script reads answers by question
  title. If you rebuild the form, delete the `FORM_ID` property and run `setup` again.
- **Updating the script.** Paste the new `Code.gs`, save, then **Deploy > Manage deployments >
  Edit > Version: New version > Deploy**, so the confirmation page uses the new code.
- **Safety.** Posted text cannot @-mention people or include HTML. The bot can write only to this
  repository. To stop all posting at once, delete the `GITHUB_APP_KEY` property, or suspend the app
  in the organization's GitHub settings.
