import { Route } from 'react-router-dom';
import { lazy } from 'react';

// ─── Parent portal pages ──────────────────────────────────────────────────────

const ParentDashboard  = lazy(() => import('../parent/components/dashboard/ParentDashboard'));
const ParentProfile    = lazy(() => import('../parent/components/profile/ParentProfile'));
const NotifParent      = lazy(() => import('../parent/components/notification/NotifParent'));

// ─── Child-scoped pages ───────────────────────────────────────────────────────

const ChildResults     = lazy(() => import('../parent/components/children/ChildResults'));
const ChildAttendance  = lazy(() => import('../parent/components/children/ChildAttendance'));
const ChildSchedule    = lazy(() => import('../parent/components/children/ChildSchedule'));
const ChildTranscripts = lazy(() => import('../parent/components/children/ChildTranscripts'));

// ─── Route tree ───────────────────────────────────────────────────────────────
//
//  /parent                                → Dashboard overview
//  /parent/profile                        → Parent's own profile + settings
//  /parent/notification                   → Notifications (existing stub)
//  /parent/details                        → Legacy details page (kept for back-compat)
//  /parent/children/:studentId/results    → Child academic results
//  /parent/children/:studentId/attendance → Child attendance records
//  /parent/children/:studentId/schedule   → Child upcoming schedule
//  /parent/children/:studentId/transcripts→ Child final transcripts + signing
//
//  NOTE: The "select child" step lives inside each child page (via navigation
//  chips).  A bare /parent/children/:studentId redirect defaults to results.

export const parentRoutes = (
  <>
    {/* Default: dashboard */}
    <Route index element={<ParentDashboard />} />

    {/* Self-service */}
    <Route path="profile"      element={<ParentProfile />} />
    <Route path="notification" element={<NotifParent />} />

    {/* Child-scoped — all require :studentId */}
    <Route path="children/:studentId/results"      element={<ChildResults />} />
    <Route path="children/:studentId/attendance"   element={<ChildAttendance />} />
    <Route path="children/:studentId/schedule"     element={<ChildSchedule />} />
    <Route path="children/:studentId/transcripts"  element={<ChildTranscripts />} />
  </>
);
