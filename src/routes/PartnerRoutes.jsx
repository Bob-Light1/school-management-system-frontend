import { Route } from 'react-router-dom';
import { lazy } from 'react';


const PartnerDetails = lazy(() =>
  import('../partner/components/partnerDetails/PartnerDetails')
);
const NotifPartner = lazy(() =>
  import('../partner/components/notification/NotifPartner')
);

export const partnerRoutes = (
    <>
      <Route index element={<PartnerDetails />} />
      <Route path="notification" element={<NotifPartner />} />
    </>
);
