import React from 'react';
import Loadable from 'react-loadable';
import { Redirect } from 'react-router-dom';
import { Route, loading } from 'components';

const TagTemplateDetail = Loadable({ loader: () => import('./tagTemplate/detail/index'), loading });
const TagTempalteList = Loadable({ loader: () => import('./tagTemplate/list'), loading });

const router = [
  {
    path: '/electronicTag',
    breadcrumbName: '电子标签',
    render: () => <Redirect to="/electronicTag/ruleDefinition/list" />,
    routes: [
      {
        path: '/electronicTag/ruleDefinition/list',
        breadcrumbName: '成品条码标签规则',
        component: Loadable({ loader: () => import('./ruleDefinition/ruleList'), loading }),
        routes: [
          {
            path: '/electronicTag/ruleDefinition/create',
            breadcrumbName: '创建',
            component: Loadable({
              loader: () => import('src/containers/electronicTags/ruleDefinition/create/createRule'),
              loading,
            }),
          },
          {
            path: '/electronicTag/ruleDefinition/edit/:id',
            breadcrumbName: '编辑',
            component: Loadable({
              loader: () => import('src/containers/electronicTags/ruleDefinition/edit/editRule'),
              loading,
            }),
          },
          {
            path: '/electronicTag/ruleDefinition/detail/:id',
            breadcrumbName: '详情',
            component: Loadable({
              loader: () => import('src/containers/electronicTags/ruleDefinition/detail/ruleDetail'),
              loading,
            }),
            routes: [
              {
                path: '/electronicTag/ruleDefinition/detail/:id/edit',
                breadcrumbName: '编辑',
                component: Loadable({
                  loader: () => import('src/containers/electronicTags/ruleDefinition/edit/editRule'),
                  loading,
                }),
              },
              {
                path: '/electronicTag/ruleDefinition/detail/:id/logs/operate',
                breadcrumbName: '操作记录',
                component: Loadable({
                  loader: () => import('src/containers/electronicTags/ruleDefinition/records/operationLog'),
                  loading,
                }),
              },
            ],
          },
        ],
      },
      {
        path: '/electronicTag/print',
        breadcrumbName: '成品条码标签打印',
        component: Loadable({ loader: () => import('./printElectronicTag/printPage'), loading }),
        routes: [
          {
            path: '/electronicTag/print/:id/operationHistory',
            breadcrumbName: '操作历史记录',
            component: Loadable({ loader: () => import('./printElectronicTag/operationHistory'), loading }),
          },
        ],
      },
      {
        path: '/electronicTag/template',
        breadcrumbName: '标签模板',
        component: TagTempalteList,
        routes: [
          {
            path: '/electronicTag/template/detail/:id',
            breadcrumbName: '业务类型模板详情',
            component: TagTemplateDetail,
          },
          {
            path: '/electronicTag/template/edit/:id',
            breadcrumbName: '编辑',
            component: Loadable({ loader: () => import('./tagTemplate/edit/index'), loading }),
          },
        ],
      },
    ],
  },
];

export default router;
