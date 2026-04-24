/**
 * @file Parent.jsx
 * @description Parent layout — fetches first child then delegates to AppShell.
 */

import { useState, useEffect } from 'react';

import HomeIcon               from '@mui/icons-material/Home';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import AccountCircleIcon      from '@mui/icons-material/AccountCircle';
import TrendingUpIcon         from '@mui/icons-material/TrendingUp';
import AccessTimeIcon         from '@mui/icons-material/AccessTime';
import EventNoteIcon          from '@mui/icons-material/EventNote';
import DescriptionIcon        from '@mui/icons-material/Description';

import AppShell          from '../components/AppShell';
import { getMyChildren } from '../services/parent.service';

export default function Parent() {
  const [firstChildId, setFirstChildId] = useState(null);

  useEffect(() => {
    getMyChildren()
      .then(({ data }) => {
        const children = data.data?.children ?? [];
        if (children.length > 0) setFirstChildId(children[0]._id);
      })
      .catch(() => {});
  }, []);

  const childLink = (section) =>
    firstChildId ? `/parent/children/${firstChildId}/${section}` : '/parent';

  const navItems = [
    { link: '/',                     label: 'Home',       icon: HomeIcon,               disabled: false },
    { link: '/parent',               label: 'Dashboard',  icon: DashboardCustomizeIcon, disabled: false },
    { link: '/parent/profile',       label: 'My Profile', icon: AccountCircleIcon,      disabled: false },
    { link: childLink('results'),    label: 'Results',    icon: TrendingUpIcon,         disabled: !firstChildId },
    { link: childLink('attendance'), label: 'Attendance', icon: AccessTimeIcon,         disabled: !firstChildId },
    { link: childLink('schedule'),   label: 'Schedule',   icon: EventNoteIcon,          disabled: !firstChildId },
    { link: childLink('transcripts'),label: 'Transcripts',icon: DescriptionIcon,        disabled: !firstChildId },
  ];

  return (
    <AppShell
      navItems={navItems}
      drawerLabel="Parent Portal"
      pageTitle="Parent Dashboard"
    />
  );
}
