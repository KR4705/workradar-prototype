export type MockMessage = { timestamp: string; author: string; text: string }
export type MockEvidence = { id: string; issueType: string; assignee: string; created: string; updated: string; description: string; channel: string; messages: MockMessage[] }
export const mockEvidence: MockEvidence[] = [
  {
    "id": "AUTH-234",
    "issueType": "Story",
    "assignee": "Maya Chen",
    "created": "2026-10-01",
    "updated": "2026-10-18",
    "description": "Security sign-off for token rotation and session migration is still pending. Release is blocked until the appointed security reviewer approves the rollout.",
    "channel": "identity-platform",
    "messages": [
      {
        "timestamp": "2026-10-17 09:40",
        "author": "Maya Chen",
        "text": "AUTH-234 is ready technically, but security approval is still missing. Can we confirm the reviewer?"
      },
      {
        "timestamp": "2026-10-17 10:04",
        "author": "Anika Chen",
        "text": "I will escalate today. Please keep the release gated until the review completes."
      },
      {
        "timestamp": "2026-10-18 16:42",
        "author": "Maya Chen",
        "text": "Still no named approver. Release is blocked; next checkpoint is 21 Oct."
      }
    ]
  },
  {
    "id": "PLAT-118",
    "issueType": "Bug",
    "assignee": "Leo Martins",
    "created": "2026-10-12",
    "updated": "2026-10-19",
    "description": "New CI runners intermittently invalidate caches, causing failed deployments. Rollback option needs review.",
    "channel": "dev-platform",
    "messages": [
      {
        "timestamp": "2026-10-17 14:12",
        "author": "Leo Martins",
        "text": "CI runner cache failed on another production branch build (PLAT-118)."
      },
      {
        "timestamp": "2026-10-18 09:20",
        "author": "Sam Lee",
        "text": "Second failure this week; this is slowing releases."
      },
      {
        "timestamp": "2026-10-19 09:16",
        "author": "Leo Martins",
        "text": "Comparing rollback versus cache patch. Need decision from platform lead."
      }
    ]
  },
  {
    "id": "MOB-072",
    "issueType": "Task",
    "assignee": "Priya Shah",
    "created": "2026-10-05",
    "updated": "2026-10-12",
    "description": "Crash fix requires regression verification on older Android devices. Follow-up ownership was not resolved in incident review.",
    "channel": "mobile-eng",
    "messages": [
      {
        "timestamp": "2026-10-12 14:10",
        "author": "Priya Shah",
        "text": "MOB-072 needs a dedicated owner to verify Android 11/12 devices."
      },
      {
        "timestamp": "2026-10-16 11:03",
        "author": "Anika Chen",
        "text": "Was someone nominated after incident review?"
      },
      {
        "timestamp": "2026-10-19 10:24",
        "author": "Priya Shah",
        "text": "Not yet; we should resolve this in stand-up."
      }
    ]
  },
  {
    "id": "OPS-091",
    "issueType": "Task",
    "assignee": "Noah Williams",
    "created": "2026-08-18",
    "updated": "2026-10-08",
    "description": "Access review automation proposal continues to move across planning cycles without a committed quarter or decision.",
    "channel": "ops-planning",
    "messages": [
      {
        "timestamp": "2026-09-15 13:00",
        "author": "Noah Williams",
        "text": "Carrying OPS-091 into the next planning conversation."
      },
      {
        "timestamp": "2026-10-08 11:04",
        "author": "Noah Williams",
        "text": "Still not prioritized; compliance review needs an explicit go/no-go."
      },
      {
        "timestamp": "2026-10-19 15:31",
        "author": "Anika Chen",
        "text": "Flagging this again because it has been pending for more than two months."
      }
    ]
  },
  {
    "id": "DATA-406",
    "issueType": "Task",
    "assignee": "Inez Okafor",
    "created": "2026-09-12",
    "updated": "2026-10-15",
    "description": "Analytics cleanup cannot start until the upstream event taxonomy is signed off by the analytics owners.",
    "channel": "data-foundations",
    "messages": [
      {
        "timestamp": "2026-10-04 12:20",
        "author": "Inez Okafor",
        "text": "DATA-406 is waiting on event taxonomy approval."
      },
      {
        "timestamp": "2026-10-15 15:37",
        "author": "Inez Okafor",
        "text": "Taxonomy review had no decision. This blocker has been open for around a month."
      },
      {
        "timestamp": "2026-10-20 10:10",
        "author": "Anika Chen",
        "text": "Please get a decision in the next data review, even if cleanup stays low priority."
      }
    ]
  },
  {
    "id": "WEB-319",
    "issueType": "Story",
    "assignee": "Sam Lee",
    "created": "2026-10-16",
    "updated": "2026-10-19",
    "description": "Pricing page translation QA is progressing; no active dependency or escalation is needed.",
    "channel": "web-growth",
    "messages": [
      {
        "timestamp": "2026-10-17 11:40",
        "author": "Sam Lee",
        "text": "WEB-319 translations are in review."
      },
      {
        "timestamp": "2026-10-19 10:26",
        "author": "Sam Lee",
        "text": "QA in progress. No blocker; targeting normal delivery."
      },
      {
        "timestamp": "2026-10-20 16:15",
        "author": "Anika Chen",
        "text": "Thanks. Keep the regular update cadence."
      }
    ]
  }
]
