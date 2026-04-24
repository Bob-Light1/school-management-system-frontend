/**
 * @file Partner.jsx
 * @description Partner layout — thin wrapper around AppShell.
 *   Replaced the outdated standalone MuiAppBar with the shared AppNavBar
 *   (via AppShell) for consistent look-and-feel and responsive behaviour.
 */

import HomeIcon               from '@mui/icons-material/Home';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

import AppShell from '../components/AppShell';

const navItems = [
  { link: '/',                    label: 'Home',         icon: HomeIcon },
  { link: '/partner',             label: 'Your Details', icon: DashboardCustomizeIcon },
  { link: '/partner/notification',label: 'Notifications',icon: NotificationsActiveIcon },
];

export default function Partner() {
  return (
    <AppShell
      navItems={navItems}
      drawerLabel="Partner Portal"
      pageTitle="Partner Page"
    />
  );
}
