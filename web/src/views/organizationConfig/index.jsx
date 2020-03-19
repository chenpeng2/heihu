import React from 'react';
import Loadable from 'react-loadable';
import { Redirect } from 'react-router-dom';
import { loading } from 'components';

const router = [
  {
    path: '/organizationConfig',
    breadcrumbName: '系统配置',
    render: () => <Redirect to="/customProperty/material/materialCustomPropertyDetail" />,
    routes: [
      {
        path: '/customProperty/material',
        breadcrumbName: '自定义字段',
        render: () => <Redirect to="/customProperty/material/materialCustomPropertyDetail" />,
        routes: [
          {
            path: '/customProperty/material/materialCustomPropertyDetail',
            component: Loadable({ loader: () => import('./materialCustomProperty/detail'), loading }),
            breadcrumbName: '物料自定义字段',
          },
          {
            path: '/customProperty/material/materialCustomPropertyEdit',
            component: Loadable({ loader: () => import('./materialCustomProperty/edit'), loading }),
            breadcrumbName: '编辑物料自定义字段',
          },
        ],
      },
      {
        path: '/customProperty/saleOrder',
        breadcrumbName: '自定义字段',
        render: () => <Redirect to="/customProperty/saleOrder/detail" />,
        routes: [
          {
            path: '/customProperty/saleOrder/detail',
            component: Loadable({ loader: () => import('./customProperty/saleOrder/Detail'), loading }),
            breadcrumbName: '销售订单自定义字段',
          },
          {
            path: '/customProperty/saleOrder/edit',
            component: Loadable({ loader: () => import('./customProperty/saleOrder/Edit'), loading }),
            breadcrumbName: '编辑销售订单自定义字段',
          },
        ],
      },
      {
        path: '/customProperty/workOrder',
        breadcrumbName: '自定义字段',
        render: () => <Redirect to="/customProperty/workOrder/detail" />,
        routes: [
          {
            path: '/customProperty/workOrder/detail',
            component: Loadable({ loader: () => import('./customProperty/workOrder/Detail'), loading }),
            breadcrumbName: '计划工单自定义字段',
          },
          {
            path: '/customProperty/workOrder/edit',
            component: Loadable({ loader: () => import('./customProperty/workOrder/Edit'), loading }),
            breadcrumbName: '编辑计划工单自定义字段',
          },
        ],
      },
      {
        path: '/customLanguage',
        breadcrumbName: '自定义话术',
        component: Loadable({ loader: () => import('./customLanguage/list'), loading }),
      },
      {
        path: '/customCode',
        breadcrumbName: '自定义编码',
        render: () => <Redirect to="/customCode/list" />,
        routes: [
          {
            path: '/customCode/list',
            component: Loadable({ loader: () => import('./customCode/list'), loading }),
            breadcrumbName: '自定义编码列表',
          },
          {
            path: '/customCode/create',
            component: Loadable({ loader: () => import('./customCode/create'), loading }),
            breadcrumbName: '创建自定义编码',
          },
          {
            path: '/customCode/:id/edit',
            component: Loadable({ loader: () => import('./customCode/edit'), loading }),
            breadcrumbName: '编辑自定义编码',
          },
          {
            path: '/customCode/:id/detail',
            component: Loadable({ loader: () => import('./customCode/detail'), loading }),
            breadcrumbName: '自定义编码详情',
          },
        ],
      },
      {
        path: '/customRule',
        breadcrumbName: '自定义规则',
        render: () => <Redirect to="/customRule/list" />,
        routes: [
          {
            path: '/customRule/list',
            component: Loadable({ loader: () => import('./customRule/list'), loading }),
            breadcrumbName: '自定义规则列表',
          },
          {
            path: '/customRule/:id/edit',
            component: Loadable({ loader: () => import('./customRule/edit'), loading }),
            breadcrumbName: '编辑自定义规则',
          },
        ],
      },
    ],
  },
];

export default router;
