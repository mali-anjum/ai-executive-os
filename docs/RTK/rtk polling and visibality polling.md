# RTK Query vs Redux Slice vs useVisibilityPolling
## Production Architecture Guide

**Project:** AI Executive OS / Internal Company Operating System  
**Architecture:** Next.js + Redux Toolkit + RTK Query + FastAPI  
**Status:** Production Standard

---

# Purpose

This document defines the standard architecture for handling:

- Server State
- Client/UI State
- Polling
- Background Refresh
- Caching
- Data Synchronization

Following these guidelines ensures the application remains:

- Scalable
- Maintainable
- Predictable
- Production-ready

---

# Core Principle

The most important architectural rule is:

> **Who owns the data?**

There are only two possibilities.

## 1. Server owns the data

Use **RTK Query**.

Examples:

- Documents
- Tickets
- Patients
- Appointments
- Analytics
- Executive Summary
- Reports
- Notifications from backend
- Integrations

The frontend should never duplicate this data into Redux slices.

---

## 2. Client owns the data

Use **Redux Slice**.

Examples:

- Theme
- Sidebar open/close
- Selected tab
- Wizard step
- Modal state
- Current filter
- Current search text
- Current language
- Current organization selection
- Unsaved form state

---

# Why RTK Query?

RTK Query already provides:

- Fetching
- Caching
- Loading state
- Error state
- Automatic refetching
- Request deduplication
- Cache invalidation
- Optimistic updates
- Polling
- Retry logic
- Shared cache between components

Creating another Redux slice for the same server data duplicates state.

---

# Bad Architecture

```
Server
   │
   ▼
RTK Query Cache
   │
   ▼
Redux Slice
   │
   ▼
Component
```

Problems:

- Two sources of truth
- Duplicate state
- Extra reducers
- Extra actions
- More bugs
- More maintenance

---

# Recommended Architecture

```
Server
   │
   ▼
RTK Query Cache
   │
   ▼
Component
```

Single source of truth.

---

# Redux Slice Usage

Keep Redux slices only for UI state.

Example:

```
Theme
Sidebar
Filters
Current Organization
Current Workspace
Modal State
Wizard State
Authentication UI
```

Do NOT store:

```
Documents
Tickets
Patients
Analytics
Appointments
```

inside Redux slices.

---

# RTK Query Polling

Use RTK Query polling whenever the endpoint already exists inside RTK Query.

Example

```tsx
const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
} = useGetAnalyticsQuery(undefined, {
    pollingInterval: 30000,
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
});
```

---

# RTK Query Polling Options

---

## pollingInterval

Type

```ts
number
```

Meaning

Automatically refetch every X milliseconds.

Example

```ts
pollingInterval: 30000
```

Fetch every 30 seconds.

---

## skipPollingIfUnfocused

Type

```ts
boolean
```

Meaning

Pause polling while the browser tab is hidden.

Recommended

```ts
skipPollingIfUnfocused: true
```

Equivalent to most visibility polling implementations.

---

## refetchOnFocus

Type

```ts
boolean
```

Meaning

Refetch immediately when the user returns to the tab.

Example

```
User leaves tab

↓

User comes back

↓

Fetch latest data
```

Recommended

```
true
```

---

## refetchOnReconnect

Type

```ts
boolean
```

Meaning

Refetch automatically after internet reconnects.

Example

```
Offline

↓

Online

↓

Fetch latest data
```

Recommended

```
true
```

---

## skip

Type

```ts
boolean
```

Meaning

Completely disable the query.

Example

```ts
skip: !enabled
```

Useful for feature flags.

---

## refetch()

Manual refresh.

Example

```ts
await refetch();
```

---

# Loading States

---

## isLoading

True only during the first request.

Perfect for:

- Skeletons
- Initial page load

---

## isFetching

True during every background refresh.

Perfect for:

- Small spinner
- Refresh indicator

---

# When to use RTK Query Polling

Use for

- Documents
- Tickets
- Analytics
- Patients
- Doctors
- Appointments
- Reports
- Dashboard
- Notifications
- Integrations

Basically

Any server resource.

---

# useVisibilityPolling

Purpose

A reusable polling hook for situations where RTK Query polling is not suitable.

Features

- Immediate polling
- Dynamic polling intervals
- Fast startup polling
- Visibility aware
- Prevent overlapping requests
- Cleanup on unmount
- Pause while hidden

---

# When to use useVisibilityPolling

Use ONLY when RTK Query cannot solve the problem.

Examples

- Plain fetch()
- Axios outside RTK Query
- Third-party SDK polling
- WebSocket fallback polling
- SSE fallback polling
- Timer-based background jobs
- Dynamic polling intervals

---

# Do NOT use useVisibilityPolling

Do NOT use it together with

```
pollingInterval
```

for the same endpoint.

Wrong

```
RTK Query

+

useVisibilityPolling
```

This creates duplicate polling.

---

# Dynamic Polling

RTK Query supports

```
Fixed polling
```

Example

```
30 seconds
```

Your custom hook supports

```
5 seconds

↓

10 seconds

↓

30 seconds

↓

60 seconds
```

Use custom polling only if dynamic intervals are truly required.

---

# Decision Matrix

| Situation | Redux Slice | RTK Query | useVisibilityPolling |
|------------|------------|-----------|----------------------|
| Theme | ✅ | ❌ | ❌ |
| Sidebar | ✅ | ❌ | ❌ |
| Selected Ticket | ✅ | ❌ | ❌ |
| Wizard | ✅ | ❌ | ❌ |
| Form State | ✅ | ❌ | ❌ |
| Documents | ❌ | ✅ | ❌ |
| Tickets | ❌ | ✅ | ❌ |
| Analytics | ❌ | ✅ | ❌ |
| Patients | ❌ | ✅ | ❌ |
| Doctors | ❌ | ✅ | ❌ |
| Appointments | ❌ | ✅ | ❌ |
| Dashboard | ❌ | ✅ | ❌ |
| Third-party polling | ❌ | ❌ | ✅ |
| WebSocket fallback | ❌ | ❌ | ✅ |
| SSE fallback | ❌ | ❌ | ✅ |
| Custom timers | ❌ | ❌ | ✅ |
| Adaptive polling | ❌ | ❌ | ✅ |

---

# Architectural Rules

## Rule 1

Never duplicate RTK Query data into Redux slices.

---

## Rule 2

Redux slices store only client-owned state.

---

## Rule 3

RTK Query stores all server-owned state.

---

## Rule 4

Use RTK Query polling whenever the endpoint is managed by RTK Query.

---

## Rule 5

Use useVisibilityPolling only when RTK Query cannot satisfy the polling requirements.

---

## Rule 6

Never use both RTK Query polling and useVisibilityPolling for the same endpoint.

---

# Final Architecture

```
                 Backend (FastAPI)
                        │
                        ▼
                 RTK Query Cache
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
 Documents                   Tickets
 Analytics                   Patients
 Reports                     Dashboard
 Appointments                Doctors
                        │
                        ▼
                 React Components


Client/UI State
        │
        ▼
 Redux Slice
        │
 Theme
 Sidebar
 Filters
 Wizard
 Modal
 Selected Item
```

---

# Final Guideline

> **If the server owns the data, use RTK Query.**

> **If the client owns the data, use Redux Slice.**

> **If polling is needed for an RTK Query endpoint, use RTK Query's built-in polling.**

> **Use useVisibilityPolling only for non-RTK Query scenarios or specialized adaptive polling that RTK Query does not support.**