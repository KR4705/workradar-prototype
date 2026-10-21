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
