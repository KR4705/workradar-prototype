# WorkRadar — Read-only cross-platform work intelligence

WorkRadar is a demo application for viewing work signals across Jira and Slack. It highlights blocked, aging, and important work, provides an AI-style summary derived from mock data, and links insights to inspectable source evidence.

## Product flow
1. **Dashboard:** See counts of blocked, aging, and attention-worthy work; read an AI-style generated mock-data recap.
2. **Priority Feed:** Browse ranked work, filter by priority, source, owner, status or age, and open a detail.
3. **Search:** Find work by ID, title, owner, source, project, or supported natural-language filters.
4. **Details:** Understand context, source facts, rationale, timeline, and suggested next step. Follow the link to its Jira/Slack evidence.
5. **Evidence preview:** On Item Details, open the mock Jira issue or Slack conversation in a sandboxed iframe modal. Close the modal to return to the same WorkRadar detail.
6. **Preview States:** Inspect empty dashboard/feed/search and simulated source-error states for presentation purposes.

## Source fixture coverage
AUTH-234 (security approval), PLAT-118 (CI failures), MOB-072 (mobile crash follow-up), OPS-091 (aging access automation), DATA-406 (taxonomy dependency), WEB-319 (localization progress). All issues and Slack conversations in `src/mockEvidence.ts` are fictional.

## Scope and boundaries
WorkRadar is **read-only**. It **does not** assign, edit, complete, or snooze tasks, and does not write to Jira or Slack. Ownership is a source attribute displayed for context, not an editable assignment workflow. The summary is a deterministic AI-style simulation from mock source data; no external model or live integration is connected. The reference snapshot is October 2026. Source views emulate common Jira/Slack record structures, not their official applications. Suggestions describe what a person could do back in their original tools.

## Local preview
Requires Node.js 22+:
```sh
npm install
npm run dev
npm run build
```

## Presentation walkthrough
Start at Dashboard → AUTH-234 Item Details → Jira preview modal → Slack preview modal → Priority Feed. Then open OPS-091 to highlight aging work and Search for its issue key. Finish by showing how each summary/evidence link remains traceable to the original mock source. Use Preview States to show graceful empty and error behavior.

## QA before merge
Run `npm run build`, then check Dashboard, Feed, Search, Details, Jira and Slack iframe modals, close/reopen behavior, and empty/error previews in desktop and mobile layouts. Verify no Assign, Mark Done, Snooze, follow-up toggle, or reset-action control is present.
