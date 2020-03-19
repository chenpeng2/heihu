import React from 'react';
import Loadable from 'react-loadable';
import { Route, loading } from 'components';

const router = [
  {
    path: '/exceptionalEvent/exceptionalEventManagement',
    breadcrumbName: '异常事件管理',
    component: Loadable({ loader: () => import('./manageExceptionalEvent/list'), loading }),
  },
];

export default router;
