import { Route } from 'react-router-dom';
import { lazy } from 'react';


const ParentDetails = lazy(() =>
  import('../parent/components/parentDetails/ParentDetails')
);
const NotifParent = lazy(() =>
  import('../parent/components/notification/NotifParent')
);


export const parentRoutes = (
    <>
      <Route index element={<ParentDetails />} />
      <Route path="notification" element={<NotifParent />} />
    </>
);
