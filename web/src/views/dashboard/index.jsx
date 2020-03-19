import React from 'react';
import Loadable from 'react-loadable';
import { Route, loading } from 'components';

const router = [
  {
    path: '/dashboard/dynamic',
    breadcrumbName: '看板',
    component: Loadable({ loader: () => import('./dynamic'), loading }),
  },
];

export default router;
