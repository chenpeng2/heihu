import React from 'react';
import Loadable from 'react-loadable';
import { loading } from 'components';

export const baseUrl = '/knowledgeManagement/workstation';

const LogListLoadable = Loadable({ loader: () => import('../common/logList'), loading });

export const getWorkstationDetailRoute = path => (
  {
    path: `/knowledgeManagement${path}/workstation/detail/:id`,
    breadcrumbName: '工位详情',
    component: Loadable({ loader: () => import('./workstationDetail'), loading }),
    routes: [
      {
        path: `/knowledgeManagement${path}/workstation/detail/:id/edit/:id`,
        breadcrumbName: '编辑工位',
        component: Loadable({ loader: () => import('./editWorkstation'), loading }),
      },
      {
        path: `/knowledgeManagement${path}/workstation/detail/:id/logs/:id`,
        breadcrumbName: '操作记录',
        render: props => <LogListLoadable {...props} type="workstation" />,
      },
    ],
  }
);

const workstationDetailRoute = getWorkstationDetailRoute('');

export default ({
  path: '/knowledgeManagement/workstation',
  breadcrumbName: '工位定义',
  component: Loadable({ loader: () => import('./workstationList'), loading }),
  routes: [
    {
      path: '/knowledgeManagement/workstation/import-log',
      breadcrumbName: '导入日志',
      component: Loadable({ loader: () => import('./ImportLog'), loading }),
      routes: [
        {
          path: '/knowledgeManagement/workstation/import-log/:id',
          breadcrumbName: '日志详情',
          component: Loadable({ loader: () => import('./ImportDetail'), loading }),
        },
      ],
    },
    {
      path: '/knowledgeManagement/workstation/import-log',
      breadcrumbName: '导出日志',
      component: Loadable({ loader: () => import('./ExportLog'), loading }),
    },
    {
      path: '/knowledgeManagement/workstation/create',
      breadcrumbName: '创建工位',
      component: Loadable({ loader: () => import('./createWorkstation'), loading }),
    },
    {
      path: '/knowledgeManagement/workstation/edit/:id',
      breadcrumbName: '编辑工位',
      component: Loadable({ loader: () => import('./editWorkstation'), loading }),
    },
    workstationDetailRoute,
  ],
});
