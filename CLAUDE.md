# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start dev server (port 8080)
npm run build    # Production build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

## Tech Stack

- React 18 + TypeScript + Vite
- shadcn/ui (Radix UI primitives)
- Tailwind CSS with custom CSS variables
- React Router v6 (single-page app)
- TanStack React Query (QueryClient available)

## Architecture Overview

**Fabric** is a client management dashboard for financial advisors, enabling AI-powered meeting recording, summarization, and discovery report generation.

### State Management

All application state lives in `src/pages/Index.tsx` and flows down via props:

- `selectedClient` - Currently selected client
- `activeView` - Current view (`'documentation' | 'meeting-notes' | 'meeting-prep' | 'start-meeting'`)
- `recordingState` - Meeting state machine (`'idle' | 'recording' | 'processing' | 'complete'`)
- `meetingSummary` - Generated summary text
- `selectedMeetingType` - Type of meeting being recorded

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `Index.tsx` | `src/pages/` | Root state orchestrator |
| `Sidebar.tsx` | `src/components/dashboard/` | Client selection + view navigation |
| `MainPanel.tsx` | `src/components/dashboard/` | View router based on `activeView` |
| `RecordingOverlay.tsx` | `src/components/dashboard/` | Meeting recording workflow with state machine |
| `mockData.ts` | `src/data/` | All data interfaces + mock data |

### Data Layer

All data is static mock data in `src/data/mockData.ts`. Data is organized as `Record<string, T>` keyed by `clientId`:

- `clientDocumentation` - Risk tolerance, financial objectives
- `meetingNotes` - Past meetings with transcriptions
- `meetingPrepItems` - Follow-up actions from previous meetings
- `clientActions` / `advisorActions` - Action items
- `summaryPoints` - Meeting summary bullets

### Adding a New View

1. Create component in `src/components/dashboard/NewView.tsx` accepting `clientId: string`
2. Add view type to `ViewType` union in `mockData.ts`
3. Add render case in `MainPanel.tsx`
4. Add navigation button in `Sidebar.tsx` viewOptions array

### Design System

CSS variables defined in `src/index.css`:
- Primary: Blue (#3B82F6)
- Custom classes: `.card-minimal`, `.nav-item`, `.section-header`, `.label-text`
- 4px spacing scale via `--space-*` variables

### Unused Components

These exist but are not integrated: `SummaryTab.tsx`, `ActionsTab.tsx`, `AskTab.tsx`, `TabNavigation.tsx`
