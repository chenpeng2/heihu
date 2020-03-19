import React from 'react';
import Loadable from 'react-loadable';
import { Route, loading } from 'components';

export const baseUrl = '/knowledgeManagement/prod-line';

const LogListLoadable = Loadable({ loader: () => import('../common/logList'), loading });

export const getProdLineDetailRoute = path => (
  {
    path: `/knowledgeManagement${path}/prod-line/detail/:prodLineId`,
    breadcrumbName: '产线详情',
    component: Loadable({ loader: () => import('./prodLineDetail'), loading }),
    routes: [
      {
        path: `/knowledgeManagement${path}/prod-line/detail/:prodLineId/edit/:prodLineId`,
        breadcrumbName: '编辑产线',
        component: Loadable({ loader: () => import('./editProdLine'), loading }),
      },
      {
        path: `/knowledgeManagement${path}/prod-line/detail/:prodLineId/logs/:id`,
        breadcrumbName: '操作记录',
        render: props => <LogListLoadable {...props} type="prodLine" />,
      },
    ],
  }
);

const prodLineRoute = getProdLineDetailRoute('');

export default ({
  path: '/knowledgeManagement/prod-line',
  breadcrumbName: '产线定义',
  component: Loadable({ loader: () => import('./prodLineList'), loading }),
  routes: [
    {
      path: '/knowledgeManagement/prod-line/create',
      breadcrumbName: '创建产线',
      component: Loadable({ loader: () => import('./createProdLine'), loading }),
    },
    prodLineRoute,
  ],
});
