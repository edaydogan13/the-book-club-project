# Multi-Session Data Synchronization & Real-Time State Reconciliation

A robust, server-authoritative data synchronization architecture for **The Six — Private Book Club** that eliminates stale data across concurrent browser sessions, properly awaits backend mutations with optimistic rollbacks, and delivers subtle curatorial cloud saving feedback.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following synchronization parameters were confirmed through the interactive clarification review:

- **Polling Frequency**: Moderate automated polling every 10 seconds, augmented with instant re-synchronization whenever a browser tab or window regains focus.
- **Visual Feedback**: Subtle editorial cloud sync indicator (saving / synced / error states) with non-intrusive toast notifications on completed saves.
- **Conflict Resolution**: Server timestamped last-write-wins with instant cross-tab broadcast via `BroadcastChannel` and server JSON store persistence.

---

## 1. Overview & Core Concept

- **What It Does**: Resolves intermittent state divergence between multiple active member sessions and devices. When any member edits a book, submits a video review, updates member quotes, or posts reflections in Turkish or English, the changes are reliably persisted to the server, acknowledged with feedback, and propagated seamlessly across all other browsing sessions.
- **Target Audience / Persona**: The six club curators (Eda, Gizem, Can Mert, Cemre, Kerim, and Duru) and guest readers accessing the salon across phones, tablets, and desktop browsers simultaneously.
- **Key Value**: Guarantees zero lost edits, eliminates race conditions caused by fire-and-forget API calls, and protects local editing workflows from being inadvertently overwritten by stale background polls.

---

## 2. User Experience & Visual Design

- **Curatorial Cloud Indicator**:
  - Located discreetly in the top utility header / floating action zone.
  - States:
    - *Synced*: Subtle cloud icon with quiet text `Synced · [Time]` in muted stone (`text-stone-400 font-sans text-xs`).
    - *Syncing / Saving*: Gentle spinning loop indicator (`animate-spin text-amber-700 w-3.5 h-3.5`) with label `Saving to salon...` or `Syncing changes...`.
    - *Offline / Error*: Soft terracotta notice (`text-[#BF360C]`) with a 1-click `Retry` trigger.
- **Ephemeral Feedback Toasts**:
  - A clean, unboxed editorial toast that slides in from the top right or bottom center upon successful mutation (e.g., *"Book details saved & synced"*, *"Reflection added"*).
  - Automatically dismisses after 3 seconds without obstructing bookshelf spines or reading cards.
- **Active Editing Protection**:
  - If a member is actively typing inside an open modal (`BookEditModal`, `MemberEditModal`, or adding a comment), background polling safely defers state overwrites for the actively modified entity, preventing form resets or lost keystrokes.

---

## 3. Key Product Decisions & Trade-Offs

- **Awaited Mutations with Optimistic Reconciliation**:
  - *Chosen Approach*: Update client UI optimistically for instant responsiveness, await the backend API response (`POST /api/data/*`), and reconcile with the canonical server response. If the network call fails, automatically roll back to previous state and notify the user.
  - *Why*: Eliminates unhandled promise rejections and silent network drops where the user thinks data was saved but it never reached the server.
- **Cross-Tab BroadcastChannel + 10s Server Polling**:
  - *Chosen Approach*: Pair browser-level `BroadcastChannel('the-six-sync')` with 10-second server polling and `window.addEventListener('focus', ...)`.
  - *Why*: Provides sub-10ms instantaneous updates across tabs on the same machine without waiting for the 10-second poll, while the 10-second poll ensures separate devices and remote members stay completely synchronized.
- **Last-Write-Wins with Monotonic Timestamps**:
  - *Chosen Approach*: The server appends an ISO timestamp (`lastUpdated`) on every write. Clients only apply background polling updates if the server timestamp is newer than their last synchronized checkpoint.

---

## 4. Technical Architecture & Data Strategy

### System Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        User Actions (Client)                           │
│  [Edit Book]       [Add Reflection]      [Update Member Profile]       │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  App.tsx Mutation Orchestrator                         │
│  1. Capture previous snapshot (for rollback)                           │
│  2. Set SyncStatus: 'saving'                                           │
│  3. Optimistic local state update                                      │
│  4. Await API call via api.ts (POST /api/data/...)                     │
│  5. On Success: Reconcile canonical server payload & broadcast         │
│  6. On Failure: Roll back state & show error toast                     │
└──────────────────┬───────────────────────────────┬─────────────────────┘
                   │                               │
        BroadcastChannel('the-six-sync')           │ HTTP POST (Awaited)
                   │                               ▼
                   │             ┌───────────────────────────────────────┐
                   │             │   Express Server API (server.ts)      │
                   │             │   - /api/data/book                    │
                   │             │   - /api/data/member                  │
                   │             │   - /api/data/comment                 │
                   │             │   - /api/data/video                   │
                   │             │   - Writes to data/store.json         │
                   │             │   - Returns updated collection        │
                   │             └──────────────────┬────────────────────┘
                   │                                │
                   ▼                                ▼
       [Concurrent Local Tabs]           [Remote Client Sessions]
       Instant zero-latency sync         10-second Polling + Window Focus
```

### Component & File Mapping

1. **`src/utils/api.ts`**:
   - Upgrade all API functions (`saveBookApi`, `saveMemberApi`, `deleteBookApi`, `addCommentApi`, `updateVideoApi`, `saveSiteContentApi`) to return the actual server response object `{ success: boolean, books?: Book[], members?: Member[], siteContent?: SiteContent, error?: string }`.
   - Add timeout and network error handling with descriptive error propagation.

2. **`src/App.tsx`**:
   - Refactor `syncWithBackend`:
     - Track `isSyncing` and `activeEditingId` ref so in-flight form entries are not overwritten by background ticks.
     - Compare server `lastUpdated` timestamp against client `lastSyncedTimestamp` to prevent redundant re-renders.
   - Refactor all mutation handlers (`handleSaveBook`, `handleDeleteBook`, `handleSaveMember`, `handleUpdateMember`, `handleSaveSiteContent`, `handleAddComment`, `handleUpdateVideo`):
     - Make handlers `async`.
     - Implement snapshot capture for error rollback.
     - `await` the API response, verify `res.success`, and update state with canonical server data.
     - Broadcast change to other open tabs via `BroadcastChannel`.
   - Integrate `BroadcastChannel('the-six-club-sync')` listener to immediately trigger re-sync when another tab saves.
   - Add unobtrusive toast and cloud sync status badge in the header/floating bar.

3. **`server.ts`**:
   - Ensure all mutation endpoints return the complete updated collections and a uniform timestamp `lastUpdated`.
   - Ensure `POST /api/data/referral` exists so referrals are persistently saved to `store.json`.

---

## 5. Verification Plan

1. **Multi-Session Tab Test**:
   - Open two browser tabs side-by-side.
   - Make an edit in Tab A (e.g. edit a book title or add a reflection).
   - Verify Tab A shows the cloud saving indicator and success toast.
   - Verify Tab B receives the update immediately via `BroadcastChannel` without needing manual reload.
2. **Network Resilience & Rollback Test**:
   - Simulate a dropped network request and verify the UI restores the prior state cleanly and presents a descriptive retry prompt.
3. **No In-Flight Overwrite Test**:
   - Open `BookEditModal` in Tab A; verify 10-second background polls do not disrupt active input fields.
4. **Applet Compilation**:
   - Run `compile_applet` and `lint_applet` to confirm 0 TypeScript or build errors.
