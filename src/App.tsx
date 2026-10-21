import { useEffect, useMemo, useState, useContext, createContext, type ReactNode } from "react"

type View = "dashboard" | "feed" | "search" | "details" | "states"
type Priority = "High" | "Medium" | "Low"
type Source = "Jira" | "Slack"
type QaScenario = "default" | "empty-search" | "empty-priority" | "no-dashboard-data" | "integration-error" | "no-integrations"

type WorkItem = {
  id: string
  title: string
  status: "Blocked" | "Pending" | "In progress" | "Done"
  priority: Priority
  duration: string
  durationKind: "Blocked" | "Pending" | "No update"
  owner: string
  project: string
  sources: Source[]
  reason: string
  blocker: string
  nextAction: string
  pendingSince: string
  lastUpdated: string
  due?: string
  snoozedUntil?: string
}

const items: WorkItem[] = [
  {
    id: "AUTH-234",
    title: "Authentication API migration",
    status: "Blocked",
    priority: "High",
    duration: "4 days",
    durationKind: "Blocked",
    owner: "Maya Chen",
    project: "Identity platform",
    sources: ["Jira", "Slack"],
    reason: "Security approval is holding the release path.",
    blocker:
      "The security review needs a named approver before migration can resume.",
    nextAction: "Confirm the security approver with Maya in Slack.",
    pendingSince: "Oct 1, 2026 · 18 days",
    lastUpdated: "Oct 18, 2026 at 4:42 PM",
    due: "Oct 21, 2026",
  },
  {
    id: "PLAT-118",
    title: "CI pipeline reliability",
    status: "Blocked",
    priority: "High",
    duration: "3 days",
    durationKind: "Blocked",
    owner: "Leo Martins",
    project: "Developer platform",
    sources: ["Jira"],
    reason: "Intermittent build failures are affecting active deployments.",
    blocker:
      "The runner upgrade introduced an intermittent cache invalidation failure.",
    nextAction: "Review the runner rollback option with Leo.",
    pendingSince: "Oct 12, 2026 · 7 days",
    lastUpdated: "Oct 19, 2026 at 9:16 AM",
    due: "Oct 19, 2026",
  },
  {
    id: "MOB-072",
    title: "Mobile crash follow-up",
    status: "Pending",
    priority: "Medium",
    duration: "14 days",
    durationKind: "Pending",
    owner: "Priya Shah",
    project: "Mobile experience",
    sources: ["Jira", "Slack"],
    reason: "The follow-up remains unassigned after the incident review.",
    blocker:
      "No owner has been assigned to validate the crash fix across older devices.",
    nextAction: "Ask Priya to identify an owner during stand-up.",
    pendingSince: "Oct 5, 2026 · 14 days",
    lastUpdated: "Oct 12, 2026 at 2:10 PM",
  },
  {
    id: "OPS-091",
    title: "Access review automation",
    status: "Pending",
    priority: "Medium",
    duration: "11 days",
    durationKind: "No update",
    owner: "Noah Williams",
    project: "Operations",
    sources: ["Jira", "Slack"],
    reason: "Repeated deferral risks this work losing visibility.",
    blocker:
      "The proposal has moved between planning cycles without a new decision.",
    nextAction: "Confirm whether this remains in the current quarter.",
    pendingSince: "Aug 18, 2026 · 62 days",
    lastUpdated: "Oct 8, 2026 at 11:04 AM",
  },
  {
    id: "DATA-406",
    title: "Analytics schema cleanup",
    status: "Blocked",
    priority: "Low",
    duration: "30 days",
    durationKind: "Blocked",
    owner: "Inez Okafor",
    project: "Data foundations",
    sources: ["Jira"],
    reason: "A long-running dependency has limited current impact.",
    blocker: "The cleanup depends on an upstream event taxonomy decision.",
    nextAction: "Recheck the taxonomy decision at the next data review.",
    pendingSince: "Sep 12, 2026 · 37 days",
    lastUpdated: "Oct 15, 2026 at 3:37 PM",
  },
  {
    id: "WEB-319",
    title: "Pricing page localization",
    status: "In progress",
    priority: "Low",
    duration: "3 days",
    durationKind: "Pending",
    owner: "Sam Lee",
    project: "Web growth",
    sources: ["Jira"],
    reason: "On track; included for daily priority context.",
    blocker: "No active blocker.",
    nextAction: "No follow-up needed.",
    pendingSince: "Oct 16, 2026 · 3 days",
    lastUpdated: "Oct 19, 2026 at 10:26 AM",
  },
]

type DemoStore = {
  records: WorkItem[]
  assign: (id: string, owner: string) => void
  complete: (id: string) => void
  snooze: (id: string, days: number) => void
  reset: () => void
}
const DemoContext = createContext<DemoStore | null>(null)
function useDemoStore() {
  const context = useContext(DemoContext)
  if (!context) throw new Error("Missing demo store")
  return context
}
const BASE_DATE = "2026-10-21"
const isVisible = (item: WorkItem) =>
  item.status !== "Done" && (!item.snoozedUntil || item.snoozedUntil <= BASE_DATE)
const priorityOrder: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 }
const rankItems = (data: WorkItem[]) =>
  [...data].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] ||
    parseInt(b.duration, 10) - parseInt(a.duration, 10))
const initialRecords = items
function storedRecords(): WorkItem[] {
  try {
    const value = JSON.parse(localStorage.getItem("workradar-demo-v2") || "null")
    if (!Array.isArray(value)) return initialRecords
    return initialRecords.map(original => {
      const saved = value.find((v: WorkItem) => v.id === original.id)
      return saved ? { ...original, owner: typeof saved.owner === "string" ? saved.owner : original.owner,
        status: ["Blocked", "Pending", "In progress", "Done"].includes(saved.status) ? saved.status : original.status,
        snoozedUntil: typeof saved.snoozedUntil === "string" ? saved.snoozedUntil : undefined } : original
    })
  } catch { return initialRecords }
}

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    radar: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 3.5V6m0 12v2.5M3.5 12H6m12 0h2.5M12 12l5-5" />
        <circle cx="12" cy="12" r="2" />
      </>
    ),
    dashboard: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </>
    ),
    feed: (
      <>
        <path d="M5 6h14M5 12h14M5 18h14" />
        <circle cx="3.5" cy="6" r=".5" fill="currentColor" />
        <circle cx="3.5" cy="12" r=".5" fill="currentColor" />
        <circle cx="3.5" cy="18" r=".5" fill="currentColor" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 5 5" />
      </>
    ),
    chevron: <path d="m9 6 6 6-6 6" />,
    down: <path d="m6 9 6 6 6-6" />,
    back: <path d="m15 18-6-6 6-6" />,
    tune: (
      <>
        <path d="M4 7h10m4 0h2M4 17h2m4 0h10" />
        <circle cx="16" cy="7" r="2" />
        <circle cx="8" cy="17" r="2" />
      </>
    ),
    sparkle: (
      <>
        <path d="M12 3c.5 4.6 2.4 6.5 7 7-4.6.5-6.5 2.4-7 7-.5-4.6-2.4-6.5-7-7 4.6-.5 6.5-2.4 7-7Z" />
        <path d="M19 15c.2 1.9 1.1 2.8 3 3-1.9.2-2.8 1.1-3 3-.2-1.9-1.1-2.8-3-3 1.9-.2 2.8-1.1 3-3Z" />
      </>
    ),
    person: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.8-4 3.1-6 7-6s6.2 2 7 6" />
      </>
    ),
    warning: (
      <>
        <path d="M10.2 4.5 2.8 18a2 2 0 0 0 1.8 3h14.8a2 2 0 0 0 1.8-3L13.8 4.5a2 2 0 0 0-3.6 0Z" />
        <path d="M12 9v4m0 3.5v.1" />
      </>
    ),
    check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
    external: (
      <>
        <path d="M14 4h6v6M20 4l-9 9" />
        <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    status: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8" />
      </>
    ),
    close: <path d="m7 7 10 10M17 7 7 17" />,
    inbox: (
      <>
        <path d="M4 5h16v14H4z" />
        <path d="M4 14h4l2 2h4l2-2h4" />
      </>
    ),
    plug: (
      <>
        <path d="m8 12 8-8M6 6l3 3m6 6 3 3" />
        <path d="m7.5 10.5-2 2a4 4 0 0 0 5.7 5.7l2-2m3.3-2.7 2-2a4 4 0 0 0-5.7-5.7l-2 2" />
      </>
    ),
  }
  return (
    <svg
      aria-hidden="true"
      className="icon"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function Button({
  children,
  onClick,
  variant = "secondary",
  className = "",
  ariaLabel,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "quiet" | "icon"
  className?: string
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      className={`button button-${variant} ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )
}

function SourceBadge({ source }: { source: Source }) {
  return (
    <span className="source-badge">
      <span className={`source-mark source-${source.toLowerCase()}`}>
        {source === "Jira" ? "J" : "#"}
      </span>
      {source}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`priority priority-${priority.toLowerCase()}`}>
      <span className="priority-dot" />
      {priority}
    </span>
  )
}

function WorkRow({
  item,
  onOpen,
  compact = false,
}: {
  item: WorkItem
  onOpen: () => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      className={`work-row ${compact ? "work-row-compact" : ""}`}
      onClick={onOpen}
    >
      <span className="work-main">
        <span className="work-title-line">
          <span className="work-id">{item.id}</span>
          <span className="work-title">{item.title}</span>
        </span>
        <span className="work-reason">{item.reason}</span>
        <span className="work-sources">
          {item.sources.map((source) => (
            <SourceBadge key={source} source={source} />
          ))}
        </span>
      </span>
      <span className="work-status">
        <PriorityBadge priority={item.priority} />
        <span className="duration">
          {item.durationKind} {item.duration}
        </span>
      </span>
      <span className="row-chevron">
        <Icon name="chevron" size={16} />
      </span>
    </button>
  )
}

function Sidebar({
  view,
  navigate,
}: {
  view: View
  navigate: (view: View) => void
}) {
  const links: { view: View; label: string; icon: string }[] = [
    { view: "dashboard", label: "Dashboard", icon: "dashboard" },
    { view: "feed", label: "Priority Feed", icon: "feed" },
    { view: "search", label: "Search", icon: "search" },
  ]
  return (
    <aside className="sidebar">
      <button
        className="brand"
        type="button"
        onClick={() => navigate("dashboard")}
      >
        <span className="brand-mark">
          <Icon name="radar" size={22} />
        </span>
        <span>WorkRadar</span>
      </button>
      <nav className="nav" aria-label="Primary navigation">
        {links.map((link) => (
          <button
            type="button"
            key={link.view}
            onClick={() => navigate(link.view)}
            className={`nav-link ${
              view === link.view || (view === "details" && link.view === "feed")
                ? "active"
                : ""
            }`}
          >
            <Icon name={link.icon} size={18} />
            <span>{link.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button
          className="sync-status"
          type="button"
          onClick={() => navigate("states")}
        >
          <span className="sync-dot" />
          <span>
            <strong>Demo workspace</strong>
            <small>Synced 10 min ago</small>
          </span>
          <Icon name="chevron" size={14} />
        </button>
        <div className="account">
          <span className="avatar">AC</span>
          <span>
            <strong>Anika Chen</strong>
            <small>Engineering manager</small>
          </span>
        </div>
      </div>
    </aside>
  )
}

function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children?: ReactNode
}) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="header-actions">{children}</div>}
    </header>
  )
}

function Dashboard({
  navigate,
  openItem,
  scenario = "default",
  onRetry,
  onResetPreview,
}: {
  navigate: (view: View) => void
  openItem: (item: WorkItem, from: View) => void
  scenario?: QaScenario
  onRetry?: () => void
  onResetPreview?: () => void
}) {
  const { records } = useDemoStore()
  const items = rankItems(records.filter(isVisible))
  const [connectionMessage, setConnectionMessage] = useState(false)
  const hasNoData =
    scenario === "no-dashboard-data" || scenario === "no-integrations"

  return (
    <div className="page">
      <PageHeader
        title={hasNoData ? "Welcome to WorkRadar" : "Good morning, Anika"}
        subtitle={
          hasNoData
            ? "Set up your workspace to start seeing work intelligence."
            : "Here’s a snapshot of work requiring attention (demo data, October 19, 2026)."
        }
      >
        {!hasNoData && (
          <span className="freshness">
            <span className="sync-dot" /> Sample data · Oct 19, 2026
          </span>
        )}
      </PageHeader>

      {scenario === "no-dashboard-data" && (
        <section className="panel dashboard-empty-panel">
          <EmptyState
            icon="inbox"
            title="Your workspace is ready"
            description="No work items are available yet. Once mock source records are added, WorkRadar will surface priorities, aging work, and blockers here."
            action="View demo workspace"
            onAction={onResetPreview}
          />
        </section>
      )}

      {scenario === "no-integrations" && (
        <section className="panel dashboard-empty-panel">
          <EmptyState
            icon="plug"
            title="Connect your tools to get started"
            description="WorkRadar needs a source such as Jira or Slack before it can surface blocked and aging work."
            action="Connect a source"
            onAction={() => setConnectionMessage(true)}
          />
          {connectionMessage && (
            <div className="prototype-explanation" role="status">
              <Icon name="status" size={16} />
              Integration setup isn’t available in this prototype. No connection
              was attempted.
            </div>
          )}
        </section>
      )}

      {scenario === "integration-error" && (
        <section className="sync-error-banner" role="alert">
          <span className="sync-error-icon">
            <Icon name="warning" size={18} />
          </span>
          <div>
            <strong>Couldn’t sync Jira.</strong>
            <p>
              Jira data may be outdated. Available Slack records remain usable,
              and previously loaded Jira work is shown below.
            </p>
            <small>Preview only — no real synchronization was attempted.</small>
          </div>
          <Button variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        </section>
      )}

      {!hasNoData && (
        <>
          <section className="metrics" aria-label="Team overview">
            <div className="metric">
              <span className="metric-label">Needs attention</span>
              <strong>{items.filter(i => i.status !== "In progress").length}</strong>
              <span className="metric-note attention-note">
                {items.filter(i => i.priority === "High").length} high priority
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Blocked</span>
              <strong>{items.filter(i => i.status === "Blocked").length}</strong>
              <span className="metric-note">Across {new Set(items.filter(i => i.status === "Blocked").map(i => i.project)).size} projects</span>
            </div>
            <div className="metric">
              <span className="metric-label">Aging</span>
              <strong>{items.filter(i => parseInt(i.pendingSince.split("·")[1] || "0", 10) >= 14).length}</strong>
              <span className="metric-note">Pending 14+ days</span>
            </div>
            <div className="metric metric-calm">
              <span className="metric-label">Team activity</span>
              <strong>8</strong>
              <span className="metric-note positive-note">Updates today</span>
            </div>
          </section>

          <div className="dashboard-grid">
            <section className="panel attention-panel">
              <div className="section-header">
                <div>
                  <h2>Needs attention</h2>
                  <p>
                    Ordered by priority, then age. Age alone doesn’t set
                    urgency.
                  </p>
                </div>
                <Button variant="quiet" onClick={() => navigate("feed")}>
                  View feed <Icon name="chevron" size={14} />
                </Button>
              </div>
              <div className="row-list">
                {items.slice(0, 4).map((item) => (
                  <WorkRow
                    key={item.id}
                    item={item}
                    compact
                    onOpen={() => openItem(item, "dashboard")}
                  />
                ))}
              </div>
            </section>

            <div className="dashboard-side">
              <section className="panel recap">
                <div className="recap-label">
                  <span className="ai-icon">
                    <Icon name="sparkle" size={16} />
                  </span>
                  AI-generated summary · simulated
                </div>
                <h2>What happened today</h2>
                <p>
                  {items.length ? `${items.filter(i => i.status === "Blocked").length} items are blocked, including ${items.filter(i => i.priority === "High" && i.status === "Blocked").length} high-priority blockers. ${items.filter(i => parseInt(i.duration, 10) >= 14).length} items have been waiting at least 14 days. Review the highest-impact work first.` : "No active work needs attention. Completed and snoozed items are excluded from this recap."}
                </p>
                <div className="citation-row">
                  {items.slice(0, 2).map((item, index) => <button key={item.id} type="button" onClick={() => openItem(item, "dashboard")}>{index + 1}</button>)}
                  <span>{Math.min(2, items.length)} supporting mock records · Generated demo summary</span>
                </div>
              </section>

              <section className="panel blocked-people">
                <div className="section-header small-header">
                  <div>
                    <h2>Who is blocked</h2>
                    <p>3 teammates may need help</p>
                  </div>
                </div>
                {items
                  .filter((item) => item.status === "Blocked")
                  .slice(0, 3)
                  .map((item) => (
                    <button
                      type="button"
                      className="person-row"
                      key={item.id}
                      onClick={() => openItem(item, "dashboard")}
                    >
                      <span className="person-avatar">
                        {item.owner
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </span>
                      <span>
                        <strong>{item.owner}</strong>
                        <small>{item.title}</small>
                      </span>
                      <span className="person-duration">
                        {item.durationKind} {item.duration}
                      </span>
                    </button>
                  ))}
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function PriorityFeed({
  openItem,
  empty = false,
  navigate,
}: {
  openItem: (item: WorkItem, from: View) => void
  empty?: boolean
  navigate: (view: View) => void
}) {
  const { records } = useDemoStore()
  const items = rankItems(records.filter(isVisible))
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activePriority, setActivePriority] = useState<Priority | "All">("All")
  const [owner, setOwner] = useState("All")
  const [status, setStatus] = useState("All")
  const [source, setSource] = useState("All")
  const [age, setAge] = useState("All")
  const visibleItems = items.filter((item) => {
    if (activePriority !== "All" && item.priority !== activePriority) return false
    if (owner !== "All" && item.owner !== owner) return false
    if (status !== "All" && item.status !== status) return false
    if (source !== "All" && !item.sources.includes(source as Source)) return false
    if (age !== "All" && parseInt(item.duration, 10) < Number(age)) return false
    return true
  })
  const filterCount = [activePriority, owner, status, source, age].filter(v => v !== "All").length

  return (
    <div className="page feed-page">
      <PageHeader
        title="Priority Feed"
        subtitle="Work that may need a decision or follow-up, ranked transparently."
      >
        <Button onClick={() => setFiltersOpen(!filtersOpen)}>
          <Icon name="tune" size={17} />
          Filters
          <span className="filter-count">
            {filterCount}
          </span>
        </Button>
      </PageHeader>

      <div className="feed-toolbar">
        <div className="segmented" aria-label="Priority filter">
          {(["All", "High", "Medium", "Low"] as const).map((priority) => (
            <button
              type="button"
              key={priority}
              className={activePriority === priority ? "selected" : ""}
              onClick={() => setActivePriority(priority)}
            >
              {priority}
            </button>
          ))}
        </div>
        <span className="ranking-note">
          <Icon name="status" size={15} />
          High priority first, then attention rule
        </span>
      </div>

      {filtersOpen && (
        <div className="filter-panel" aria-label="Priority feed filters">
          <div><label htmlFor="feed-owner">Owner</label><select id="feed-owner" value={owner} onChange={e => setOwner(e.target.value)}><option value="All">All owners</option>{items.map(item => <option key={item.id} value={item.owner}>{item.owner}</option>)}</select></div>
          <div><label htmlFor="feed-status">Status</label><select id="feed-status" value={status} onChange={e => setStatus(e.target.value)}><option value="All">Any status</option>{["Blocked", "Pending", "In progress"].map(value => <option key={value}>{value}</option>)}</select></div>
          <div><label htmlFor="feed-source">Source</label><select id="feed-source" value={source} onChange={e => setSource(e.target.value)}><option value="All">All sources</option><option>Jira</option><option>Slack</option></select></div>
          <div><label htmlFor="feed-age">Minimum age</label><select id="feed-age" value={age} onChange={e => setAge(e.target.value)}><option value="All">Any duration</option><option value="7">7+ days</option><option value="14">14+ days</option><option value="30">30+ days</option></select></div>
          <Button variant="quiet" onClick={() => {setOwner("All");setStatus("All");setSource("All");setAge("All");setActivePriority("All")}}>Clear filters</Button>
          <Button variant="quiet" onClick={() => setFiltersOpen(false)}>Done</Button>
        </div>
      )}

      {empty ? (
        <section className="panel feed-empty-panel">
          <EmptyState
            icon="check"
            title="You’re all caught up"
            description="There are no work items that meet the attention rules right now."
            action="Back to Dashboard"
            onAction={() => navigate("dashboard")}
          />
        </section>
      ) : (
        <section className="panel feed-list">
          <div className="feed-list-header">
            <span>{visibleItems.length} items need review</span>
            <span>Reference date · Oct 19, 2026</span>
          </div>
          {visibleItems.length === 0 && <EmptyState icon="search" title="No matching work items" description="Try relaxing one or more filters." action="Clear filters" onAction={() => {setOwner("All");setStatus("All");setSource("All");setAge("All");setActivePriority("All")}} />}
          {visibleItems.map((item) => (
            <WorkRow
              key={item.id}
              item={item}
              onOpen={() => openItem(item, "feed")}
            />
          ))}
        </section>
      )}
    </div>
  )
}

function Disclosure({
  title,
  meta,
  children,
}: {
  title: string
  meta: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`disclosure ${open ? "open" : ""}`}>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>
          <strong>{title}</strong>
          <small>{meta}</small>
        </span>
        <Icon name="down" size={17} />
      </button>
      {open && <div className="disclosure-content">{children}</div>}
    </div>
  )
}

function ItemDetails({
  item,
  back,
  followedUp,
  setFollowedUp,
}: {
  item: WorkItem
  back: () => void
  followedUp: boolean
  setFollowedUp: (value: boolean) => void
}) {
  const { assign, complete, snooze } = useDemoStore()
  const [assignedOwner, setAssignedOwner] = useState(item.owner)
  useEffect(() => setAssignedOwner(item.owner), [item.id, item.owner])
  return (
    <div className="page detail-page">
      <Button variant="quiet" className="back-button" onClick={back}>
        <Icon name="back" size={16} /> Back to previous view
      </Button>
      <div className="detail-heading">
        <div>
          <div className="detail-id">
            {item.id} <span>·</span> {item.project}
          </div>
          <h1>{item.title}</h1>
          <div className="detail-badges">
            <span className="status-badge">{item.status}</span>
            <PriorityBadge priority={item.priority} />
            <span className="duration">
              {item.durationKind} {item.duration}
            </span>
          </div>
        </div>
        <Button
          variant={followedUp ? "secondary" : "primary"}
          onClick={() => setFollowedUp(!followedUp)}
        >
          {followedUp && <Icon name="check" size={17} />}
          {followedUp ? "Follow-up noted" : "Mark follow-up noted"}
        </Button>
      </div>

      <section className="detail-card" aria-label="Demo actions" style={{marginBottom: 18}}>
        <span className="eyebrow">Functional demo actions · saved in this browser</span>
        <div style={{display:"flex", gap:12, flexWrap:"wrap", alignItems:"center", marginTop:12}}>
          <label htmlFor="assign-owner">Assign to</label>
          <select id="assign-owner" value={assignedOwner} onChange={e => setAssignedOwner(e.target.value)} style={{padding:10,borderRadius:8}}>
            {Array.from(new Set([...initialRecords.map(i => i.owner), assignedOwner])).map(person => <option key={person}>{person}</option>)}
          </select>
          <Button variant="primary" onClick={() => assign(item.id, assignedOwner)}>Assign</Button>
          <Button onClick={() => { snooze(item.id, 3); back() }}>Snooze 3 days</Button>
          <Button onClick={() => { complete(item.id); back() }}>Mark Done</Button>
        </div>
        {item.snoozedUntil && <p style={{marginTop:12}}>Snoozed until {item.snoozedUntil}. This item is hidden from the active feed until that date.</p>}
        {item.status === "Done" && <p style={{marginTop:12}}>Completed in demo workspace.</p>}
      </section>
      {followedUp && (
        <div className="local-note">
          <Icon name="check" size={16} />
          Follow-up saved locally. This item remains {item.status.toLowerCase()}{" "}
          until its source status changes.
        </div>
      )}

      <div className="detail-grid">
        <main className="detail-main">
          <section className="detail-card insight-card">
            <span className="eyebrow insight-eyebrow">
              <Icon name="sparkle" size={15} /> WorkRadar insight
            </span>
            <h2>Why this needs attention</h2>
            <p>{item.reason}</p>
            <div className="fact-strip">
              <div>
                <span>Source fact</span>
                <strong>{item.blocker}</strong>
              </div>
            </div>
          </section>

          <section className="detail-card next-action">
            <span className="eyebrow">Suggested action</span>
            <div className="next-action-row">
              <div>
                <h2>{item.nextAction}</h2>
                <p>WorkRadar won’t message teammates or change source tools.</p>
              </div>
              <span className="source-demo-note" title="Source URLs are not provided in the supplied sample data">Source link unavailable in demo</span>
            </div>
          </section>

          <section className="detail-card disclosure-card">
            <Disclosure
              title="Sources & evidence"
              meta={`${item.sources.length} source records`}
            >
              <div className="evidence-list">
                {item.sources.map((source, index) => (
                  <div className="evidence" key={source}>
                    <SourceBadge source={source} />
                    <div>
                      <strong>
                        {source === "Jira"
                          ? `${item.id} status record`
                          : "Project channel update"}
                      </strong>
                      <p>
                        {index === 0
                          ? item.blocker
                          : `${item.owner} confirmed the dependency is still unresolved.`}
                      </p>
                      <small>
                        {index === 0
                          ? item.lastUpdated
                          : "Oct 17, 2026 at 3:08 PM"}
                      </small>
                    </div>
                    <span className="source-demo-note">Sample evidence</span>
                  </div>
                ))}
              </div>
            </Disclosure>
            <Disclosure title="Activity timeline" meta="4 updates">
              <div className="timeline">
                <p>
                  <strong>Oct 19</strong> WorkRadar refreshed the sample source records.
                </p>
                <p>
                  <strong>Oct 18</strong> Status remained unchanged.
                </p>
                <p>
                  <strong>Oct 15</strong> Blocker was first recorded.
                </p>
              </div>
            </Disclosure>
            <Disclosure
              title="Priority explanation"
              meta="Explicit source field"
            >
              <p>
                <strong>Source fact:</strong> {item.priority} priority is set on
                the Jira record. WorkRadar does not infer or modify priority.
              </p>
            </Disclosure>
          </section>
        </main>

        <aside className="detail-sidebar">
          <section className="detail-card metadata">
            <h2>Work item</h2>
            <dl>
              <div>
                <dt>Owner</dt>
                <dd>
                  <span className="mini-avatar">{item.owner[0]}</span>
                  {item.owner}
                </dd>
              </div>
              <div>
                <dt>Project</dt>
                <dd>{item.project}</dd>
              </div>
              <div>
                <dt>Pending since</dt>
                <dd>{item.pendingSince}</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{item.lastUpdated}</dd>
              </div>
              {item.due && (
                <div>
                  <dt>Due date</dt>
                  <dd>{item.due}</dd>
                </div>
              )}
              <div>
                <dt>Sources</dt>
                <dd className="metadata-sources">
                  {item.sources.map((source) => (
                    <SourceBadge source={source} key={source} />
                  ))}
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  )
}

function SearchPage({
  openItem,
  forceEmpty = false,
  onClearPreview,
}: {
  openItem: (item: WorkItem, from: View) => void
  forceEmpty?: boolean
  onClearPreview?: () => void
}) {
  const { records } = useDemoStore()
  const items = records
  const [query, setQuery] = useState(forceEmpty ? "No matching work" : "")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchSource, setSearchSource] = useState("All")
  const [searchPriority, setSearchPriority] = useState("All")
  const [searchStatus, setSearchStatus] = useState("All")
  const [searchOwner, setSearchOwner] = useState("All")

  useEffect(() => {
    if (forceEmpty) {
      setQuery("No matching work")
    }
  }, [forceEmpty])

  const normalized = query.trim().toLowerCase()
  const results = useMemo(() => {
    if (!normalized) return []
    // A deliberately limited natural-language interpretation for a self-contained demo.
    const isBlockedQuery = /\bblocked\b/.test(normalized)
    const isHighQuery = /\bhigh[- ](?:impact|priority)\b/.test(normalized)
    const ageMatch = normalized.match(/(?:over|more than|older than|for|\+)\s*(\d+)\s*days?/)
    const genericTerms = normalized
      .replace(/(?:show|find|items?|work|that|are|is|with|for|more|than|over|older|days?|high|impact|priority|blocked|pending|since|no|activity|recent|updates?)\b/g, " ")
      .replace(/\d+/g, " ").trim().split(/\s+/).filter(Boolean)
    return items.filter(item => {
      if (searchSource !== "All" && !item.sources.includes(searchSource as Source)) return false
      if (searchPriority !== "All" && item.priority !== searchPriority) return false
      if (searchStatus !== "All" && item.status !== searchStatus) return false
      if (searchOwner !== "All" && item.owner !== searchOwner) return false
      if (isBlockedQuery && item.status !== "Blocked") return false
      if (isHighQuery && item.priority !== "High") return false
      if (ageMatch && parseInt(item.duration, 10) <= Number(ageMatch[1])) return false
      const haystack = [item.id,item.title,item.owner,item.project,item.status,item.priority,item.reason,item.blocker,item.nextAction,item.sources.join(" ")].join(" ").toLowerCase()
      return genericTerms.every(term => haystack.includes(term))
    })
  }, [normalized,searchSource,searchPriority,searchStatus,searchOwner,items])

  return (
    <div className={`page search-page ${normalized ? "has-results" : ""}`}>
      <PageHeader
        title="Search"
        subtitle="Find work across this team’s mock Jira and Slack records."
      />
      <div className="search-hero">
        <div className="search-input-wrap">
          <Icon name="search" size={22} />
          <input
            aria-label="Search work"
            placeholder="Search by title, ID, owner, or project"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
          />
          {query && (
            <Button
              variant="icon"
              ariaLabel="Clear search"
              onClick={() => setQuery("")}
            >
              <Icon name="close" size={17} />
            </Button>
          )}
        </div>
        <Button variant="quiet" onClick={() => setFiltersOpen(!filtersOpen)}>
          <Icon name="tune" size={16} /> Filters
        </Button>
      </div>

      {filtersOpen && (
        <div className="search-filter-bar" aria-label="Search filters">
          <label>Source <select value={searchSource} onChange={e=>setSearchSource(e.target.value)}><option value="All">All</option><option>Jira</option><option>Slack</option></select></label>
          <label>Priority <select value={searchPriority} onChange={e=>setSearchPriority(e.target.value)}><option value="All">Any</option><option>High</option><option>Medium</option><option>Low</option></select></label>
          <label>Owner <select value={searchOwner} onChange={e=>setSearchOwner(e.target.value)}><option value="All">Anyone</option>{items.map(item=><option key={item.id}>{item.owner}</option>)}</select></label>
          <label>Status <select value={searchStatus} onChange={e=>setSearchStatus(e.target.value)}><option value="All">Any</option><option>Blocked</option><option>Pending</option><option>In progress</option><option>Done</option></select></label>
          <Button variant="quiet" onClick={()=>{setSearchSource("All");setSearchPriority("All");setSearchStatus("All");setSearchOwner("All")}}>Clear filters</Button>
        </div>
      )}

      {!normalized ? (
        <div className="search-empty">
          <div className="search-orbit">
            <Icon name="search" size={27} />
          </div>
          <h2>Find work that’s gone quiet</h2>
          <p>Search titles, IDs, owners, projects, or status.</p>
          <div className="query-examples">
            <button type="button" onClick={() => setQuery("blocked")}>
              Blocked work
            </button>
            <button type="button" onClick={() => setQuery("Maya")}>
              Items owned by Maya
            </button>
            <button type="button" onClick={() => setQuery("High")}>
              High priority
            </button>
          </div>
        </div>
      ) : results.length > 0 && !forceEmpty ? (
        <section className="search-results">
          <div className="results-heading">
            <h2>
              {results.length} {results.length === 1 ? "result" : "results"}
            </h2>
            <span>Matching “{query}”</span>
          </div>
          <div className="panel">
            {results.map((item) => (
              <WorkRow
                key={item.id}
                item={item}
                onOpen={() => openItem(item, "search")}
              />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          icon="search"
          title="No matching items found."
          description={`No work items match “${query}”. Try another keyword or clear your filters.`}
          action="Clear filters"
          onAction={() => {
            setQuery("")
            setFiltersOpen(false)
            setSearchSource("All");setSearchPriority("All");setSearchStatus("All");setSearchOwner("All")
            onClearPreview?.()
          }}
        />
      )}
    </div>
  )
}

const qaOptions: {
  value: QaScenario
  label: string
  view: View
}[] = [
  { value: "default", label: "Default", view: "dashboard" },
  { value: "empty-search", label: "Empty Search", view: "search" },
  { value: "empty-priority", label: "Empty Priority Feed", view: "feed" },
  {
    value: "no-dashboard-data",
    label: "No Dashboard Data",
    view: "dashboard",
  },
  {
    value: "integration-error",
    label: "Integration Error",
    view: "dashboard",
  },
  { value: "no-integrations", label: "No Integrations", view: "dashboard" },
]

function QaControls({
  scenario,
  onSelect,
}: {
  scenario: QaScenario
  onSelect: (scenario: QaScenario, view: View) => void
}) {
  const [open, setOpen] = useState(false)
  const activeLabel =
    qaOptions.find((option) => option.value === scenario)?.label || "Default"

  return (
    <aside className="qa-controls" aria-label="Prototype state controls">
      {open && (
        <div className="qa-menu">
          <div className="qa-menu-heading">
            <span>
              <strong>Preview States</strong>
              <small>Prototype only</small>
            </span>
            <Button
              variant="icon"
              ariaLabel="Close preview states"
              onClick={() => setOpen(false)}
            >
              <Icon name="close" size={14} />
            </Button>
          </div>
          <div className="qa-options">
            {qaOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                className={scenario === option.value ? "active" : ""}
                onClick={() => {
                  onSelect(option.value, option.view)
                  setOpen(false)
                }}
              >
                <span>{option.label}</span>
                {scenario === option.value && <Icon name="check" size={15} />}
              </button>
            ))}
          </div>
          {scenario !== "default" && (
            <button
              type="button"
              className="qa-reset"
              onClick={() => {
                onSelect("default", "dashboard")
                setOpen(false)
              }}
            >
              Reset to Default
            </button>
          )}
        </div>
      )}
      <button
        type="button"
        className={`qa-trigger ${scenario !== "default" ? "previewing" : ""}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <Icon name="tune" size={16} />
        <span>
          <small>Preview States</small>
          <strong>{activeLabel}</strong>
        </span>
        <Icon name="down" size={14} />
      </button>
    </aside>
  )
}

function EmptyState({
  icon,
  title,
  description,
  action,
  onAction,
  tone = "default",
}: {
  icon: string
  title: string
  description: string
  action: string
  onAction?: () => void
  tone?: "default" | "warning"
}) {
  return (
    <div className={`empty-state ${tone === "warning" ? "warning-state" : ""}`}>
      <span className="empty-icon">
        <Icon name={icon} size={25} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      <Button
        variant={tone === "warning" ? "secondary" : "primary"}
        onClick={onAction}
      >
        {action}
      </Button>
    </div>
  )
}

function StatesPage({ navigate }: { navigate: (view: View) => void }) {
  return (
    <div className="page states-page">
      <PageHeader
        title="System states"
        subtitle="Clear, truthful feedback when there’s nothing to show or a source is delayed."
      />
      <div className="states-grid">
        <section className="panel state-card">
          <span className="state-label">Nothing needs attention</span>
          <EmptyState
            icon="check"
            title="You’re all caught up"
            description="There are no work items that meet the attention rules right now."
            action="Return to dashboard"
            onAction={() => navigate("dashboard")}
          />
        </section>
        <section className="panel state-card">
          <span className="state-label">No search results</span>
          <EmptyState
            icon="search"
            title="No matching items found"
            description="Try another keyword or remove one of your filters."
            action="Clear filters"
            onAction={() => navigate("search")}
          />
        </section>
        <section className="panel state-card state-wide">
          <span className="state-label">Source sync failure</span>
          <EmptyState
            icon="warning"
            title="Couldn’t sync Jira"
            description="Jira information may be outdated. Slack records are still available, and previously loaded Jira work remains visible."
            action="View Dashboard"
            onAction={() => navigate("dashboard")}
            tone="warning"
          />
        </section>
      </div>
    </div>
  )
}

export default function App() {
  const [records, setRecords] = useState<WorkItem[]>(storedRecords)
  const [view, setView] = useState<View>("dashboard")
  const [qaScenario, setQaScenario] = useState<QaScenario>("default")
  const [qaToast, setQaToast] = useState("")
  const [selectedItem, setSelectedItem] = useState<WorkItem>(initialRecords[0])
  const [returnView, setReturnView] = useState<View>("feed")
  const [followedUpIds, setFollowedUpIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("workradar-followups") || "[]")
    } catch {
      return []
    }
  })

  useEffect(() => { localStorage.setItem("workradar-demo-v2", JSON.stringify(records)) }, [records])
  const assign = (id: string, owner: string) => setRecords(current => current.map(item => item.id === id ? {...item, owner} : item))
  const complete = (id: string) => setRecords(current => current.map(item => item.id === id ? {...item, status: "Done", snoozedUntil: undefined} : item))
  const snooze = (id: string, days: number) => {
    const date = new Date(BASE_DATE + "T12:00:00Z")
    date.setUTCDate(date.getUTCDate() + days)
    setRecords(current => current.map(item => item.id === id ? {...item, snoozedUntil: date.toISOString().slice(0,10)} : item))
  }
  const reset = () => { setRecords(initialRecords); setFollowedUpIds([]); setQaScenario("default"); setView("dashboard") }
  useEffect(() => {
    localStorage.setItem("workradar-followups", JSON.stringify(followedUpIds))
  }, [followedUpIds])

  const navigate = (nextView: View) => {
    setView(nextView)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const openItem = (item: WorkItem, from: View) => {
    setSelectedItem(item)
    setReturnView(from)
    navigate("details")
  }

  const setFollowedUp = (value: boolean) => {
    setFollowedUpIds((current) =>
      value
        ? Array.from(new Set([...current, selectedItem.id]))
        : current.filter((id) => id !== selectedItem.id),
    )
  }

  const selectQaScenario = (scenario: QaScenario, targetView: View) => {
    setQaScenario(scenario)
    setQaToast("")
    navigate(targetView)
  }

  const retryPreview = () => {
    setQaScenario("default")
    setQaToast("Preview recovered — no live synchronization was performed.")
    window.setTimeout(() => setQaToast(""), 4000)
  }

  const resetPreview = () => {
    setQaScenario("default")
    setQaToast("")
  }

  return (
    <DemoContext.Provider value={{ records, assign, complete, snooze, reset }}>
    <div className="app-shell">
      <Sidebar view={view} navigate={navigate} />
      <div className="content">
        {view === "dashboard" && (
          <Dashboard
            navigate={navigate}
            openItem={openItem}
            scenario={qaScenario}
            onRetry={retryPreview}
            onResetPreview={resetPreview}
          />
        )}
        {view === "feed" && (
          <PriorityFeed
            openItem={openItem}
            navigate={navigate}
            empty={qaScenario === "empty-priority"}
          />
        )}
        {view === "search" && (
          <SearchPage
            openItem={openItem}
            forceEmpty={qaScenario === "empty-search"}
            onClearPreview={() => setQaScenario("default")}
          />
        )}
        {view === "details" && (
          <ItemDetails
            item={records.find(i => i.id === selectedItem.id) || selectedItem}
            back={() => navigate(returnView)}
            followedUp={followedUpIds.includes(selectedItem.id)}
            setFollowedUp={setFollowedUp}
          />
        )}
        {view === "states" && <StatesPage navigate={navigate} />}
      </div>
      <QaControls scenario={qaScenario} onSelect={selectQaScenario} />
      <button type="button" onClick={reset} title="Reset all demo actions" style={{position:"fixed",right:16,bottom:90,zIndex:50,padding:"9px 14px",background:"#fff",color:"#333",border:"1px solid #bbb",borderRadius:9,cursor:"pointer"}}>Reset demo data</button>
      {qaToast && (
        <div className="qa-toast" role="status">
          <Icon name="check" size={16} />
          {qaToast}
        </div>
      )}
    </div>
    </DemoContext.Provider>
  )
}
