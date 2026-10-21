# WorkRadar — functional UI prototype

Apple-inspired desktop-first WorkRadar prototype, adapted from the supplied Figma Make export.

## Running locally

Requires Node.js 22+ and internet access to install packages:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. For production output run `npm run build` and serve `dist/` with a static host. All current data is locally mocked; no backend is required.

## What is interactive

- Dashboard, Priority Feed, Item Details, Search, and state showcase navigation.
- Click through work-item rows into details and back.
- Priority Feed priority tabs and owner, status, source, minimum-age filters (including no-match behavior and reset).
- Search with keyword matching, a constrained set of natural-language rules (e.g. `high priority blocked over 14 days`), owner/status/source/priority filters and a no-results state.
- Expandable evidence, timeline and prioritization sections on item details.
- Follow-up noted toggle, saved in browser localStorage, without changing source tool status.
- Bottom-corner “Preview States” panel to switch between six demo scenarios including integration failure; retry simulates recovery, not a real sync.

## Important boundaries

This is a **working prototype**, not a production-ready connected service. Jira and Slack source records are **sample evidence**. Their original URLs were not supplied in the export, so the UI does not fabricate them. No actual Jira/Slack access, synchronization, authentication, notifications, role-based permissions, or LLM service is implemented. Search language understanding is deliberately narrow, not an AI search backend. Dates are a fixed October 19, 2026 demo snapshot. Do not use mock evidence to make real work decisions.

## QA walkthrough

1. Dashboard → select any work row → Item Details → expand each disclosure → back.
2. Priority Feed → enable advanced filters → choose Jira and a status → clear filters; try incompatible filters to show no-match state.
3. Search `blocked`, `Maya`, `high priority blocked over 14 days`, and `xyz-no-matching-work-item-999`; test the Clear filters action.
4. Open an item, click “Mark follow-up noted”, refresh and verify local persistence.
5. Open “Preview States” and select every scenario: Default, Empty Search, Empty Priority Feed, No Dashboard Data, Integration Error, No Integrations. Retry the error, and reset to Default.
6. Verify 1440×900 desktop layout plus a narrow/mobile viewport, keyboard focus, and scrolling.

## Known validation limitation

The dependencies could not be installed within this execution environment (the install timed out), so a Vite build and browser end-to-end test could **not** be completed here. Source edits were manually reviewed and the original TypeScript syntax issues in `src/App.tsx` were corrected. Run `npm install && npm run build` in your own development environment before deployment.


## Functional demo workflow (feature branch)

All items share a single React store, persisted in browser localStorage. Demo edits do not write to Jira or Slack.

1. **Dashboard:** Review live mock-work counts, aging work and the simulated AI summary. Click numbered evidence to open an item.
2. **Priority Feed:** Filter by priority, owner, age and source, then open an item.
3. **Assign:** On details, pick a teammate and click Assign. The new owner appears in detail, feed and search immediately.
4. **Mark Done:** Click Mark Done on an active item. It disappears from active dashboard/feed lists, but remains searchable by ID or name (including Done status).
5. **Snooze:** Click Snooze 3 days on an active item. It disappears from active lists, but stays searchable. Snooze is based on the fixed demo date October 21, 2026.
6. **Search:** Search by ID/title/owner/status, open the result and review the action.
7. **Reset demo data:** Use the fixed bottom-right button to restore the original six mock items and clear follow-up notes.
8. **Error and empty states:** Use the existing Preview States control to show no results and source failures.

**AI boundary:** The dashboard summary is deterministic text generated from the current mock item counts. It demonstrates the AI experience but does not call an LLM.

**QA before merging:** Run `npm install && npm run build`, deploy the feature branch preview, then manually exercise Assign, Done, Snooze, Search and Reset with browser refreshes. This branch has not been browser-tested here.

## Evidence-first demo data (Jira and Slack fixtures)

Choose the discreet **Demo Data** button at the bottom of the sidebar. Six linked records are available: AUTH-234, PLAT-118, MOB-072, OPS-091, DATA-406, and WEB-319. Choose an issue, switch between Jira issue and Slack thread, inspect source metadata and dated messages, and open the linked WorkRadar item. From Item Details, follow **Open mock Jira issue and Slack thread** to return to the source evidence. Data is defined in `src/mockEvidence.ts` and rendered in `src/App.tsx`.

The issue cards emulate Jira's common issue fields and issue activity; Slack cards emulate message threads, author/timestamp headers and channel context. They are purpose-built fictional fixtures, not exports from Atlassian or Salesforce and not exact reproductions of those vendors' interfaces. The demo reference date is 21 October 2026. Fixture text and original timestamps do not change when assigning or completing work locally: local WorkRadar action state is clearly separate from source-system evidence.

Suggested narrative: Source first (AUTH-234 Jira and #identity-platform), follow the security review discussion, open the WorkRadar explanation, assign the issue, confirm it updates in the feed/search, and return to the source viewer. Repeat for OPS-091 to illustrate long-pending deprioritized work and PLAT-118 for urgent operational impact. Use Reset demo data when done.

Before merge or deployment, run `npm install && npm run build` and smoke-test the source links, route state, responsive layout, and interactions. This commit is not automatically deployed.
