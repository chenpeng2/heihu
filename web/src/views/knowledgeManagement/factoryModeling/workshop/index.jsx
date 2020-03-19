import React from 'react';
import Loadable from 'react-loadable';
import { Route, loading } from 'components';

export const baseUrl = '/knowledgeManagement/workshop';

const LogListLoadable = Loadable({ loader: () => import('../common/logList'), loading });

export const getWorkshopDetailRoute = path => (
  {
    path: `/knowledgeManagement${path}/workshop/detail/:workshopId`,
    breadcrumbName: '车间详情',
    component: Loadable({ loader: () => import('./workshopDetail'), loading }),
    routes: [
      {
        path: `/knowledgeManagement${path}/workshop/detail/:workshopId/edit/:workshopId`,
        breadcrumbName: '编辑车间',
        component: Loadable({ loader: () => import('./editWorkshop'), loading }),
      },
      {
        path: `/knowledgeManagement${path}/workshop/detail/:workshopId/logs/:id`,
        breadcrumbName: '操作记录',
        render: props => <LogListLoadable {...props} type="workshop" />,
      },
    ],
  }
);

const workshopDetailRoute = getWorkshopDetailRoute('');

export default ({
  path: '/knowledgeManagement/workshop',
  breadcrumbName: '车间定义',
  component: Loadable({ loader: () => import('./workshopList'), loading }),
  routes: [
    {
      path: '/knowledgeManagement/workshop/create',
      breadcrumbName: '创建车间',
      component: Loadable({ loader: () => import('./createWorkshop'), loading }),
    },
    {
      path: '/knowledgeManagement/workshop/edit/:workshopId',
      breadcrumbName: '编辑车间',
      component: Loadable({ loader: () => import('./editWorkshop'), loading }),
    },
    workshopDetailRoute,
  ],
});
