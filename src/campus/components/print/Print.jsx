/**
 * @file Print.jsx
 * @description Academic Print module entry point for the campus layout.
 *
 * Renders AcademicPrintPanel for campus managers, admins, and directors.
 * Role guard is enforced server-side and by ProtectedRoute at the route level.
 *
 * Register in CampusRoutes.jsx:
 *   const Print = lazy(() => import('../campus/components/print/Print'));
 *   <Route path="print" element={<Print />} />
 */

import AcademicPrintPanel from './AcademicPrintPanel';

const Print = () => <AcademicPrintPanel />;

export default Print;
