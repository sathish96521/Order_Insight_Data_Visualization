import {
  Assessment,
  CloudQueue,
  Dashboard,
  Description,
  Inventory,
  Router,
  SettingsEthernet,
} from '@mui/icons-material';
import { MenuItem } from './types';

export const menuTree: MenuItem[] = [
  {
    id: 'dashboard-label',
    type: 'label',
    title: 'Dashboard',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: Dashboard,
  },
  {
    id: 'apps-label',
    type: 'label',
    title: 'Applications',
  },
  {
    id: 'performance-hub',
    title: 'Performance Reporting Hub',
    icon: Assessment,
    children: [
      {
        id: 'performance-hub-view',
        title: 'View Reports',
      },
    ],
  },
  {
    id: 'adi',
    title: 'ADI',
    icon: Inventory,
    children: [
      {
        id: 'inventory',
        title: 'Inventory Report',
      },
      {
        id: 'view-all-billing-report',
        title: 'View All Billing Report',
      },
    ],
  },
  // {
  //   id: 'flexware',
  //   title: 'Flexware',
  //   icon: Router,
  //   children: [
  //     {
  //       id: 'admin-report',
  //       title: 'Admin Report',
  //     },
  //     {
  //       id: 'product-detail-fw',
  //       title: 'Product Detail',
  //     },
  //   ],
  // },
  // {
  //   id: 'AT&T-SDS',
  //   title: 'AT&T Software Defined Solutions',
  //   icon: CloudQueue,
  //   children: [
  //     {
  //       id: 'products',
  //       title: 'Products',
  //     },
  //     {
  //       id: 'product-detail-sds',
  //       title: 'Product Detail',
  //     },
  //   ],
  // },
];
