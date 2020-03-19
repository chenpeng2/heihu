import React from 'react';
import { Redirect } from 'react-router-dom';
import Loadable from 'react-loadable';
import { loading } from 'components';

const base = '/weighingManagement';

const router = [
  {
    path: base,
    breadcrumbName: '称量管理',
    key: 'weighingManagement',
    render: () => <Redirect to={`${base}/weighingTask`} />,
    routes: [
      {
        path: `${base}/weighingDefinition`,
        render: () => <Redirect to={`${base}/weighingDefinition`} />,
        breadcrumbName: '称量定义',
        key: 'weighingDefinitionList',
        component: Loadable({ loader: () => import('./weighingDefinition/list'), loading }),
        routes: [
          {
            path: `${base}/weighingDefinition/create`,
            breadcrumbName: '创建称量定义',
            key: 'createWeighingDefinition',
            component: Loadable({ loader: () => import('./weighingDefinition/create'), loading }),
          },
          {
            path: `${base}/weighingDefinition/edit/:id`,
            breadcrumbName: '编辑称量定义',
            key: 'editWeighingDefinition',
            component: Loadable({ loader: () => import('./weighingDefinition/edit'), loading }),
          },
          {
            path: `${base}/weighingDefinition/importLogs`,
            breadcrumbName: '导入日志',
            key: 'weighingDefinitionImportLogs',
            component: Loadable({ loader: () => import('./weighingDefinition/importLogs'), loading }),
            routes: [
              {
                path: `${base}/weighingDefinition/importLogs/detail/:id`,
                breadcrumbName: '导入详情',
                key: 'weighingDefinitionImportDetail',
                component: Loadable({ loader: () => import('./weighingDefinition/importDetail'), loading }),
              },
            ],
          },
        ],
      },
      {
        path: `${base}/weighingTask`,
        key: 'weighingTaskList',
        breadcrumbName: '称量任务',
        component: Loadable({ loader: () => import('./weighingTask/list'), loading }),
        render: () => <Redirect to={`${base}/weighingTask`} />,
        routes: [
          {
            path: `${base}/weighingTask/create`,
            breadcrumbName: '创建称量任务',
            key: 'createWeighingTask',
            component: Loadable({ loader: () => import('./weighingTask/create'), loading }),
          },
          {
            path: `${base}/weighingTask/edit/:id`,
            breadcrumbName: '编辑称量任务',
            key: 'editWeighingTask',
            component: Loadable({ loader: () => import('./weighingTask/edit'), loading }),
          },
          {
            path: `${base}/weighingTask/detail/:id`,
            breadcrumbName: '详情',
            key: 'weighingTaskDetail',
            component: Loadable({ loader: () => import('./weighingTask/detail'), loading }),
            routes: [
              {
                path: `${base}/weighingTask/detail/:id/log`,
                breadcrumbName: '操作日志',
                key: 'weighingTaskLog',
                component: Loadable({ loader: () => import('./weighingTask/log'), loading }),
              },
            ],
          },
        ],
      },
    ],
  },
];

export default router;
